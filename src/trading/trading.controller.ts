import { Body, Controller, Logger, Post, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { JwtGuard } from '../auth/guard';
import { GetUser } from '../auth/decorator';
import { TradeIntentDto } from './dto';
import { TradingService } from './trading.service';
import { ApiBearerAuth, ApiForbiddenResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';

@UseGuards(JwtGuard)
@ApiTags('trading')
@ApiBearerAuth('Authorization')
@Controller('trading')
export class TradingController {
    private logger: Logger = new Logger('StickerController');
    
    constructor(private tradingService: TradingService) {}

    @Post('add')
    @ApiOkResponse({description: 'Post a new Trade intent'})
    @ApiUnauthorizedResponse({description: 'Unauthorized, provide a valid access_token'})
    @ApiForbiddenResponse({description: 'Forbidden'})
    add(@GetUser() user: User, @GetUser('email') email: string, @Body() dto: TradeIntentDto) {
        this.logger.log(`User ${email} made a POST /trading/add request`);
        return this.tradingService.add(user.id, dto);
    }
}
