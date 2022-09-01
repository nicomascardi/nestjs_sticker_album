import { ForbiddenException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "../../prisma/prisma.service";
import { pick } from 'lodash'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(config: ConfigService, private prisma: PrismaService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: config.get('JWT_SECRET')
        })
    }

    async validate(payload: {sub: string, email: string}) {
        const user = await this.prisma.user.findUnique({
            where: {
                id: payload.sub
            }
        });
        if (!user) {
            throw new ForbiddenException('User has been removed');
        }
        return pick(user, [
            'id', 
            'email', 
            'firstName', 
            'lastName', 
            'createdAt', 
            'updatedAt'
        ]);
    }
}