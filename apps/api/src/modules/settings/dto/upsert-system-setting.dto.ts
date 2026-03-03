import { IsBoolean, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpsertSystemSettingDto {
    @IsString()
    @MaxLength(120)
    key!: string;

    @IsString()
    value!: string;

    @IsString()
    @IsIn(['WHATSAPP', 'CLOUDINARY', 'GENERAL'])
    group!: string;

    @IsBoolean()
    @IsOptional()
    isSecret?: boolean;
}
