import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { OMAN_GOVERNORATES, OMAN_WILAYAT } from './oman-locations';

const prisma = new PrismaClient();

async function main() {
    let govCount = 0;
    let areaCount = 0;

    for (const gov of OMAN_GOVERNORATES) {
        const governorate = await prisma.governorate.upsert({
            where: { nameAr: gov.name },
            update: { nameEn: gov.nameEn },
            create: { nameAr: gov.name, nameEn: gov.nameEn },
        });
        govCount += 1;

        const wilayat = OMAN_WILAYAT[gov.id] || [];
        for (const wilaya of wilayat) {
            await prisma.area.upsert({
                where: {
                    governorateId_nameAr: {
                        governorateId: governorate.id,
                        nameAr: wilaya,
                    },
                },
                update: { nameEn: wilaya },
                create: {
                    governorateId: governorate.id,
                    nameAr: wilaya,
                    nameEn: wilaya,
                },
            });
            areaCount += 1;
        }

        await prisma.area.deleteMany({
            where: {
                governorateId: governorate.id,
                nameAr: { notIn: wilayat },
            },
        });
    }

    const keepGovNames = OMAN_GOVERNORATES.map((g) => g.name);
    const staleGovernorates = await prisma.governorate.findMany({
        where: { nameAr: { notIn: keepGovNames } },
        select: { id: true },
    });

    const staleIds = staleGovernorates.map((g) => g.id);
    if (staleIds.length) {
        await prisma.area.deleteMany({ where: { governorateId: { in: staleIds } } });
        await prisma.governorate.deleteMany({ where: { id: { in: staleIds } } });
    }

    console.log(`Synced governorates: ${govCount}`);
    console.log(`Synced wilayat: ${areaCount}`);
}

main()
    .catch((error) => {
        console.error('sync-locations failed:', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
