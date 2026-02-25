import { Body, Controller, Get, Post, Patch, Delete, Param, Query, UseGuards } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateAreaDto, CreateGovernorateDto, UpdateAreaDto } from './dto/location.dto';

@Controller('locations')
export class LocationsController {
    constructor(private readonly locationsService: LocationsService) { }

    @Get('governorates')
    getGovernorates() {
        return this.locationsService.getGovernorates();
    }

    @Get('areas')
    getAreas(@Query('governorateId') governorateId?: string) {
        return this.locationsService.getAreas(governorateId);
    }

    // Admin-managed
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('super_admin', 'full_reviewer')
    @Post('governorates')
    createGovernorate(@Body() body: CreateGovernorateDto) {
        return this.locationsService.createGovernorate(body);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('super_admin', 'full_reviewer')
    @Post('areas')
    createArea(@Body() body: CreateAreaDto) {
        return this.locationsService.createArea(body);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('super_admin', 'full_reviewer')
    @Patch('areas/:id')
    updateArea(@Param('id') id: string, @Body() body: UpdateAreaDto) {
        return this.locationsService.updateArea(id, body);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('super_admin', 'full_reviewer')
    @Delete('areas/:id')
    deleteArea(@Param('id') id: string) {
        return this.locationsService.deleteArea(id);
    }
}
