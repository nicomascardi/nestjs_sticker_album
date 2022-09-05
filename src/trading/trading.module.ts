import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { StickerModule } from '../sticker/sticker.module';
import { UserModule } from '../user/user.module';
import { TradingGateway } from './gateway/trading.gateway';
import { TradingService } from './trading.service';

@Module({
  imports: [StickerModule, AuthModule, UserModule],
  providers: [TradingGateway, TradingService]
})
export class TradingModule {}
