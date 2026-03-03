import { Module } from '@nestjs/common';
import { SettingsModule } from '../settings/settings.module';
import { CloudinaryService } from './cloudinary.service';

@Module({
    imports: [SettingsModule],
    providers: [CloudinaryService],
    exports: [CloudinaryService],
})
export class CloudinaryModule { }
