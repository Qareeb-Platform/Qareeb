import { Injectable, Logger } from '@nestjs/common';
import { SettingsService } from '../settings/settings.service';

type SendResult = {
    sent: boolean;
    reason?: string;
};

@Injectable()
export class WhatsappService {
    private readonly logger = new Logger(WhatsappService.name);

    constructor(private readonly settingsService: SettingsService) { }

    async sendTextMessage(to: string, body: string): Promise<SendResult> {
        const enabledValue = (await this.settingsService.get('WHAPI_ENABLED')) || 'false';
        const enabled = String(enabledValue).toLowerCase() === 'true';
        if (!enabled) {
            return { sent: false, reason: 'WHAPI disabled' };
        }

        const token = (await this.settingsService.get('WHAPI_TOKEN')) || '';
        const configuredBaseUrl = (await this.settingsService.get('WHAPI_BASE_URL')) || 'https://gate.whapi.cloud';
        const baseUrl = configuredBaseUrl.replace(/\/+$/, '');

        if (!token.trim()) {
            return { sent: false, reason: 'WHAPI token missing' };
        }

        const normalizedTo = this.normalizeEgyptianNumber(to);
        if (!normalizedTo) {
            return { sent: false, reason: 'Invalid WhatsApp number' };
        }

        const response = await fetch(`${baseUrl}/messages/text`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ to: normalizedTo, body }),
        });

        if (!response.ok) {
            const errorBody = await response.text().catch(() => '');
            throw new Error(`Whapi request failed (${response.status}) ${errorBody}`);
        }

        return { sent: true };
    }

    private normalizeEgyptianNumber(input: string): string | null {
        const digits = String(input || '').replace(/\D/g, '');
        if (!digits) return null;

        if (digits.startsWith('0')) {
            const local = digits.slice(1);
            if (!local.startsWith('1') || local.length !== 10) return null;
            return `20${local}`;
        }

        if (digits.startsWith('20')) {
            return digits;
        }

        if (digits.startsWith('1') && digits.length === 10) {
            return `20${digits}`;
        }

        this.logger.warn(`Could not normalize whatsapp number: ${input}`);
        return null;
    }
}
