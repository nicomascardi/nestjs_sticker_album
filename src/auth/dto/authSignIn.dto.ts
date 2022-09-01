import { ApiProperty } from "@nestjs/swagger"
import { IsEmail, IsNotEmpty, IsString } from "class-validator"

export class AuthSignInDto {
    @IsEmail()
    @IsNotEmpty()
    @ApiProperty({
        type: String,
        description: 'User email',
        default: 'joedoe@email.com'
    })
    email: string

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        type: String,
        description: 'User password',
        default: 'p4ssw0rd'
    })
    password: string
}