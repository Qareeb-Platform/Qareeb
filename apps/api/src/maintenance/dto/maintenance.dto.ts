import { IsString, IsOptional, IsNumber, IsArray, IsEnum, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export enum MaintenanceType {
    PLUMBING = 'Plumbing',
    ELECTRICAL = 'Electrical',
    CARPENTRY = 'Carpentry',
    PAINTING = 'Painting',
    AC_REPAIR = 'AC Repair',
    CLEANING = 'Cleaning',
    OTHER = 'Other',
}

export class CreateMaintenanceDto {
    @IsString()
    @IsNotEmpty()
    mosque_name!: string;

    @IsString()
    @IsNotEmpty()
    governorate!: string;

    @IsString()
    @IsNotEmpty()
    city!: string;

    @IsString()
    @IsOptional()
    district?: string;

    @IsNumber()
    @IsNotEmpty()
    lat!: number;

    @IsNumber()
    @IsNotEmpty()
    lng!: number;

    @IsArray()
    @IsEnum(MaintenanceType, { each: true })
    @IsNotEmpty()
    maintenance_types!: MaintenanceType[];

    @IsString()
    @IsNotEmpty()
    description!: string;

    @IsNumber()
    @IsOptional()
    estimated_cost_min?: number;

    @IsNumber()
    @IsOptional()
    estimated_cost_max?: number;

    @IsString()
    @IsNotEmpty()
    whatsapp!: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    media_ids?: string[];
}

export class MaintenanceQueryDto {
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    lat?: number;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    lng?: number;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    radius?: number;

    @IsOptional()
    @IsEnum(MaintenanceType)
    type?: MaintenanceType;

    @IsOptional()
    @IsString()
    governorate?: string;

    @IsOptional()
    @IsString()
    city?: string;

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
