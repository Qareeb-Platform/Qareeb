import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { SettingsService } from '../settings/settings.service';

type CloudinaryRuntimeConfig = {
    cloudName: string;
    apiKey: string;
    apiSecret: string;
    cloudinaryUrl: string | null;
};

@Injectable()
export class CloudinaryService {
    private cache: {
        signature: string;
        expiresAt: number;
        config: CloudinaryRuntimeConfig;
    } | null = null;

    constructor(private readonly settingsService: SettingsService) { }

    async configure(): Promise<CloudinaryRuntimeConfig | null> {
        const [cloudName, apiKey, apiSecret, cloudinaryUrl] = await Promise.all([
            this.settingsService.get('CLOUDINARY_CLOUD_NAME'),
            this.settingsService.get('CLOUDINARY_API_KEY'),
            this.settingsService.get('CLOUDINARY_API_SECRET'),
            this.settingsService.get('CLOUDINARY_URL'),
        ]);

        if (!cloudName || !apiKey || !apiSecret) {
            return null;
        }

        const signature = `${cloudName}|${apiKey}|${apiSecret}|${cloudinaryUrl || ''}`;
        const now = Date.now();
        if (this.cache && this.cache.signature === signature && this.cache.expiresAt > now) {
            return this.cache.config;
        }

        cloudinary.config({
            cloud_name: cloudName,
            api_key: apiKey,
            api_secret: apiSecret,
            ...(cloudinaryUrl ? { secure: true } : {}),
        });

        const config: CloudinaryRuntimeConfig = {
            cloudName,
            apiKey,
            apiSecret,
            cloudinaryUrl: cloudinaryUrl || null,
        };

        this.cache = {
            signature,
            config,
            expiresAt: now + (5 * 60 * 1000),
        };

        return config;
    }
}
