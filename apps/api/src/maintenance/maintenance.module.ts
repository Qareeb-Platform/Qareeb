import { Module } from '@nestjs/common';
import { MaintenanceController } from './maintenance.controller';
import { MaintenanceService } from './maintenance.service';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditModule } from '../audit/audit.module';

@Module({
    imports: [AuthModule, PrismaModule, AuditModule],
    controllers: [MaintenanceController],
    providers: [MaintenanceService],
})
export class MaintenanceModule { }
