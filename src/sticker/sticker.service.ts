import { ForbiddenException, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Sticker, StickerInstance, StickerInstanceStatus, Trade } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { StickerInstanceDto } from './dto';
import { uniqBy, orderBy } from "lodash";

const PACKAGE_SIZE: number = 5;

@Injectable()
export class StickerService implements OnModuleInit{
    private logger: Logger = new Logger('StickerService');
    private stickers: Sticker[];
    
    constructor(private prisma: PrismaService) {}

    /**
     * Initilization, gets all possible stickers and put them in cache
     */
    async onModuleInit(): Promise<void> {
        this.logger.log('Caching stickers...');
        await this.getStickers();
        this.logger.log(`Stickers found: ${this.stickers.length}`);
    }

    /**
     * Create {count} sets of StickerInstances and add it to the general deck
     * 
     * @param count 
     */
     async generateStickerInstanceSet(count: number): Promise<void> {
        const stickers = await this.getStickers();

        for (let i = 1; i <= count; i++) {
            const genId = randomUUID();
            const stickerInstances = stickers.map(
                (sticker) => {
                    return {
                        genId,
                        stickerId: sticker.id,
                        userId: null
                    } 
                }
            );
            await this.prisma.stickerInstance.createMany({
                data: stickerInstances
            });
        }
    }

    /**
     * Get a package of (PACKAGE_SIZE) StickerInstances from the general deck and assign it to the user
     * 
     * @param userId 
     * @returns 
     */
    async assignPackageToUser(userId: string): Promise<StickerInstanceDto[]> {
        const stickers = await this.getStickers();
        const shuffledStickers = stickers.sort(() => 0.5 - Math.random());
        const selectedStickers = shuffledStickers.slice(0, PACKAGE_SIZE).map(
            (sticker) => {
                return sticker.id 
            }
        );
        const stickerInstances = await this.prisma.stickerInstance.findMany({
            where: {
                AND: [
                    { userId: null },
                    { stickerId: { in: selectedStickers } }
                ]
            }
        });
        const shuffledStickerInstances = stickerInstances.sort(() => 0.5 - Math.random());
        const selectedStickerInstances = uniqBy(shuffledStickerInstances, 'stickerId')
        const selectedStickerInstancesIds = selectedStickerInstances.map(
            (stickerInstance) => {
                return stickerInstance.id 
            }
        );
        
        await this.prisma.stickerInstance.updateMany({
            where: {
                id: { in: selectedStickerInstancesIds }
            },
            data: {
                userId
            }
        });
        
        return await this.fillStickerInstanceDto(selectedStickerInstances);
    }

    /**
     * Get StickerInstancesDto for a given user
     * 
     * @param userId 
     * @returns 
     */
    async getStickerInstancesDtoByUserId(userId: string): Promise<StickerInstanceDto[]> {
        const stickerInstances = await this.prisma.stickerInstance.findMany({
            where: {
                userId
            }
        });
        return this.fillStickerInstanceDto(stickerInstances);
    }

    /**
     * Update the status of a given StickeInstance
     * 
     * @param userId
     * @param stickerInstanceIdd 
     * @param status 
     */
    async updateStickerInstanceStatus(userId: string, stickerInstanceId: string, status: StickerInstanceStatus) {
        
        const stickerInstance = await this.validateStickerAccessPermission(userId, stickerInstanceId);

        if (stickerInstance.status === 'Album') {
            throw new ForbiddenException('Sticker already in Album');
        }

        if (status === 'Album') {
            if (await this.isStickerAlreadyInAlbumInDb(stickerInstance.stickerId, userId)) {
                throw new ForbiddenException('The slot for this type of sticker is already taken in the album');
            }
        }

        this.checkForPendingExchanges();

        await this.prisma.stickerInstance.update({
            where: {
                id: stickerInstanceId
            },
            data: {
                status
            }
        });
    }

    /**
     * Validate StickerInstance existence and if the user owns it
     * 
     * @param userId 
     * @param stickerInstanceId 
     * @returns 
     */
    async validateStickerAccessPermission(userId: string, stickerInstanceId: string) {
        const stickerInstance = await this.prisma.stickerInstance.findUnique({
            where: { 
                id: stickerInstanceId
            }
        });

        if (stickerInstance === null || stickerInstance.userId !== userId) {
            throw new ForbiddenException('Sticker does not exist or user has no access');
        }
        return stickerInstance;
    }

    async swapStickers(sourceUserId: string, sourceStickerInstanceId: string, destinationUserId: string, destinationStickerInstanceId: string) {
        await this.prisma.stickerInstance.update({
            where: {
                id: sourceStickerInstanceId
            },
            data: {
                userId: destinationUserId
            }
        });

        await this.prisma.stickerInstance.update({
            where: {
                id: destinationStickerInstanceId
            },
            data: {
                userId: sourceUserId
            }
        });
    }
    /**
     * Fill StickerInstancesDto structure
     * 
     * @param stickerInstances 
     * @returns 
     */
    private async fillStickerInstanceDto(stickerInstances: StickerInstance[]): Promise<StickerInstanceDto[]> {
        const stickers = await this.getStickers();
        const stickerInstancesDto: StickerInstanceDto[] = [];
        for (const stickerInstance of stickerInstances) {
            const sticker = stickers.find((s: Sticker) => {return s.id === stickerInstance.stickerId});
            stickerInstancesDto.push({
                id: stickerInstance.id,
                genId: stickerInstance.genId,
                stickerId: stickerInstance.stickerId,
                firstName: sticker.firstname,
                lastName: sticker.lastname,
                age: sticker.age,
                height: sticker.height,
                weight: sticker.weight,
                nationality: sticker.nationality,
                photo: sticker.photo,
                status: stickerInstance.status,
                alreadyInAlbum: this.isStickerAlreadyInAlbum(stickerInstance.stickerId, stickerInstances)
            });
        }
        return orderBy(stickerInstancesDto, ['nationality', 'lastName', 'firstName'], ['asc', 'asc', 'asc']);
    }

    /**
     * Get all possible Stickers from cache
     * 
     * @returns 
     */
     private async getStickers(): Promise<Sticker[]> {
        if (!this.stickers) {
            this.stickers = await this.prisma.sticker.findMany();
        }
        return this.stickers;
    }

    /**
     * Validate if a sticker is already in the album (in the DB)
     * 
     * @param stickerId 
     * @returns 
     */
    private async isStickerAlreadyInAlbumInDb(stickerId: string, userId: string): Promise<boolean> {
        const repeated = await this.prisma.stickerInstance.findFirst({
            where: {
                AND: [
                    { stickerId: stickerId },
                    { userId },
                    { status: 'Album' }
                ]
            }
        });

        if (repeated) {
            return true;
        }
        return false;
    }

    /**
     * Validate if a sticker is already in the album 
     * 
     * @param stickerId
     * @param stickers 
     * @returns 
     */
    private isStickerAlreadyInAlbum(stickerId: string, stickers: StickerInstance[] ): boolean {
        const repeated = stickers.find((si) => {return si.stickerId === stickerId && si.status === 'Album'});
        if (repeated) {
            return true;
        }
        return false;
    }

    private async checkForPendingExchanges() {
        //TODO: implement this
    }
}
