import { Module } from '@nestjs/common';
import { HalaqatController } from './halaqat.controller';
import { HalaqatService } from './halaqat.service';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [AuthModule],
    controllers: [HalaqatController],
    providers: [HalaqatService],
})
export class HalaqatModule { }
