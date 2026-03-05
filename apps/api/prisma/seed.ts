import { PrismaClient, AdminRole, SubmissionStatus, HalqaType, MaintenanceType } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { OMAN_GOVERNORATES, OMAN_GOV_COORDS, OMAN_WILAYAT } from './oman-locations';

const prisma = new PrismaClient();

const SEED_IMAMS = [
    {
        name: 'الشيخ أحمد بن سالم الرحبي',
        mosque: 'مسجد السلطان قابوس الأكبر',
        governorate: 'muscat',
        wilaya: 'بوشر',
        phone: '96891234001',
        bio: 'إمام وخطيب مسجد السلطان قابوس الأكبر منذ ١٢ عاماً، حافظ للقرآن الكريم، حاصل على إجازة في التجويد.',
        verified: true,
    },
    {
        name: 'الشيخ محمد بن علي البلوشي',
        mosque: 'مسجد الدولة',
        governorate: 'muscat',
        wilaya: 'مطرح',
        phone: '96891234002',
        bio: 'متخصص في تحفيظ القرآن وتعليم أحكام التجويد للمبتدئين والمتقدمين.',
        verified: true,
    },
    {
        name: 'الشيخ خالد بن حمد المعمري',
        mosque: 'جامع الشيخ محمد بن عبدالوهاب',
        governorate: 'muscat',
        wilaya: 'السيب',
        phone: '96891234003',
        bio: 'خطيب جمعة وإمام راتب، درس العلوم الشرعية بجامعة السلطان قابوس.',
        verified: true,
    },
    {
        name: 'الشيخ سالم بن ناصر الكندي',
        mosque: 'مسجد الأنصار',
        governorate: 'dhofar',
        wilaya: 'صلالة',
        phone: '96891234004',
        bio: 'إمام مسجد الأنصار بصلالة، يدرّس القرآن الكريم والفقه الإسلامي.',
        verified: false,
    },
    {
        name: 'الشيخ عبدالله بن راشد الحارثي',
        mosque: 'مسجد الرحمة',
        governorate: 'northAlBatinah',
        wilaya: 'صحار',
        phone: '96891234005',
        bio: 'إمام مسجد الرحمة بصحار، متخصص في تعليم القرآن لجميع الفئات العمرية.',
        verified: true,
    },
    {
        name: 'الشيخ يوسف بن سعيد البريكي',
        mosque: 'مسجد الفتح',
        governorate: 'adDakhiliyah',
        wilaya: 'نزوى',
        phone: '96891234006',
        bio: 'خطيب وإمام مسجد الفتح في نزوى، له إسهامات في نشر العلم الشرعي بالمنطقة الداخلية.',
        verified: true,
    },
] as const;

const SEED_HALAQAT = [
    {
        name: 'حلقة نور القرآن للأطفال',
        mosque: 'مسجد السلطان قابوس الأكبر',
        governorate: 'muscat',
        wilaya: 'بوشر',
        phone: '96891235001',
        type: 'أطفال',
        timing: 'السبت والاثنين ٤-٦ م',
        bio: 'حلقة متخصصة لتحفيظ القرآن الكريم للأطفال من سن ٥ إلى ١٢ سنة.',
        verified: true,
    },
    {
        name: 'حلقة السيدات للتحفيظ',
        mosque: 'مركز التعليم الإسلامي',
        governorate: 'muscat',
        wilaya: 'العامرات',
        phone: '96891235002',
        type: 'نساء',
        timing: 'يومياً ٩ص - ١١ص',
        bio: 'حلقة نسائية بإشراف معلمة متخصصة، تقبل جميع المستويات.',
        verified: true,
    },
    {
        name: 'حلقة الرجال المتقدمين',
        mosque: 'جامع الشيخ محمد بن عبدالوهاب',
        governorate: 'muscat',
        wilaya: 'السيب',
        phone: '96891235003',
        type: 'رجال',
        timing: 'بعد صلاة العشاء يومياً',
        bio: 'للراغبين في إتمام الحفظ ومراجعة المحفوظ برواية حفص.',
        verified: true,
    },
    {
        name: 'حلقة صلالة للناشئة',
        mosque: 'مسجد الأنصار',
        governorate: 'dhofar',
        wilaya: 'صلالة',
        phone: '96891235004',
        type: 'أطفال',
        timing: 'الجمعة والأحد ٣-٥ م',
        bio: 'حلقة لتحفيظ وتجويد القرآن للناشئة في منطقة ظفار.',
        verified: false,
    },
    {
        name: 'حلقة الباطنة الصباحية',
        mosque: 'مسجد الرحمة',
        governorate: 'northAlBatinah',
        wilaya: 'صحار',
        phone: '96891235005',
        type: 'نساء',
        timing: 'الاثنين والأربعاء ٨-١٠ص',
        bio: 'حلقة نسائية صباحية في صحار لتعليم القرآن والأحكام.',
        verified: true,
    },
    {
        name: 'حلقة نزوى للقراءات',
        mosque: 'مسجد الفتح',
        governorate: 'adDakhiliyah',
        wilaya: 'نزوى',
        phone: '96891235006',
        type: 'رجال',
        timing: 'الثلاثاء والخميس بعد المغرب',
        bio: 'حلقة للقراءات العشر للحفاظ المتقدمين في قلب عُمان التاريخية.',
        verified: true,
    },
] as const;

