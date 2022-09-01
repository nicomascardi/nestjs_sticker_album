import { ApiProperty } from "@nestjs/swagger";
import { IsHexadecimal, IsNotEmpty } from "class-validator";

export class StickerInstanceUpdateDto {
    @ApiProperty({
        type: String,
        description: 'StickerInstance id'
    })
    @IsNotEmpty()
    @IsHexadecimal()
    id: string
}