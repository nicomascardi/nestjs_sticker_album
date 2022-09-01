import { ForbiddenException, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { StickerService } from '../sticker/sticker.service';
import { PrismaService } from '../prisma/prisma.service';
import { UserDataDto } from './dto/userData.dto';
import { StickerInstanceDto } from 'src/sticker/dto';

const INITIAL_PACKAGES: number = 1;
const ALBUMS_PER_USER = 2;

@Injectable()
export class UserService {
    constructor(
        private prisma: PrismaService,
        private stickerService: StickerService
    ) {}

    /**
     * Create new user
     * 
     * @param email 
     * @param hash 
     * @returns 
     */
    async create(email: string, hash: string): Promise<User> {
        try {
            const user = await this.prisma.user.create({
                data: {
                    email,
                    hash,
                    packages: INITIAL_PACKAGES
                }
            });
            // Define a better strategy for adding new StickersInstances to the general deck
            await this.stickerService.generateStickerInstanceSet(ALBUMS_PER_USER);
            return user;
        } catch(error) {
            if (error instanceof PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    throw new ForbiddenException('Credentials taken');
                }
            }
            throw error;
        }
    }

    /**
     * Get User by email
     * 
     * @param email 
     * @returns 
     */
    async getByEmail(email: string): Promise<User> {
        return await this.prisma.user.findUnique({
            where: {
                email
            }
        });
    }

    /**
     * Get User by id
     * 
     * @param id 
     * @returns 
     */
     async getById(id: string): Promise<User> {
        return await this.prisma.user.findUnique({
            where: {
                id
            }
        });
    }

    /**
     * Get User data
     * 
     * @param id 
     * @returns 
     */
    async getData(id: string): Promise<UserDataDto> {
        const user = await this.getById(id);
        const stickerInstancesDto = await this.stickerService.getStickerInstancesDtoByUserId(id);
        return {
            packages: user.packages,
            stickers: stickerInstancesDto
        }
    }

    /**
     * Assign a package of StickerInstances to the user
     * Return the StickerInstances
     * Validate that the user has pending packages to open
     * 
     * @param id 
     * @returns 
     */
    async getPackage(id: string): Promise<{stickers: StickerInstanceDto[]}> {
        const user = await this.getById(id);
        if (user.packages === 0) {
            throw new ForbiddenException("User has no pending packages to open");
        }
        const stickers = await this.stickerService.assignPackageToUser(user.id);
        await this.prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                packages: user.packages - 1
            }
        });
        return { stickers };
    }

    /**
     * Increments in one the number of pending packages
     * 
     * @param id 
     * @returns 
     */
    async addPackage(id: string): Promise<{packages: number}> {
        const user = await this.getById(id);
        const packages = user.packages + 1;
        await this.prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                packages
            }
        });

        return { packages }
    }
}
