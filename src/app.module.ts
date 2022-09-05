import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { StickerModule } from './sticker/sticker.module';
import { TradingService } from './trading/trading.service';
import { TradingModule } from './trading/trading.module';
import { TradingGateway } from './trading/gateway';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    AuthModule, 
    UserModule, 
    PrismaModule, 
    StickerModule, 
    TradingModule,
  ]
})
export class AppModule {}
