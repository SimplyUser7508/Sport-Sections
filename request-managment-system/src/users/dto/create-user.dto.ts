import { IsEmail, IsString, Length } from "class-validator";

export class CreateUserDto{
    @IsString({message: 'Должно быть строкой'})
    @IsEmail({}, {message: 'Некорректный email'})
    readonly email: string;

    @IsString({message: 'Должно быть строкой'})
    @Length(8, 24, {message: 'Более 8 символов и менее 24'})
    readonly password: string;

    @IsString({message: 'Должно быть строкой'})
    @Length(3, 20, {message: 'Более 3 символов и менее 20'})
    readonly username: string;
}