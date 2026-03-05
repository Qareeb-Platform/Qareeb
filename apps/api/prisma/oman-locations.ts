export const OMAN_GOVERNORATES = [
    { id: 'muscat', name: 'مسقط', nameEn: 'Muscat' },
    { id: 'dhofar', name: 'ظفار', nameEn: 'Dhofar' },
    { id: 'musandam', name: 'مسندم', nameEn: 'Musandam' },
    { id: 'alburaymi', name: 'البريمي', nameEn: 'Al Buraymi' },
    { id: 'adDakhiliyah', name: 'الداخلية', nameEn: 'Ad Dakhiliyah' },
    { id: 'northAlBatinah', name: 'شمال الباطنة', nameEn: 'North Al Batinah' },
    { id: 'southAlBatinah', name: 'جنوب الباطنة', nameEn: 'South Al Batinah' },
    { id: 'northAlSharqiyah', name: 'شمال الشرقية', nameEn: 'North Al Sharqiyah' },
    { id: 'southAlSharqiyah', name: 'جنوب الشرقية', nameEn: 'South Al Sharqiyah' },
    { id: 'adDhahirah', name: 'الظاهرة', nameEn: 'Ad Dhahirah' },
    { id: 'alWusta', name: 'الوسطى', nameEn: 'Al Wusta' },
] as const;

export const OMAN_WILAYAT: Record<string, string[]> = {
    muscat: ['مطرح', 'بوشر', 'العامرات', 'قريات', 'السيب', 'مسقط'],
    dhofar: ['صلالة', 'طاقة', 'ظفار', 'رخيوت', 'مرباط', 'سدح', 'شليم وجزر الحلانيات', 'الدهاريز', 'المزيونة', 'ضلكوت'],
    musandam: ['خصب', 'بخاء', 'دبا', 'مدحاء'],
    alburaymi: ['البريمي', 'محضة', 'ينقل'],
    adDakhiliyah: ['نزوى', 'بهلاء', 'منح', 'عبري', 'الحمراء', 'إزكي', 'سمائل', 'الجبل الأخضر', 'بدبد'],
    northAlBatinah: ['صحار', 'شناص', 'لوى', 'صحم', 'الخابورة', 'السويق'],
    southAlBatinah: ['الرستاق', 'العوابي', 'نخل', 'وادي المعاول', 'بركاء', 'مسقط'],
    northAlSharqiyah: ['إبراء', 'المضيبي', 'دما والطائيين', 'الكامل والوافي', 'بدية', 'وادي بني خالد'],
    southAlSharqiyah: ['صور', 'جعلان بني بو علي', 'جعلان بني بو حسن', 'مصيرة', 'سناو'],
    adDhahirah: ['عبري', 'ينقل', 'المحضة', 'دنك'],
    alWusta: ['هيما', 'محوت', 'الجازر', 'الدقم'],
};

export const OMAN_GOV_COORDS: Record<string, { lat: number; lng: number }> = {
    muscat: { lat: 23.6139, lng: 58.5922 },
    dhofar: { lat: 17.0151, lng: 54.0924 },
    musandam: { lat: 26.1833, lng: 56.25 },
    alburaymi: { lat: 24.25, lng: 55.7833 },
    adDakhiliyah: { lat: 22.9333, lng: 57.5333 },
    northAlBatinah: { lat: 24.3643, lng: 56.7468 },
    southAlBatinah: { lat: 23.3906, lng: 57.4244 },
    northAlSharqiyah: { lat: 22.6906, lng: 58.5334 },
    southAlSharqiyah: { lat: 22.5667, lng: 59.5289 },
    adDhahirah: { lat: 23.2257, lng: 56.5157 },
    alWusta: { lat: 20.6492, lng: 57.5248 },
};
