import Link from 'next/link';

export default function AboutPage({ params: { locale } }: { params: { locale: string } }) {
    const isAr = locale === 'ar';

    return (
        <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
            <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
                <h1 className="text-3xl font-bold">{isAr ? 'عن قريب' : 'About Qareeb'}</h1>
                <p className="mt-4 leading-7 text-slate-700">
                    {isAr
                        ? 'قريب منصة مجتمعية تساعد المسلمين على الوصول إلى الأئمة وحلقات التحفيظ وطلبات صيانة المساجد بسهولة.'
                        : 'Qareeb is a community platform that helps Muslims discover nearby imams, Quran circles, and mosque maintenance requests.'}
                </p>
                <p className="mt-3 leading-7 text-slate-700">
                    {isAr
                        ? 'نراجع البيانات قبل نشرها لضمان الجودة، ونسهّل التواصل المباشر عبر واتساب.'
                        : 'Submissions are reviewed before publishing, and direct WhatsApp contact is supported for fast communication.'}
                </p>
                <Link
                    href={`/${locale}`}
                    className="mt-8 inline-flex rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                    {isAr ? 'العودة للرئيسية' : 'Back to home'}
                </Link>
            </div>
        </main>
    );
}
