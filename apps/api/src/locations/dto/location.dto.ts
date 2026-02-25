import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateGovernorateDto {
    @IsString()
    @IsNotEmpty()
    nameAr!: string;

    @IsString()
    @IsNotEmpty()
    nameEn!: string;
}

export class CreateAreaDto {
    @IsUUID()
    @IsNotEmpty()
    governorateId!: string;

    @IsString()
    @IsNotEmpty()
    nameAr!: string;

    @IsString()
    @IsNotEmpty()
    nameEn!: string;
}

export class UpdateAreaDto {
    @IsOptional()
    @IsString()
    nameAr?: string;

    @IsOptional()
    @IsString()
    nameEn?: string;
}
