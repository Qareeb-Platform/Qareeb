import { Module } from '@nestjs/common';
import { MaintenanceController } from './maintenance.controller';
import { MaintenanceService } from './maintenance.service';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditModule } from '../audit/audit.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { WhatsappModule } from '../modules/whatsapp/whatsapp.module';

@Module({
    imports: [AuthModule, PrismaModule, AuditModule, NotificationsModule, WhatsappModule],
    controllers: [MaintenanceController],
    providers: [MaintenanceService],
})
export class MaintenanceModule { }
