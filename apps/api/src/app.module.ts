import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ImamsModule } from './imams/imams.module';
import { HalaqatModule } from './halaqat/halaqat.module';
import { MaintenanceModule } from './maintenance/maintenance.module';
import { MediaModule } from './media/media.module';
import { AdminModule } from './admin/admin.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        // Rate limiting: 100 requests per 15 minutes
        ThrottlerModule.forRoot([{
            ttl: 900000, // 15 minutes in ms
            limit: 100,
        }]),
        PrismaModule,
        AuthModule,
        ImamsModule,
        HalaqatModule,
        MaintenanceModule,
        MediaModule,
        AdminModule,
    ],
    providers: [
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
})
export class AppModule { }
