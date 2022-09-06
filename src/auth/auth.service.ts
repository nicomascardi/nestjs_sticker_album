import { ForbiddenException, Injectable } from '@nestjs/common';
import { AuthSignUpDto } from './dto/authSignUp.dto';
import * as argon from 'argon2';
import { ConfigService } from '@nestjs/config';
import { JwtService } from "@nestjs/jwt";
import { UserService } from '../user/user.service';
import { AuthSignInDto } from './dto';
import { TokenExpiredError }  from 'jsonwebtoken'
import { User } from '@prisma/client';
@Injectable()
export class AuthService {
    constructor(
        private jwt: JwtService,
        private config: ConfigService,
        private userService: UserService
    ) {}

    /**
     * Sign up user
     * 
     * @param dto 
     * @returns 
     */
    async signup(dto: AuthSignUpDto) {
        const hash = await argon.hash(dto.password);
        const user = await this.userService.create(dto.email, hash);
        return this.signToken(user.id, user.email);
    }

    /**
     * Sign in user
     * 
     * @param dto 
     * @returns 
     */
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
    
    /**
     * Validate jwt token and return user
     * 
     * @param token 
     * @returns 
     */
    async verifyToken(token: string): Promise<User> {
        try {
            const decodedToken = await this.jwt.verifyAsync(token, {secret: this.config.get('JWT_SECRET')});
            const user = await this.userService.getById(decodedToken.sub);
            if (!user) {
                throw new ForbiddenException('User has been removed');
            }
            return user;
        } catch(error) {
            if (error instanceof TokenExpiredError) {
                throw new ForbiddenException('Token has expired');
            }
        }
    }
    /**
     * Create jwt token
     * 
     * @param userId 
     * @param email 
     * @returns 
     */
    async signToken(userId: string, email: string): Promise<{access_token: string}> {
        const payload ={
            sub: userId,
            email
        }

        const secret = this.config.get('JWT_SECRET');

        const token = await this.jwt.signAsync(payload, {
            expiresIn: '1h',
            secret
        });

        return {
            access_token: token
        }
    }
}
