import { PrismaClient, AdminRole, SubmissionStatus, HalqaType, MaintenanceType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const toMapUrl = (lat: number, lng: number) => `https://www.google.com/maps?q=${lat},${lng}`;

async function main() {
    console.log('🌱 Seeding database...');

    // Clean existing data for a consistent seed run (order matters because of FKs)
    await prisma.mediaAsset.deleteMany();
    await prisma.auditLog?.deleteMany?.().catch(() => undefined);
    await prisma.maintenanceRequest.deleteMany();
    await prisma.halqa.deleteMany();
    await prisma.imam.deleteMany();
    await prisma.area.deleteMany();
    await prisma.governorate.deleteMany();
    await prisma.admin.deleteMany();

    // Create super admin
    const passwordHash = await bcrypt.hash('admin123456', 12);
    const superAdmin = await prisma.admin.create({
        data: {
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
        await prisma.admin.create({
            data: {
                email: r.email,
                passwordHash,
                role: r.role,
                isActive: true,
                createdBy: superAdmin.id,
            },
        });
        console.log(`✅ Reviewer created: ${r.email}`);
    }

    // Seed governorates
    const governorates = [
        { ar: 'القاهرة', en: 'Cairo' },
        { ar: 'الجيزة', en: 'Giza' },
        { ar: 'الإسكندرية', en: 'Alexandria' },
        { ar: 'الدقهلية', en: 'Dakahlia' },
        { ar: 'البحر الأحمر', en: 'Red Sea' },
        { ar: 'البحيرة', en: 'Beheira' },
        { ar: 'الفيوم', en: 'Faiyum' },
        { ar: 'الغربية', en: 'Gharbia' },
        { ar: 'الإسماعيلية', en: 'Ismailia' },
        { ar: 'المنوفية', en: 'Monufia' },
        { ar: 'المنيا', en: 'Minya' },
        { ar: 'القليوبية', en: 'Qalyubia' },
        { ar: 'الوادي الجديد', en: 'New Valley' },
        { ar: 'السويس', en: 'Suez' },
        { ar: 'الشرقية', en: 'Sharqia' },
        { ar: 'أسوان', en: 'Aswan' },
        { ar: 'أسيوط', en: 'Assiut' },
        { ar: 'بني سويف', en: 'Beni Suef' },
        { ar: 'بورسعيد', en: 'Port Said' },
        { ar: 'دمياط', en: 'Damietta' },
        { ar: 'جنوب سيناء', en: 'South Sinai' },
        { ar: 'كفر الشيخ', en: 'Kafr El Sheikh' },
        { ar: 'مطروح', en: 'Matruh' },
        { ar: 'قنا', en: 'Qena' },
        { ar: 'سوهاج', en: 'Sohag' },
        { ar: 'شمال سيناء', en: 'North Sinai' },
        { ar: 'الأقصر', en: 'Luxor' },
    ];

    const govMap: Record<string, string> = {};
    for (const g of governorates) {
        const record = await prisma.governorate.create({
            data: { nameAr: g.ar, nameEn: g.en },
        });
        govMap[g.ar] = record.id;
        govMap[g.en] = record.id;
    }
    console.log(`✅ ${governorates.length} governorates seeded`);

    // Seed areas (focused on ones used in seed data + popular districts)
    const areas = [
        { gov: 'القاهرة', ar: 'السيدة زينب', en: 'Sayeda Zeinab' },
        { gov: 'القاهرة', ar: 'مصر الجديدة', en: 'Heliopolis' },
        { gov: 'القاهرة', ar: 'مدينة نصر', en: 'Nasr City' },
        { gov: 'القاهرة', ar: 'شبرا', en: 'Shubra' },
        { gov: 'القاهرة', ar: 'حلوان', en: 'Helwan' },
        { gov: 'القاهرة', ar: 'المرج', en: 'El Marg' },
        { gov: 'الجيزة', ar: 'المهندسين', en: 'Mohandessin' },
        { gov: 'الجيزة', ar: 'الدقي', en: 'Dokki' },
        { gov: 'الجيزة', ar: 'إمبابة', en: 'Imbaba' },
        { gov: 'الجيزة', ar: 'فيصل', en: 'Faisal' },
        { gov: 'الإسكندرية', ar: 'محرم بك', en: 'Moharam Bek' },
        { gov: 'الإسكندرية', ar: 'العجمي', en: 'Agamy' },
        { gov: 'الإسكندرية', ar: 'سيدي بشر', en: 'Sidi Bishr' },
        { gov: 'الإسكندرية', ar: 'المنتزه', en: 'Al Montazah' },
        { gov: 'الدقهلية', ar: 'وسط البلد', en: 'Downtown Mansoura' },
        { gov: 'الدقهلية', ar: 'الجمهورية', en: 'Al Gomhoria' },
        { gov: 'الشرقية', ar: 'وسط البلد', en: 'Zagazig Downtown' },
        { gov: 'البحيرة', ar: 'الزهور', en: 'Al Zuhour' },
    ];

    const areaMap: Record<string, string> = {};
    for (const a of areas) {
        const record = await prisma.area.create({
            data: {
                nameAr: a.ar,
                nameEn: a.en,
                governorateId: govMap[a.gov],
            },
        });
        areaMap[`${a.gov}:${a.ar}`] = record.id;
        areaMap[`${a.gov}:${a.en}`] = record.id;
    }
    console.log(`✅ ${areas.length} areas seeded`);

    const areaFor = (gov: string, area: string) => areaMap[`${gov}:${area}`] || null;

    // Helper data for generating diverse records
    const arabicNames = [
        { first: 'محمد', last: 'عبد الرحمن' },
        { first: 'أحمد', last: 'كمال الدين' },
        { first: 'عمر', last: 'حسن الجوهري' },
        { first: 'يوسف', last: 'إبراهيم السعيد' },
        { first: 'عبد الله', last: 'صابر' },
        { first: 'حسام الدين', last: 'رضا' },
        { first: 'علي', last: 'محمود' },
        { first: 'إبراهيم', last: 'الشريف' },
        { first: 'محمود', last: 'علي الدين' },
        { first: 'ياسر', last: 'صالح' },
        { first: 'سالم', last: 'العطار' },
        { first: 'خالد', last: 'الحسن' },
        { first: 'فايز', last: 'محمد' },
        { first: 'جمال', last: 'الدهيمي' },
        { first: 'مصطفى', last: 'الزهراني' },
        { first: 'رمضان', last: 'السيد' },
        { first: 'حسن', last: 'الخولي' },
        { first: 'صلاح', last: 'الجمال' },
        { first: 'كريم', last: 'الرفاعي' },
        { first: 'وليد', last: 'الشطي' },
        { first: 'نور', last: 'الدين' },
        { first: 'سعيد', last: 'العربي' },
        { first: 'طارق', last: 'السلمي' },
        { first: 'هاني', last: 'الشناوي' },
        { first: 'بشير', last: 'القاضي' },
    ];

    const mosqueNames = [
        'مسجد السيدة زينب', 'مسجد النور', 'مسجد الرحمة', 'مسجد الفتح',
        'مسجد بلال', 'مسجد المصطفى', 'مسجد عمر بن الخطاب', 'مسجد الإخلاص',
        'مسجد السلام', 'مسجد التوبة', 'مسجد النساء', 'مسجد الحصار',
        'مسجد القدس', 'مسجد الحمراء', 'مسجد الصفا', 'مسجد قباء',
        'مسجد المعراج', 'مسجد الهجرة', 'مسجد الإيمان', 'مسجد النجاح',
        'مسجد الشرح', 'مسجد الهدى', 'مسجد الراية', 'مسجد الأمانة',
        'مسجد السند', 'مسجد الجود', 'مسجد القيمة', 'مسجد الفضل',
        'مسجد الرايات', 'مسجد الغفران', 'مسجد الأنوار', 'مسجد السراج',
        'مسجد النجم', 'مسجد القمر', 'مسجد الشمس', 'مسجد الأرز',
        'مسجد الزيتون', 'مسجد الرومان', 'مسجد التمر', 'مسجد الحب',
        'مسجد الود', 'مسجد السلفة', 'مسجد التقوى', 'مسجد الخير',
        'مسجد البركة', 'مسجد الرزق', 'مسجد النعمة', 'مسجد الحكمة',
        'مسجد الإصلاح', 'مسجد التعاون',
    ];

    const maintenanceDescriptions = [
        'تجديد السجاد - المساحة ٢٠٠ م²',
        'تكييف المصلى الرئيسي لخدمة ٣٠٠ مصلٍّ',
        'إصلاح شبكة السباكة الداخلية لدورات المياه',
        'دهان وتجديد الواجهة الخارجية والجدران الداخلية',
        'تجديد كامل منظومة الإنارة والكهرباء',
        'توسعة المصلى بطابق ثانٍ',
        'إصلاح السقف والتسربات المائية',
        'تجديد أبواب وشبابيك المسجد',
        'تنظيف وعزل الخزانات المائية',
        'صيانة شرائط التحفيف والمراوح',
        'إعادة تصميم داخلي للمنطقة النسائية',
        'تركيب نظام صوي بجودة عالية',
        'إصلاح التهوية والتكييف المركزي',
        'تجديد الأدوات السنية وأرضيات دورات المياه',
        'عزل حراري للمصلى',
        'تركيب إضاءة LED موفرة للطاقة',
        'إعادة بناء منطقة وضوء درجة أولى',
        'صيانة نوافذ الحديد والكاسات',
        'إعادة تخطيط الممرات والمخارج',
        'تجديد أسقف معلقة وتكسيات جديدة',
        'صيانة شاملة لنظام الصرف الصحي',
        'إعادة رسم الجدران وتركيب لوحات تذهب',
        'تركيب أجهزة إطفاء الحريق والأمان',
        'تجديد وعزل الأساسات والجدران الخارجية',
        'صيانة الأرضيات والسيراميك المتضرر',
    ];

    const maintenanceTypes = [
        [MaintenanceType.Carpentry],
        [MaintenanceType.AC_Repair],
        [MaintenanceType.Plumbing],
        [MaintenanceType.Painting],
        [MaintenanceType.Electrical],
        [MaintenanceType.Other],
        [MaintenanceType.Carpentry, MaintenanceType.Painting],
        [MaintenanceType.AC_Repair, MaintenanceType.Electrical],
        [MaintenanceType.Plumbing, MaintenanceType.Electrical],
        [MaintenanceType.Painting, MaintenanceType.Carpentry],
    ];

    const circleNames = [
        'حلقة نور العلم', 'حلقة السيدات للتحفيظ', 'حلقة الإخوة للرجال',
        'حلقة الصغار المميزة', 'حلقة القراءات العشر', 'حلقة أمهات المؤمنين',
        'حلقة الشباب الواعي', 'حلقة رياض الجنة', 'حلقة السنة النبوية',
        'حلقة أساسيات الإسلام', 'حلقة الفقه الإسلامي', 'حلقة التفسير المميز',
        'حلقة التجويد للجميع', 'حلقة الحديث الشريف', 'حلقة العقيدة السلفية',
        'حلقة الدعوة والتوعية', 'حلقة الأخلاق والآداب', 'حلقة تربية الأطفال',
        'حلقة إعادة التأهيل', 'حلقة الإمامة والخطابة', 'حلقة الحفاظ',
        'حلقة التطبيق العملي', 'حلقة السيرة النبوية', 'حلقة أحكام الصلاة',
        'حلقة أحكام زكاة', 'حلقة أحكام الصيام', 'حلقة أحكام الحج',
        'حلقة دروس الجمعة', 'حلقة المسابقات القرآنية', 'حلقة المتقدمين',
        'حلقة الأساسيين', 'حلقة المبتدئين', 'حلقة الشباب المتدين',
        'حلقة كبار السن', 'حلقة الموظفين', 'حلقة الطلاب',
        'حلقة العاملين', 'حلقة الأساتذة', 'حلقة الأطباء',
        'حلقة المهندسين', 'حلقة الفنانين', 'حلقة الصانعين',
        'حلقة التجار', 'حلقة الفلاحين', 'حلقة الحرفيين',
        'حلقة الباعة', 'حلقة الموصيين',
    ];

    // Geographic distribution for coordinates
    const cityCoordinates: Record<string, [number, number]> = {
        'القاهرة': [30.0444, 31.2357],
        'الجيزة': [30.0131, 31.2089],
        'الإسكندرية': [31.2001, 29.9187],
        'الدقهلية': [31.04, 31.37],
        'الشرقية': [30.58, 31.51],
        'البحيرة': [31.03, 30.47],
        'المنيا': [28.1198, 30.7381],
        'بني سويف': [29.0711, 31.1075],
        'الغربية': [30.6815, 31.0226],
        'المنوفية': [30.5047, 31.1499],
    };

    // Seed Imams (50 items)
    const imams = [];
    const availableAreas = Object.keys(areaMap).map(key => ({ key, areaId: areaMap[key] }));
    const statuses = [SubmissionStatus.approved, SubmissionStatus.pending, SubmissionStatus.approved, SubmissionStatus.approved];
    
    for (let i = 0; i < 50; i++) {
        const nameIdx = i % arabicNames.length;
        const mosqueIdx = i % mosqueNames.length;
        const areaIdx = i % availableAreas.length;
        const statusIdx = i % statuses.length;
        const area = availableAreas[areaIdx];
        
        const coords = cityCoordinates['القاهرة']; // Default coords
        const baseLat = coords[0] + (Math.random() - 0.5) * 0.5;
        const baseLng = coords[1] + (Math.random() - 0.5) * 0.5;

        imams.push({
            imamName: `الشيخ ${arabicNames[nameIdx]?.first || 'محمد'} ${arabicNames[nameIdx]?.last || 'السعيد'}`,
            mosqueName: mosqueNames[mosqueIdx] || 'مسجد جديد',
            governorate: 'القاهرة',
            city: 'القاهرة',
            district: `منطقة-${i + 1}`,
            areaId: area.areaId,
            latitude: baseLat,
            longitude: baseLng,
            googleMapsUrl: toMapUrl(baseLat, baseLng),
            videoUrl: i % 3 === 0 ? 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' : undefined,
            whatsapp: `+201${String(i + 1).padStart(10, '0')}`,
            status: statuses[statusIdx] || SubmissionStatus.approved,
            adminId: statuses[statusIdx] === SubmissionStatus.approved ? superAdmin.id : undefined,
        });
    }

    for (const imam of imams) {
        await prisma.imam.create({ data: imam });
    }
    console.log(`✅ ${imams.length} imams seeded`);

    // Seed Halaqat (50 items)
    const halaqat = [];
    const halqaTypes = [HalqaType.children, HalqaType.men, HalqaType.women];
    
    for (let i = 0; i < 50; i++) {
        const circleIdx = i % circleNames.length;
        const mosqueIdx = i % mosqueNames.length;
        const areaIdx = i % availableAreas.length;
        const statusIdx = i % statuses.length;
        const typeIdx = i % halqaTypes.length;
        const area = availableAreas[areaIdx];
        
        const coords = cityCoordinates['القاهرة'];
        const baseLat = coords[0] + (Math.random() - 0.5) * 0.5;
        const baseLng = coords[1] + (Math.random() - 0.5) * 0.5;

        halaqat.push({
            circleName: circleNames[circleIdx] || 'حلقة جديدة',
            mosqueName: mosqueNames[mosqueIdx] || 'مسجد جديد',
            halqaType: halqaTypes[typeIdx] || HalqaType.children,
            governorate: 'القاهرة',
            city: 'القاهرة',
            district: `منطقة-${i + 1}`,
            areaId: area.areaId,
            latitude: baseLat,
            longitude: baseLng,
            googleMapsUrl: toMapUrl(baseLat, baseLng),
            videoUrl: i % 2 === 0 ? 'https://www.youtube.com/watch?v=J---aiyznGQ' : undefined,
            whatsapp: `+201${String(i + 101).padStart(10, '0')}`,
            additionalInfo: `الدرس كل أسبوع يوم ${['السبت', 'الأحد', 'الاثنين', 'الثلاثاء'][i % 4]}`,
            status: statuses[statusIdx] || SubmissionStatus.approved,
            adminId: statuses[statusIdx] === SubmissionStatus.approved ? superAdmin.id : undefined,
        });
    }

    for (const halqa of halaqat) {
        await prisma.halqa.create({ data: halqa });
    }
    console.log(`✅ ${halaqat.length} halaqat seeded`);

    // Seed Maintenance Requests (50 items)
    const maintenance = [];
    
    for (let i = 0; i < 50; i++) {
        const mosqueIdx = i % mosqueNames.length;
        const areaIdx = i % availableAreas.length;
        const statusIdx = i % statuses.length;
        const descIdx = i % maintenanceDescriptions.length;
        const typeIdx = i % maintenanceTypes.length;
        const area = availableAreas[areaIdx];
        
        const coords = cityCoordinates['القاهرة'];
        const baseLat = coords[0] + (Math.random() - 0.5) * 0.5;
        const baseLng = coords[1] + (Math.random() - 0.5) * 0.5;
        
        const baseCost = 5000 + (i * 1000);

        maintenance.push({
            mosqueName: mosqueNames[mosqueIdx] || 'مسجد جديد',
            governorate: 'القاهرة',
            city: 'القاهرة',
            district: `منطقة-${i + 1}`,
            areaId: area.areaId,
            latitude: baseLat,
            longitude: baseLng,
            googleMapsUrl: toMapUrl(baseLat, baseLng),
            maintenanceTypes: maintenanceTypes[typeIdx] || [MaintenanceType.Other],
            description: maintenanceDescriptions[descIdx] || 'صيانة عامة وتحسينات',
            estimatedCostMin: baseCost,
            estimatedCostMax: baseCost + 10000 + (i * 500),
            whatsapp: `+201${String(i + 201).padStart(10, '0')}`,
            status: statuses[statusIdx] || SubmissionStatus.approved,
            adminId: statuses[statusIdx] === SubmissionStatus.approved ? superAdmin.id : undefined,
        });
    }

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
