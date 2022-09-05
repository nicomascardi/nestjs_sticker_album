import { IsHexadecimal, IsNotEmpty } from "class-validator";

export class TradeIntentDto {
    @IsNotEmpty()
    @IsHexadecimal()
    offerStickerInstanceId: string;
    
    @IsNotEmpty()
    @IsHexadecimal()
    offerStickerId: string;

    @IsNotEmpty()
    @IsHexadecimal()
    wantStickerId: string;
}