import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBadRequestResponse, ApiCreatedResponse, ApiForbiddenResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthSignInDto, AuthSignUpDto } from './dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('signup')
    @ApiCreatedResponse({description: 'User signed up, use access_token for future requests'})
    @ApiBadRequestResponse({description: 'Bad request'})
    @ApiForbiddenResponse({description: 'Forbidden'})
    signup(@Body() dto: AuthSignUpDto) {
        return this.authService.signup(dto);
    }

    @HttpCode(HttpStatus.OK)
    @Post('signin')
    @ApiOkResponse({description: 'User signed in, use access_token for future requests'})
    @ApiBadRequestResponse({description: 'Bad request'})
    @ApiForbiddenResponse({description: 'Forbidden'})
    signin(@Body() dto: AuthSignInDto) {
        return this.authService.signin(dto);
    }
}
