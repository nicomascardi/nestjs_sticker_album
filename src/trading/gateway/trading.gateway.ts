import { Logger, UnauthorizedException } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WsResponse } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { AuthService } from '../../auth/auth.service';
import { UserService } from '../../user/user.service';
import { TradeAckDto } from '../dto';
import { TradingService } from '../trading.service';

@WebSocketGateway({ namespace: '/trading' })
export class TradingGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect{
  private logger: Logger = new Logger('TradingGateway')
  
  constructor(
    private tradingService: TradingService, 
    private authService: AuthService,
    private userService: UserService
    ) {}
  
  afterInit(server: any) {
    this.logger.log('Initialized');
  }

  async handleConnection(socket: Socket) {
    this.logger.log(`Client connected: ${socket.id}`);
    try {
      const user = await this.authService.verifyToken(socket.handshake.headers.authorization);
      console.log(`user connected ${user.email}`);
    } catch(error) {
      return this.disconnect(socket);
    }
  }

  private disconnect(socket: Socket) {
    socket.emit('Error', new UnauthorizedException('User has no access'));
    socket.disconnect();
  }

  handleDisconnect(client: any) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('pullTrades')
  async handlePullTradesEvent(socket: Socket, text: string): Promise<WsResponse<TradeAckDto []>> {
    try {
      const user = await this.authService.verifyToken(socket.handshake.headers.authorization);
      const trades = await this.tradingService.getNonAckedTradesByUserId(user.id);
      return { event: 'pushTrades', data: trades};
    } catch(error) {
      this.disconnect(socket);
    }
  }

  @SubscribeMessage('ackTrade')
  async handleAckTradeEvent(socket: Socket, tradeId: string): Promise<void> {
    try {
      const user = await this.authService.verifyToken(socket.handshake.headers.authorization);
      await this.tradingService.ackTrade(user.id, tradeId);
    } catch(error) {
      this.disconnect(socket);
    }
  }
}
