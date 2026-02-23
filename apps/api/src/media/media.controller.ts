import { Controller, Post, Delete, Param, UseGuards } from '@nestjs/common';
import { MediaService } from './media.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('media')
export class MediaController {
    constructor(private readonly mediaService: MediaService) { }

    @Post('sign')
    getSignedUploadParams() {
        return this.mediaService.generateSignedUploadParams();
    }

    @Delete(':publicId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('super_admin', 'full_reviewer')
    deleteAsset(@Param('publicId') publicId: string) {
        return this.mediaService.deleteAsset(publicId);
    }
}
