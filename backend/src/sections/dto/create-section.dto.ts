import { IsDate, IsDateString, IsString, Length } from "class-validator";

export class CreateSectionDto{
    @IsString({message: 'Должно быть строкой'})
    readonly section: string;

    @IsDateString({})
    readonly datetime: string;

    @IsString({message: 'Должно быть строкой'})
    readonly status: string;
}