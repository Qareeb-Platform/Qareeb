import { useLocale } from 'next-intl';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function NotFound() {
    const locale = useLocale();
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 flex items-center justify-center bg-gray-50 px-4">
                <div className="text-center">
                    <h1 className="text-6xl font-black mb-4">404</h1>
                    <p className="text-xl mb-6">
                        {locale === 'ar' ? 'الصفحة غير موجودة' : 'Page not found'}
                    </p>
                    <Link
                        href={`/${locale}`}
                        className="btn-primary px-8 py-4 text-lg"
                    >
                        {locale === 'ar' ? 'العودة للصفحة الرئيسية' : 'Back home'}
                    </Link>
                </div>
            </main>
            <Footer />
        </div>
    );
}