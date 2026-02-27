'use client';

import { ReactNode } from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

interface ErrorProps {
    error: Error;
    reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorProps) {
    const locale = useLocale();

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 flex items-center justify-center bg-gray-50 px-4">
                <div className="text-center">
                    <h1 className="text-6xl font-black mb-4">😕</h1>
                    <p className="text-xl mb-6">
                        {locale === 'ar'
                            ? 'حدث خطأ غير متوقع' 
                            : 'Something went wrong.'}
                    </p>
                    <p className="text-sm text-text-muted mb-6">
                        {locale === 'ar' ? error.message : error.message}
                    </p>
                    <div className="flex justify-center gap-4">
                        <button
                            onClick={() => reset()}
                            className="btn-outline px-6 py-3"
                        >
                            {locale === 'ar' ? 'حاول مرة أخرى' : 'Try again'}
                        </button>
                        <Link
                            href={`/${locale}`}
                            className="btn-primary px-6 py-3"
                        >
                            {locale === 'ar' ? 'العودة للصفحة الرئيسية' : 'Back home'}
                        </Link>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}