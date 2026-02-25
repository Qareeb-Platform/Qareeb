import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
    constructor(private readonly prisma: PrismaService) { }

    async log(params: {
        adminId: string;
        entityType: string;
        entityId: string;
        action: 'approve' | 'reject' | 'update';
        oldData?: any;
        newData?: any;
    }) {
        await this.prisma.auditLog.create({
            data: {
                adminId: params.adminId,
                entityType: params.entityType,
                entityId: params.entityId,
                action: params.action,
                oldData: params.oldData ?? null,
                newData: params.newData ?? null,
            },
        });
    }
}
