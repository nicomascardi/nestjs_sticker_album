import { Body, Controller, HttpCode, HttpStatus, Logger, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiForbiddenResponse, ApiOkResponse, ApiParam, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard';
import { StickerInstanceUpdateDto } from './dto';
import { StickerService } from './sticker.service';

@UseGuards(JwtGuard)
@ApiTags('sticker')
@ApiBearerAuth('Authorization')
@Controller('sticker')
export class StickerController {
    private logger: Logger = new Logger('StickerController');
    
    constructor(private stickerService: StickerService) {}

    @HttpCode(HttpStatus.OK)
    @Post('putInAlbum')
    @ApiOkResponse({description: 'Put a sticker in the Album'})
    @ApiUnauthorizedResponse({description: 'Unauthorized, provide a valid access_token'})
    @ApiForbiddenResponse({description: 'Forbidden'})
    putInAlbum(@GetUser() user: User, @GetUser('email') email: string, @Body() dto: StickerInstanceUpdateDto) {
        this.logger.log(`User ${email} made a POST /sticker/putInAlbum request`);
        return this.stickerService.updateStickerInstanceStatus(user.id, dto.id, 'Album');
    }

    @HttpCode(HttpStatus.OK)
    @Post('putInSwap')
    @ApiOkResponse({description: 'Put a sticker in the Swap stack'})
    @ApiUnauthorizedResponse({description: 'Unauthorized, provide a valid access_token'})
    @ApiForbiddenResponse({description: 'Forbidden'})
    putInSwap(@GetUser() user: User, @GetUser('email') email: string, @Body() dto: StickerInstanceUpdateDto) {
        this.logger.log(`User ${email} made a POST /sticker/putInSwap request`);
        return this.stickerService.updateStickerInstanceStatus(user.id, dto.id, 'Swap');
    }

    @HttpCode(HttpStatus.OK)
    @Post('putInNew')
    @ApiOkResponse({description: 'Put a sticker in the New stack'})
    @ApiUnauthorizedResponse({description: 'Unauthorized, provide a valid access_token'})
    @ApiForbiddenResponse({description: 'Forbidden'})
    putInNew(@GetUser() user: User, @GetUser('email') email: string, @Body() dto: StickerInstanceUpdateDto) {
        this.logger.log(`User ${email} made a POST /sticker/putInNew request`);
        return this.stickerService.updateStickerInstanceStatus(user.id, dto.id, 'New');
    }
}
