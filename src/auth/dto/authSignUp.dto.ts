import { ApiProperty } from "@nestjs/swagger"
import { IsEmail, IsNotEmpty, IsString } from "class-validator"

export class AuthSignUpDto {
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

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        type: String,
        description: 'User first name',
        default: 'Joe'
    })
    firstName: string

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        type: String,
        description: 'User last name',
        default: 'Doe'
    })
    lastName: string
}