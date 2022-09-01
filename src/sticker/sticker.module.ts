import { Module } from '@nestjs/common';
import { StickerService } from './sticker.service';
import { StickerController } from './sticker.controller';

@Module({
  providers: [StickerService],
  exports: [StickerService],
  controllers: [StickerController]
})
export class StickerModule {}
