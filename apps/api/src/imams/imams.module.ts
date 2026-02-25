import { Module } from '@nestjs/common';
import { ImamsController } from './imams.controller';
import { ImamsService } from './imams.service';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditModule } from '../audit/audit.module';

@Module({
    imports: [AuthModule, PrismaModule, AuditModule],
    controllers: [ImamsController],
    providers: [ImamsService],
})
export class ImamsModule { }
