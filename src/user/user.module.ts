import { Module } from '@nestjs/common';
import { StickerModule } from '../sticker/sticker.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [StickerModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService]
})
export class UserModule {}