const SEED_MAINTENANCE = [
    {
        name: 'مسجد الأنصار — تجديد السجاد',
        mosque: 'مسجد الأنصار',
        governorate: 'dhofar',
        wilaya: 'صلالة',
        phone: '96891236001',
        workType: 'فرش وسجاد',
        costMin: 800,
        costMax: 1500,
        bio: 'المسجد يحتاج تجديد السجادة الكاملة، المساحة ٢٠٠ م²، عمر السجادة الحالية ١٠ سنوات.',
        verified: false,
    },
    {
        name: 'جامع السيب — منظومة تكييف',
        mosque: 'جامع السيب الكبير',
        governorate: 'muscat',
        wilaya: 'السيب',
        phone: '96891236002',
        workType: 'تكييف',
        costMin: 2000,
        costMax: 4000,
        bio: 'المصلى الرئيسي يتسع لـ ٤٠٠ مصلٍّ ويحتاج تركيب منظومة تكييف مركزية.',
        verified: false,
    },
    {
        name: 'مسجد الرحمة صحار — إصلاح سباكة',
        mosque: 'مسجد الرحمة',
        governorate: 'northAlBatinah',
        wilaya: 'صحار',
        phone: '96891236003',
        workType: 'سباكة',
        costMin: 500,
        costMax: 900,
        bio: 'إصلاح شبكة السباكة في دورات المياه ومنطقة الوضوء.',
        verified: false,
    },
    {
        name: 'مسجد نزوى التاريخي — ترميم وصيانة',
        mosque: 'مسجد نزوى الكبير',
        governorate: 'adDakhiliyah',
        wilaya: 'نزوى',
        phone: '96891236004',
        workType: 'بناء وتوسعة',
        costMin: 5000,
        costMax: 12000,
        bio: 'ترميم الجدران الداخلية والخارجية للمسجد التاريخي والحفاظ على طابعه الأصيل.',
        verified: false,
    },
    {
        name: 'مسجد بوشر — إنارة LED',
        mosque: 'مسجد النور',
        governorate: 'muscat',
        wilaya: 'بوشر',
        phone: '96891236005',
        workType: 'كهرباء',
        costMin: 700,
        costMax: 1200,
        bio: 'استبدال منظومة الإنارة القديمة بلمبات LED موفرة للطاقة.',
        verified: false,
    },
    {
        name: 'مسجد مطرح — دهانات وتجميل',
        mosque: 'مسجد الميناء',
        governorate: 'muscat',
        wilaya: 'مطرح',
        phone: '96891236006',
        workType: 'دهانات',
        costMin: 300,
        costMax: 600,
        bio: 'دهان الواجهة الخارجية والجدران الداخلية للمسجد المطل على ميناء مطرح.',
        verified: false,
    },
] as const;

function mapHalqaType(value: string): HalqaType {
    if (value === 'نساء') return HalqaType.women;
    if (value === 'رجال') return HalqaType.men;
    return HalqaType.children;
}

function mapMaintenanceType(value: string): MaintenanceType[] {
    if (value === 'تكييف') return [MaintenanceType.AC_Repair];
    if (value === 'سباكة') return [MaintenanceType.Plumbing];
    if (value === 'كهرباء') return [MaintenanceType.Electrical];
    if (value === 'دهانات') return [MaintenanceType.Painting];
    return [MaintenanceType.Other];
}

function mapUrl(lat: number, lng: number): string {
    return `https://www.google.com/maps?q=${lat},${lng}`;
}

