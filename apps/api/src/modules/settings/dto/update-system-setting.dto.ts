import { IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateSystemSettingDto {
    @IsOptional()
    @IsString()
    value?: string;

    @IsOptional()
    @IsString()
    @IsIn(['WHATSAPP', 'CLOUDINARY', 'GENERAL'])
    group?: string;

    @IsOptional()
    @IsBoolean()
    isSecret?: boolean;
}
