import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
    constructor(private readonly prisma: PrismaService) { }

    async findNearest(text: string) {
        if (!text || !text.trim()) throw new BadRequestException('text is required');

        const areas = await this.prisma.area.findMany({ select: { id: true, nameAr: true, nameEn: true } });
        const query = text.toLowerCase();

        const matchedArea = areas.find((a) => query.includes((a.nameAr || '').toLowerCase()) || query.includes((a.nameEn || '').toLowerCase()));
        if (!matchedArea) return { match: null, message: 'No matching area found' };

        const areaId = matchedArea.id;

        const imam = await this.prisma.imam.findFirst({ where: { areaId, status: 'approved' }, orderBy: { createdAt: 'desc' } });
        const halqa = await this.prisma.halqa.findFirst({ where: { areaId, status: 'approved' }, orderBy: { createdAt: 'desc' } });
        const maintenance = await this.prisma.maintenanceRequest.findFirst({ where: { areaId, status: 'approved' }, orderBy: { createdAt: 'desc' } });

        const pick = imam || halqa || maintenance;
        if (!pick) return { match: null, message: 'No approved records in this area yet' };

        const formatMessage = () => {
            if (imam === pick) {
                return `Imam: ${pick.imamName}\nMosque: ${pick.mosqueName}\nArea: ${matchedArea.nameEn} / ${matchedArea.nameAr}\nVideo: ${pick.videoUrl || pick.recitationUrl || 'N/A'}\nMaps: ${pick.googleMapsUrl || 'N/A'}`;
            }
            if (halqa === pick) {
                return `Halqa: ${pick.circleName}\nMosque: ${pick.mosqueName}\nArea: ${matchedArea.nameEn} / ${matchedArea.nameAr}\nVideo: ${pick.videoUrl || 'N/A'}\nMaps: ${pick.googleMapsUrl || 'N/A'}`;
            }
            return `Maintenance: ${pick.mosqueName}\nArea: ${matchedArea.nameEn} / ${matchedArea.nameAr}\nMaps: ${pick.googleMapsUrl || 'N/A'}`;
        };

        const matchType = imam === pick ? 'imam' : halqa === pick ? 'halqa' : 'maintenance';

        return {
            match: {
                type: matchType,
                item: pick,
                area: matchedArea,
            },
            message: formatMessage(),
        };
    }
}
