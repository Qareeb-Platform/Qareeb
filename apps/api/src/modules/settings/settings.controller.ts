import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { SettingsService } from './settings.service';
import { UpsertSystemSettingDto } from './dto/upsert-system-setting.dto';
import { UpdateSystemSettingDto } from './dto/update-system-setting.dto';

@Controller('admin/settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin')
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) { }

    @Get('group/:group')
    getByGroup(@Param('group') group: string) {
        return this.settingsService.getByGroup(group);
    }

    @Post()
    @Throttle({ default: { limit: 20, ttl: 60000 } })
    set(@Body() body: UpsertSystemSettingDto) {
        return this.settingsService.set(
            body.key,
            body.value,
            body.group,
            Boolean(body.isSecret),
        );
    }

    @Patch(':key')
    @Throttle({ default: { limit: 20, ttl: 60000 } })
    update(
        @Param('key') key: string,
        @Body() body: UpdateSystemSettingDto,
    ) {
        return this.settingsService.update(key, {
            value: body.value,
            group: body.group,
            isSecret: body.isSecret,
        });
    }

    @Delete(':key')
    @Throttle({ default: { limit: 10, ttl: 60000 } })
    delete(@Param('key') key: string) {
        return this.settingsService.delete(key);
    }
}
