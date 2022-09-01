import { Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { JwtGuard } from '../auth/guard';
import { GetUser } from '../auth/decorator';
import { UserService } from './user.service';
import { ApiBearerAuth, ApiForbiddenResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';

@UseGuards(JwtGuard)
@ApiTags('user')
@ApiBearerAuth('Authorization')
@Controller('user')
export class UserController {
    constructor(private userService: UserService){}

    @Get('me')
    @ApiOkResponse({description: 'Return user personal information'})
    @ApiUnauthorizedResponse({description: 'Unauthorized, provide a valid access_token'})
    @ApiForbiddenResponse({description: 'Forbidden'})
    me(@GetUser() user: User, @GetUser('email') email: string) {
        console.log(`User ${email} made a GET /user/me request`);
        return user;
    }

    @Get('data')
    @ApiOkResponse({description: 'Return user data'})
    @ApiUnauthorizedResponse({description: 'Unauthorized, provide a valid access_token'})
    @ApiForbiddenResponse({description: 'Forbidden'})
    data(@GetUser() user: User, @GetUser('email') email: string) {
        console.log(`User ${email} made a GET /user/data request`);
        return this.userService.getData(user.id);
    }

    @Get('package')
    @ApiOkResponse({description: 'Return package containing a list of stickers'})
    @ApiUnauthorizedResponse({description: 'Unauthorized, provide a valid access_token'})
    @ApiForbiddenResponse({description: 'Forbidden'})
    getPackage(@GetUser() user: User, @GetUser('email') email: string) {
        console.log(`User ${email} made a GET /user/package request`);
        return this.userService.getPackage(user.id);
    }

    @HttpCode(HttpStatus.OK)
    @Post('package/add')
    @ApiOkResponse({description: 'Add a new sticker package'})
    @ApiUnauthorizedResponse({description: 'Unauthorized, provide a valid access_token'})
    @ApiForbiddenResponse({description: 'Forbidden'})
    addPackage(@GetUser() user: User, @GetUser('email') email: string) {
        console.log(`User ${email} made a POST /user/package/add request`);
        return this.userService.addPackage(user.id);
    }
}
