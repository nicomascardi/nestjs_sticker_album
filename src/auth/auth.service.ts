import { ForbiddenException, Injectable } from '@nestjs/common';
import { AuthSignUpDto } from './dto/authSignUp.dto';
import * as argon from 'argon2';
import { ConfigService } from '@nestjs/config';
import { JwtService } from "@nestjs/jwt";
import { UserService } from '../user/user.service';
import { AuthSignInDto } from './dto';

@Injectable()
export class AuthService {
    constructor(
        private jwt: JwtService,
        private config: ConfigService,
        private userService: UserService
    ) {}
    async signup(dto: AuthSignUpDto) {
        const hash = await argon.hash(dto.password);
        const user = await this.userService.create(dto.email, hash);
        return this.signToken(user.id, user.email);
    }

    async signin(dto: AuthSignInDto) {
        const user = await this.userService.getByEmail(dto.email);

        if (!user) {
            throw new ForbiddenException('Credentials incorrect');
        }

        const pwMatches = await argon.verify(user.hash, dto.password);

        if (!pwMatches) {
            throw new ForbiddenException('Credentials incorrect');
        }
        return this.signToken(user.id, user.email);
    }

    async signToken(userId: string, email: string): Promise<{access_token: string}> {
        const payload ={
            sub: userId,
            email
        }

        const secret = this.config.get('JWT_SECRET');

        const token = await this.jwt.signAsync(payload, {
            expiresIn: '6h',
            secret
        });

        return {
            access_token: token
        }
    }
}
