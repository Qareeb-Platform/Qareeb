import { Module } from '@nestjs/common';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { AuthModule } from '../auth/auth.module';
import { CloudinaryModule } from '../modules/cloudinary/cloudinary.module';

@Module({
    imports: [AuthModule, CloudinaryModule],
    controllers: [MediaController],
    providers: [MediaService],
    exports: [MediaService],
})
export class MediaModule { }
