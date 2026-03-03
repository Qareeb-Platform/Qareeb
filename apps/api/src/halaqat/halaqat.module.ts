import { Module } from '@nestjs/common';
import { HalaqatController } from './halaqat.controller';
import { HalaqatService } from './halaqat.service';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditModule } from '../audit/audit.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { WhatsappModule } from '../modules/whatsapp/whatsapp.module';

@Module({
    imports: [AuthModule, PrismaModule, AuditModule, NotificationsModule, WhatsappModule],
    controllers: [HalaqatController],
    providers: [HalaqatService],
})
export class HalaqatModule { }
