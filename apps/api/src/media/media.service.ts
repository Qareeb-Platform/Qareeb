import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class MediaService {
    constructor() {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });
    }

    generateSignedUploadParams() {
        const timestamp = Math.round(new Date().getTime() / 1000);
        const params = {
            timestamp,
            folder: 'qareeb',
            allowed_formats: 'jpg,jpeg,png,webp',
        };

        const signature = cloudinary.utils.api_sign_request(
            params,
            process.env.CLOUDINARY_API_SECRET || '',
        );

        return {
            ...params,
            upload_max_bytes: 2097152, // validated in frontend before upload
            signature,
            api_key: process.env.CLOUDINARY_API_KEY,
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        };
    }

    async deleteAsset(publicId: string) {
        return cloudinary.uploader.destroy(publicId);
    }

    async getUsage() {
        return cloudinary.api.usage();
    }
}
