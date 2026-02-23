import { Module } from '@nestjs/common';
import { ImamsController } from './imams.controller';
import { ImamsService } from './imams.service';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [AuthModule],
    controllers: [ImamsController],
    providers: [ImamsService],
})
export class ImamsModule { }
