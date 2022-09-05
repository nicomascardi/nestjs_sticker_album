import { Body, Controller, Logger, Post, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { JwtGuard } from '../auth/guard';
import { GetUser } from '../auth/decorator';
import { TradeIntentDto } from './dto';
import { TradingService } from './trading.service';

@UseGuards(JwtGuard)
@Controller('trading')
export class TradingController {
    private logger: Logger = new Logger('StickerController');
    
    constructor(private tradingService: TradingService) {}

    @Post('add')
    add(@GetUser() user: User, @GetUser('email') email: string, @Body() dto: TradeIntentDto) {
        this.logger.log(`User ${email} made a POST /trading/add request`);
        return this.tradingService.add(user.id, dto);
    }
}
