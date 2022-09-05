import { ForbiddenException, Injectable } from '@nestjs/common';
import { StickerService } from '../sticker/sticker.service';
import { PrismaService } from '../prisma/prisma.service';
import { TradeAckDto, TradeIntentDto } from './dto';

@Injectable()
export class TradingService {
    constructor(private prisma: PrismaService, private stickerService: StickerService) {}
    
    async add(userId: string, dto: TradeIntentDto) {
        const stickerInstance = await this.stickerService.validateStickerAccessPermission(userId, dto.offerStickerInstanceId);

        if (stickerInstance.stickerId !== dto.offerStickerId) {
            throw new ForbiddenException("The type of sticker doesn't match the offered sticker");
        }
       
        const pendingTrade = await this.prisma.trade.findFirst({
            where: {
                AND: [
                    { NOT: {userId: userId} },
                    { offerStickerId: dto.wantStickerId },
                    { associatedTradeId: null }
                ]
            }
        });
        if (pendingTrade) {
            const newTrade = await this.prisma.trade.create({
                data: {
                    userId,
                    associatedTradeId: pendingTrade.id,
                    offerStickerId: dto.offerStickerId,
                    offerStickerInstanceId: dto.offerStickerInstanceId,
                    wantStickerId: dto.wantStickerId,
                    receivedStickerInstanceId: pendingTrade.offerStickerInstanceId,
                    closedAt: new Date(),
                    ackedAt: null
                }
            });
            await this.prisma.trade.update({
                where: {
                    id: pendingTrade.id
                },
                data: {
                    associatedTradeId: newTrade.id,
                    receivedStickerInstanceId: newTrade.offerStickerInstanceId,
                    closedAt: new Date()
                }
            });
            await this.stickerService.swapStickers(
                newTrade.userId, 
                newTrade.offerStickerInstanceId, 
                pendingTrade.userId, 
                pendingTrade.offerStickerInstanceId
            );
        } else {
            await this.prisma.trade.create({
                data: {
                    userId,
                    associatedTradeId: null,
                    offerStickerId: dto.offerStickerId,
                    offerStickerInstanceId: dto.offerStickerInstanceId,
                    wantStickerId: dto.wantStickerId,
                    receivedStickerInstanceId: null,
                    closedAt: null,
                    ackedAt: null
                }
            });
        }
    }

    async getNonAckedTradesByUserId(userId: string): Promise<TradeAckDto[]> {
        const tradesDto: TradeAckDto[] = [];
        const trades = await this.prisma.trade.findMany({
            where: {
                AND: [
                    { userId },
                    { NOT: { associatedTradeId: null } },
                    { ackedAt: null }
                ]
            }
        });

        for (const trade of trades) {
            tradesDto.push({
                tradeId: trade.id,
                sentStickerInstanceId: trade.offerStickerInstanceId,
                receivedStickerInstanceId: trade.receivedStickerInstanceId
            });
        }
        return tradesDto;
    }

    async ackTrade(userId: string, tradeId: string) {
        const trade = await this.prisma.trade.findUnique({
            where: {
                id: tradeId
            }
        });

        if (!trade || trade.userId !== userId) {
            throw new ForbiddenException("Trade doesn't exist or user has no access");
        }
        
        await this.prisma.trade.update({
            where: {
                id:  tradeId
            },
            data: {
                ackedAt: new Date()
            }
        })
    }
}
