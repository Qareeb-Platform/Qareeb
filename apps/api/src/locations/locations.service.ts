import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAreaDto, CreateGovernorateDto, UpdateAreaDto } from './dto/location.dto';

@Injectable()
export class LocationsService {
    constructor(private readonly prisma: PrismaService) { }

    getGovernorates() {
        return this.prisma.governorate.findMany({
            orderBy: { nameEn: 'asc' },
            select: { id: true, nameAr: true, nameEn: true },
        });
    }

    getAreas(governorateId?: string) {
        return this.prisma.area.findMany({
            where: governorateId ? { governorateId } : undefined,
            orderBy: { nameEn: 'asc' },
            select: { id: true, nameAr: true, nameEn: true, governorateId: true },
        });
    }

    createGovernorate(dto: CreateGovernorateDto) {
        return this.prisma.governorate.create({ data: { nameAr: dto.nameAr, nameEn: dto.nameEn } });
    }

    createArea(dto: CreateAreaDto) {
        return this.prisma.area.create({ data: dto });
    }

    updateArea(id: string, dto: UpdateAreaDto) {
        return this.prisma.area.update({ where: { id }, data: dto });
    }

    deleteArea(id: string) {
        return this.prisma.area.delete({ where: { id } });
    }
}
