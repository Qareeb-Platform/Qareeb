import { PrismaClient, AdminRole, SubmissionStatus, HalqaType, MaintenanceType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Create super admin
    const passwordHash = await bcrypt.hash('admin123456', 12);
    const superAdmin = await prisma.admin.upsert({
        where: { email: 'admin@qareeb.app' },
        update: {},
        create: {
            email: 'admin@qareeb.app',
            passwordHash,
            role: AdminRole.super_admin,
            isActive: true,
        },
    });
    console.log('✅ Super admin created:', superAdmin.email);

    // Create reviewer accounts
    const reviewers = [
        { email: 'imam.reviewer@qareeb.app', role: AdminRole.imam_reviewer },
        { email: 'halqa.reviewer@qareeb.app', role: AdminRole.halqa_reviewer },
        { email: 'maint.reviewer@qareeb.app', role: AdminRole.maintenance_reviewer },
        { email: 'full.reviewer@qareeb.app', role: AdminRole.full_reviewer },
    ];

    for (const r of reviewers) {
        await prisma.admin.upsert({
            where: { email: r.email },
            update: {},
            create: {
                email: r.email,
                passwordHash,
                role: r.role,
                isActive: true,
                createdBy: superAdmin.id,
            },
        });
        console.log(`✅ Reviewer created: ${r.email}`);
    }

    // Seed Imams (6 items)
    const imams = [
        {
            imamName: 'الشيخ محمد عبد الرحمن',
            mosqueName: 'مسجد السيدة زينب',
            governorate: 'القاهرة',
            city: 'القاهرة',
            district: 'السيدة زينب',
            latitude: 30.0444,
            longitude: 31.2357,
            whatsapp: '+201012345678',
            status: SubmissionStatus.approved,
            adminId: superAdmin.id,
        },
        {
            imamName: 'الشيخ أحمد كمال الدين',
            mosqueName: 'مسجد النور',
            governorate: 'الإسكندرية',
            city: 'الإسكندرية',
            district: 'محرم بك',
            latitude: 31.2001,
            longitude: 29.9187,
            whatsapp: '+201123456789',
            status: SubmissionStatus.approved,
            adminId: superAdmin.id,
        },
        {
            imamName: 'الشيخ عمر حسن الجوهري',
            mosqueName: 'مسجد الرحمة',
            governorate: 'الجيزة',
            city: 'الجيزة',
            district: 'المهندسين',
            latitude: 30.0131,
            longitude: 31.2089,
            whatsapp: '+201234567890',
            status: SubmissionStatus.pending,
        },
        {
            imamName: 'الشيخ يوسف إبراهيم السعيد',
            mosqueName: 'مسجد الفتح',
            governorate: 'القاهرة',
            city: 'القاهرة',
            district: 'مصر الجديدة',
            latitude: 30.09,
            longitude: 31.32,
            whatsapp: '+201098765432',
            status: SubmissionStatus.approved,
            adminId: superAdmin.id,
        },
        {
            imamName: 'الشيخ عبد الله صابر',
            mosqueName: 'مسجد بلال',
            governorate: 'الدقهلية',
            city: 'المنصورة',
            district: 'وسط البلد',
            latitude: 31.04,
            longitude: 31.37,
            whatsapp: '+201512345678',
            status: SubmissionStatus.approved,
            adminId: superAdmin.id,
        },
        {
            imamName: 'الشيخ حسام الدين رضا',
            mosqueName: 'مسجد المصطفى',
            governorate: 'الإسكندرية',
            city: 'الإسكندرية',
            district: 'العجمي',
            latitude: 31.13,
            longitude: 29.78,
            whatsapp: '+201612345678',
            status: SubmissionStatus.pending,
        },
    ];

    for (const imam of imams) {
        await prisma.imam.create({ data: imam });
    }
    console.log(`✅ ${imams.length} imams seeded`);

    // Seed Halaqat (6 items)
    const halaqat = [
        {
            circleName: 'حلقة نور العلم',
            mosqueName: 'مسجد عمر بن الخطاب',
            halqaType: HalqaType.children,
            governorate: 'القاهرة',
            city: 'القاهرة',
            district: 'مدينة نصر',
            latitude: 30.05,
            longitude: 31.33,
            whatsapp: '+201011111111',
            additionalInfo: 'السبت والاثنين ٤-٦ م - تحفيظ قرآن للأطفال',
            status: SubmissionStatus.approved,
            adminId: superAdmin.id,
        },
        {
            circleName: 'حلقة السيدات للتحفيظ',
            mosqueName: 'مسجد السلام',
            halqaType: HalqaType.women,
            governorate: 'الجيزة',
            city: 'الجيزة',
            district: 'الدقي',
            latitude: 30.03,
            longitude: 31.21,
            whatsapp: '+201022222222',
            additionalInfo: 'يومياً ١٠ص - ١٢ ظ - للسيدات فقط',
            status: SubmissionStatus.approved,
            adminId: superAdmin.id,
        },
        {
            circleName: 'حلقة الإخوة للرجال',
            mosqueName: 'مسجد الإخلاص',
            halqaType: HalqaType.men,
            governorate: 'الإسكندرية',
            city: 'الإسكندرية',
            district: 'سيدي بشر',
            latitude: 31.26,
            longitude: 30.0,
            whatsapp: '+201033333333',
            additionalInfo: 'بعد المغرب يومياً - للرجال فقط',
            status: SubmissionStatus.approved,
            adminId: superAdmin.id,
        },
        {
            circleName: 'حلقة الصغار المميزة',
            mosqueName: 'مسجد الرحمن',
            halqaType: HalqaType.children,
            governorate: 'القاهرة',
            city: 'القاهرة',
            district: 'شبرا',
            latitude: 30.1,
            longitude: 31.24,
            whatsapp: '+201044444444',
            additionalInfo: 'الجمعة والأحد ٣-٥ م',
            status: SubmissionStatus.pending,
        },
        {
            circleName: 'حلقة القراءات العشر',
            mosqueName: 'مسجد التوبة',
            halqaType: HalqaType.men,
            governorate: 'الدقهلية',
            city: 'المنصورة',
            district: 'الجمهورية',
            latitude: 31.04,
            longitude: 31.38,
            whatsapp: '+201055555555',
            additionalInfo: 'الثلاثاء والخميس ٨-١٠ م - للمتقدمين',
            status: SubmissionStatus.approved,
            adminId: superAdmin.id,
        },
        {
            circleName: 'حلقة أمهات المؤمنين',
            mosqueName: 'مسجد النساء',
            halqaType: HalqaType.women,
            governorate: 'الجيزة',
            city: 'الجيزة',
            district: 'فيصل',
            latitude: 30.0,
            longitude: 31.17,
            whatsapp: '+201066666666',
            additionalInfo: 'الاثنين والأربعاء ٩-١١ص',
            status: SubmissionStatus.approved,
            adminId: superAdmin.id,
        },
    ];

    for (const halqa of halaqat) {
        await prisma.halqa.create({ data: halqa });
    }
    console.log(`✅ ${halaqat.length} halaqat seeded`);

    // Seed Maintenance Requests (6 items)
    const maintenance = [
        {
            mosqueName: 'مسجد النور',
            governorate: 'القاهرة',
            city: 'القاهرة',
            district: 'حلوان',
            latitude: 29.84,
            longitude: 31.33,
            maintenanceTypes: [MaintenanceType.Carpentry],
            description: 'تجديد السجاد - المساحة ٢٠٠ م²',
            estimatedCostMin: 15000,
            estimatedCostMax: 25000,
            whatsapp: '+201077777777',
            status: SubmissionStatus.approved,
            adminId: superAdmin.id,
        },
        {
            mosqueName: 'مسجد الفتح',
            governorate: 'الجيزة',
            city: 'الجيزة',
            district: 'إمبابة',
            latitude: 30.07,
            longitude: 31.21,
            maintenanceTypes: [MaintenanceType.AC_Repair],
            description: 'تكييف المصلى الرئيسي لخدمة ٣٠٠ مصلٍّ',
            estimatedCostMin: 30000,
            estimatedCostMax: 50000,
            whatsapp: '+201088888888',
            status: SubmissionStatus.approved,
            adminId: superAdmin.id,
        },
        {
            mosqueName: 'مسجد السلام',
            governorate: 'الإسكندرية',
            city: 'الإسكندرية',
            district: 'المنتزه',
            latitude: 31.27,
            longitude: 30.01,
            maintenanceTypes: [MaintenanceType.Plumbing],
            description: 'إصلاح شبكة السباكة الداخلية لدورات المياه',
            estimatedCostMin: 8000,
            estimatedCostMax: 15000,
            whatsapp: '+201099999999',
            status: SubmissionStatus.approved,
            adminId: superAdmin.id,
        },
        {
            mosqueName: 'مسجد التوبة',
            governorate: 'الشرقية',
            city: 'الزقازيق',
            district: 'وسط البلد',
            latitude: 30.58,
            longitude: 31.51,
            maintenanceTypes: [MaintenanceType.Painting],
            description: 'دهان وتجديد الواجهة الخارجية والجدران الداخلية',
            estimatedCostMin: 5000,
            estimatedCostMax: 9000,
            whatsapp: '+201100000001',
            status: SubmissionStatus.approved,
            adminId: superAdmin.id,
        },
        {
            mosqueName: 'مسجد عمر بن الخطاب',
            governorate: 'القاهرة',
            city: 'القاهرة',
            district: 'المرج',
            latitude: 30.15,
            longitude: 31.33,
            maintenanceTypes: [MaintenanceType.Electrical],
            description: 'تجديد كامل منظومة الإنارة والكهرباء',
            estimatedCostMin: 20000,
            estimatedCostMax: 35000,
            whatsapp: '+201100000002',
            status: SubmissionStatus.approved,
            adminId: superAdmin.id,
        },
        {
            mosqueName: 'مسجد الرحمة',
            governorate: 'البحيرة',
            city: 'دمنهور',
            district: 'الزهور',
            latitude: 31.03,
            longitude: 30.47,
            maintenanceTypes: [MaintenanceType.Other],
            description: 'توسعة المصلى بطابق ثانٍ',
            estimatedCostMin: 80000,
            estimatedCostMax: 150000,
            whatsapp: '+201100000003',
            status: SubmissionStatus.pending,
        },
    ];

    for (const m of maintenance) {
        await prisma.maintenanceRequest.create({ data: m });
    }
    console.log(`✅ ${maintenance.length} maintenance requests seeded`);

    console.log('🎉 Seeding complete!');
}

main()
    .catch((e) => {
        console.error('❌ Seed error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