async function main() {
    console.log('Seeding Oman dataset...');

    await prisma.mediaAsset.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.improvement.deleteMany();
    await prisma.maintenanceRequest.deleteMany();
    await prisma.halqa.deleteMany();
    await prisma.imam.deleteMany();
    await prisma.area.deleteMany();
    await prisma.governorate.deleteMany();
    await prisma.admin.deleteMany();

    const passwordHash = await bcrypt.hash('admin123456', 12);
    const superAdmin = await prisma.admin.create({
        data: {
            email: 'admin@qareeb.app',
            passwordHash,
            role: AdminRole.super_admin,
            isActive: true,
        },
    });

    const reviewers = [
        { email: 'imam.reviewer@qareeb.app', role: AdminRole.imam_reviewer },
        { email: 'halqa.reviewer@qareeb.app', role: AdminRole.halqa_reviewer },
        { email: 'maint.reviewer@qareeb.app', role: AdminRole.maintenance_reviewer },
        { email: 'full.reviewer@qareeb.app', role: AdminRole.full_reviewer },
    ];

    for (const reviewer of reviewers) {
        await prisma.admin.create({
            data: {
                email: reviewer.email,
                passwordHash,
                role: reviewer.role,
                isActive: true,
                createdBy: superAdmin.id,
            },
        });
    }

    const govById = new Map<string, { dbId: string; nameAr: string }>();

    for (const gov of OMAN_GOVERNORATES) {
        const createdGov = await prisma.governorate.create({
            data: { nameAr: gov.name, nameEn: gov.nameEn },
        });

        govById.set(gov.id, { dbId: createdGov.id, nameAr: gov.name });

        for (const wilaya of OMAN_WILAYAT[gov.id] || []) {
            await prisma.area.create({
                data: {
                    governorateId: createdGov.id,
                    nameAr: wilaya,
                    nameEn: wilaya,
                },
            });
        }
    }

    const areaMap = new Map<string, string>();
    const allAreas = await prisma.area.findMany({ include: { governorate: true } });
    for (const area of allAreas) {
        areaMap.set(`${area.governorate.nameAr}::${area.nameAr}`, area.id);
    }

    for (const imam of SEED_IMAMS) {
        const gov = govById.get(imam.governorate)!;
        const coords = OMAN_GOV_COORDS[imam.governorate];
        const areaId = areaMap.get(`${gov.nameAr}::${imam.wilaya}`) || null;

        await prisma.imam.create({
            data: {
                imamName: imam.name,
                mosqueName: imam.mosque,
                governorate: imam.governorate,
                city: imam.wilaya,
                district: imam.wilaya,
                areaId,
                latitude: coords.lat,
                longitude: coords.lng,
                googleMapsUrl: mapUrl(coords.lat, coords.lng),
                whatsapp: imam.phone,
                recitationUrl: null,
                status: imam.verified ? SubmissionStatus.approved : SubmissionStatus.pending,
                adminId: imam.verified ? superAdmin.id : null,
            },
        });
    }

    for (const halqa of SEED_HALAQAT) {
        const gov = govById.get(halqa.governorate)!;
        const coords = OMAN_GOV_COORDS[halqa.governorate];
        const areaId = areaMap.get(`${gov.nameAr}::${halqa.wilaya}`) || null;

        await prisma.halqa.create({
            data: {
                circleName: halqa.name,
                mosqueName: halqa.mosque,
                halqaType: mapHalqaType(halqa.type),
                governorate: halqa.governorate,
                city: halqa.wilaya,
                district: halqa.wilaya,
                areaId,
                latitude: coords.lat,
                longitude: coords.lng,
                googleMapsUrl: mapUrl(coords.lat, coords.lng),
                whatsapp: halqa.phone,
                additionalInfo: `${halqa.timing} - ${halqa.bio}`,
                isOnline: false,
                status: halqa.verified ? SubmissionStatus.approved : SubmissionStatus.pending,
                adminId: halqa.verified ? superAdmin.id : null,
            },
        });
    }

    for (const maintenance of SEED_MAINTENANCE) {
        const gov = govById.get(maintenance.governorate)!;
        const coords = OMAN_GOV_COORDS[maintenance.governorate];
        const areaId = areaMap.get(`${gov.nameAr}::${maintenance.wilaya}`) || null;

        await prisma.maintenanceRequest.create({
            data: {
                mosqueName: maintenance.mosque,
                governorate: maintenance.governorate,
                city: maintenance.wilaya,
                district: maintenance.wilaya,
                areaId,
                latitude: coords.lat,
                longitude: coords.lng,
                googleMapsUrl: mapUrl(coords.lat, coords.lng),
                maintenanceTypes: mapMaintenanceType(maintenance.workType),
                description: `${maintenance.name}. ${maintenance.bio}`,
                estimatedCostMin: maintenance.costMin,
                estimatedCostMax: maintenance.costMax,
                whatsapp: maintenance.phone,
                status: maintenance.verified ? SubmissionStatus.approved : SubmissionStatus.pending,
                adminId: maintenance.verified ? superAdmin.id : null,
            },
        });
    }

    console.log('Seed complete: 6 imams, 6 halaqat, 6 maintenance requests.');
}

main()
    .catch((e) => {
        console.error('Seed error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
