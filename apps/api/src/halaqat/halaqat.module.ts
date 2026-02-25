import { Module } from '@nestjs/common';
import { HalaqatController } from './halaqat.controller';
import { HalaqatService } from './halaqat.service';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditModule } from '../audit/audit.module';

@Module({
    imports: [AuthModule, PrismaModule, AuditModule],
    controllers: [HalaqatController],
    providers: [HalaqatService],
})
export class HalaqatModule { }
