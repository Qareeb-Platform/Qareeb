import { IsString, IsOptional, IsNumber, IsUrl, IsArray, IsNotEmpty } from 'class-validator';

export class CreateImamDto {
    @IsString()
    @IsNotEmpty()
    imam_name!: string;

    @IsString()
    @IsNotEmpty()
    mosque_name!: string;

    @IsString()
    @IsNotEmpty()
    governorate!: string;

    @IsString()
    @IsNotEmpty()
    city!: string;

    @IsOptional()
    @IsString()
    district?: string;

    @IsNumber()
    @IsNotEmpty()
    lat!: number;

    @IsNumber()
    @IsNotEmpty()
    lng!: number;

    @IsString()
    @IsNotEmpty()
    whatsapp!: string;

    @IsOptional()
    @IsUrl()
    recitation_url?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    media_ids?: string[];
}

export class ImamQueryDto {
    @IsOptional()
    @IsNumber()
    lat?: number;

    @IsOptional()
    @IsNumber()
    lng?: number;

    @IsOptional()
    @IsNumber()
    radius?: number;

    @IsOptional()
    @IsString()
    governorate?: string;

    @IsOptional()
    @IsString()
    city?: string;

    @IsOptional()
    @IsString()
    district?: string;

    @IsOptional()
    @IsNumber()
    page?: number;

    @IsOptional()
    @IsNumber()
    limit?: number;

    @IsOptional()
    @IsString()
    status?: string;
}
