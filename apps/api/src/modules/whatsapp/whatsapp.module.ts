import { Module } from '@nestjs/common';
import { SettingsModule } from '../settings/settings.module';
import { WhatsappService } from './whatsapp.service';

@Module({
    imports: [SettingsModule],
    providers: [WhatsappService],
    exports: [WhatsappService],
})
export class WhatsappModule { }
