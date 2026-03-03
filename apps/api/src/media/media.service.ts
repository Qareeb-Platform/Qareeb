import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryService } from '../modules/cloudinary/cloudinary.service';

@Injectable()
export class MediaService {
    constructor(private readonly cloudinaryService: CloudinaryService) { }

    async generateSignedUploadParams() {
        const config = await this.cloudinaryService.configure();
        if (!config) {
            throw new Error('Cloudinary credentials are not configured');
        }

        const timestamp = Math.round(new Date().getTime() / 1000);
        const params = {
            timestamp,
            folder: 'qareeb',
            allowed_formats: 'jpg,jpeg,png,webp',
        };

        const signature = cloudinary.utils.api_sign_request(
            params,
            config.apiSecret,
        );

        return {
            ...params,
            upload_max_bytes: 2097152, // validated in frontend before upload
            signature,
            api_key: config.apiKey,
            cloud_name: config.cloudName,
        };
    }

    async deleteAsset(publicId: string) {
        const config = await this.cloudinaryService.configure();
        if (!config) {
            throw new Error('Cloudinary credentials are not configured');
        }
        return cloudinary.uploader.destroy(publicId);
    }

    async getUsage() {
        const config = await this.cloudinaryService.configure();
        if (!config) {
            throw new Error('Cloudinary credentials are not configured');
        }
        return cloudinary.api.usage();
    }
}
