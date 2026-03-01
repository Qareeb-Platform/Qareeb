import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditModule } from '../audit/audit.module';
import { MediaModule } from '../media/media.module';

@Module({
    imports: [AuthModule, PrismaModule, AuditModule, MediaModule],
    controllers: [AdminController],
    providers: [AdminService],
})
export class AdminModule { }
