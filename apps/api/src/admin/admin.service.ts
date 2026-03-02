import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { MediaService } from '../media/media.service';

@Injectable()
export class AdminService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly mediaService: MediaService,
    ) { }

    async getDashboardStats() {
        const [pendingImams, pendingHalaqat, pendingMaintenance] = await Promise.all([
            this.prisma.imam.count({ where: { status: 'pending' } }),
            this.prisma.halqa.count({ where: { status: 'pending' } }),
            this.prisma.maintenanceRequest.count({ where: { status: 'pending' } }),
        ]);

        const [totalImams, totalHalaqat, totalMaintenance] = await Promise.all([
            this.prisma.imam.count(),
            this.prisma.halqa.count(),
            this.prisma.maintenanceRequest.count(),
        ]);

        const imamsByGov = await this.prisma.imam.groupBy({
            by: ['governorate'],
            _count: { id: true },
            where: { status: 'approved' },
        });

        const byGovernorate = imamsByGov.map((g: { governorate: string; _count: { id: number } }) => ({
            name: g.governorate,
            count: g._count.id,
        }));

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentImams = await this.prisma.imam.findMany({
            where: { createdAt: { gte: thirtyDaysAgo } },
            select: { createdAt: true },
        });

        const recentHalaqat = await this.prisma.halqa.findMany({
            where: { createdAt: { gte: thirtyDaysAgo } },
            select: { createdAt: true },
        });

        const recentMaintenance = await this.prisma.maintenanceRequest.findMany({
            where: { createdAt: { gte: thirtyDaysAgo } },
            select: { createdAt: true },
        });

        const dateMap = new Map<string, number>();
        [...recentImams, ...recentHalaqat, ...recentMaintenance].forEach((item) => {
            const date = item.createdAt.toISOString().split('T')[0];
            dateMap.set(date, (dateMap.get(date) || 0) + 1);
        });

        const last30Days = Array.from(dateMap.entries())
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => a.date.localeCompare(b.date));

        const allMaintenance = await this.prisma.maintenanceRequest.findMany({
            where: { status: 'approved' },
            select: { maintenanceTypes: true },
        });

        const typeMap = new Map<string, number>();
        allMaintenance.forEach((m: { maintenanceTypes: string[] }) => {
            m.maintenanceTypes.forEach((t: string) => {
                typeMap.set(t, (typeMap.get(t) || 0) + 1);
            });
        });

        const maintenanceTypeBreakdown = Array.from(typeMap.entries())
            .map(([type, count]) => ({ type, count }));

        return {
            pending: { imams: pendingImams, halaqat: pendingHalaqat, maintenance: pendingMaintenance },
            total: { imams: totalImams, halaqat: totalHalaqat, maintenance: totalMaintenance },
            byGovernorate,
            last30Days,
            maintenanceTypeBreakdown,
        };
    }

    async getCloudinaryUsage() {
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
        const apiKey = process.env.CLOUDINARY_API_KEY;
        const apiSecret = process.env.CLOUDINARY_API_SECRET;

        if (!cloudName || !apiKey || !apiSecret) {
            return {
                enabled: false,
                message: 'Cloudinary credentials are not configured',
            };
        }

        try {
            const usage: any = await this.mediaService.getUsage();
            const storageUsed = Number(usage?.storage?.usage || 0);
            const storageLimit = Number(usage?.storage?.limit || 0);
            const hasStorageLimit = storageLimit > 0;
            const remaining = hasStorageLimit ? Math.max(storageLimit - storageUsed, 0) : null;
            const usedPercent = hasStorageLimit ? Number(((storageUsed / storageLimit) * 100).toFixed(2)) : null;

            const creditUsed = Number(usage?.credits?.usage || 0);
            const creditLimit = Number(usage?.credits?.limit || 0);
            const hasCreditLimit = creditLimit > 0;
            const creditRemaining = hasCreditLimit ? Math.max(creditLimit - creditUsed, 0) : null;
            const creditUsedPercent = hasCreditLimit ? Number(((creditUsed / creditLimit) * 100).toFixed(2)) : null;

            return {
                enabled: true,
                plan: usage?.plan || 'unknown',
                lastUpdated: new Date().toISOString(),
                storage: {
                    used: storageUsed,
                    limit: hasStorageLimit ? storageLimit : null,
                    remaining,
                    usedPercent,
                },
                credits: {
                    used: creditUsed,
                    limit: hasCreditLimit ? creditLimit : null,
                    remaining: creditRemaining,
                    usedPercent: creditUsedPercent,
                },
                resources: usage?.resources || 0,
                derivedResources: usage?.derived_resources || 0,
                objects: usage?.objects || 0,
                bandwidth: {
                    used: Number(usage?.bandwidth?.usage || 0),
                    limit: Number(usage?.bandwidth?.limit || 0),
                },
                requests: usage?.requests || 0,
                transformations: {
                    used: Number(usage?.transformations?.usage || 0),
                    limit: Number(usage?.transformations?.limit || 0),
                },
            };
        } catch (error: any) {
            return {
                enabled: false,
                message: error?.message || 'Could not fetch Cloudinary usage',
            };
        }
    }

    async findAllAdmins() {
        return this.prisma.admin.findMany({
            select: {
                id: true,
                email: true,
                role: true,
                isActive: true,
                lastLoginAt: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async createAdmin(email: string, password: string, role: string, creatorId: string) {
        const passwordHash = await bcrypt.hash(password, 12);
        return this.prisma.admin.create({
            data: {
                email,
                passwordHash,
                role: role as any,
                createdBy: creatorId,
            },
            select: {
                id: true,
                email: true,
                role: true,
                isActive: true,
                createdAt: true,
            },
        });
    }

    async updateAdmin(id: string, data: { role?: string; is_active?: boolean }) {
        return this.prisma.admin.update({
            where: { id },
            data: {
                ...(data.role && { role: data.role as any }),
                ...(data.is_active !== undefined && { isActive: data.is_active }),
            },
            select: {
                id: true,
                email: true,
                role: true,
                isActive: true,
            },
        });
    }

    async getAuditLogs(params: {
        entityType?: string;
        entityId?: string;
        userId?: string;
        action?: string;
        from?: string;
        to?: string;
        page?: number;
        limit?: number;
    }) {
        const page = params.page || 1;
        const limit = Math.min(params.limit || 20, 100);
        const skip = (page - 1) * limit;

        const where: any = {};
        if (params.entityType) where.entityType = params.entityType;
        if (params.entityId) where.entityId = params.entityId;
        if (params.userId) where.adminId = params.userId;
        if (params.action) where.action = params.action;
        if (params.from || params.to) {
            where.createdAt = {
                ...(params.from ? { gte: new Date(params.from) } : {}),
                ...(params.to ? { lte: new Date(params.to) } : {}),
            };
        }

        const [data, total] = await Promise.all([
            this.prisma.auditLog.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: { admin: { select: { email: true, role: true } } },
            }),
            this.prisma.auditLog.count({ where }),
        ]);

        return {
            data,
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }
}
