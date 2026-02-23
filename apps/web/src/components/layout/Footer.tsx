'use client';

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';

export default function Footer() {
    const t = useTranslations('nav');
    const tc = useTranslations('common');
    const locale = useLocale();

    return (
        <footer className="bg-gray-900 text-gray-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center">
                                <span className="text-white text-xl font-bold">ق</span>
                            </div>
                            <span className="text-xl font-bold text-white">{tc('appName')}</span>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed">{tc('tagline')}</p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">
                            {locale === 'ar' ? 'روابط سريعة' : 'Quick Links'}
                        </h3>
                        <div className="flex flex-col gap-2">
                            <Link href={`/${locale}/imams`} className="text-gray-400 hover:text-primary transition-colors text-sm">
                                {t('imams')}
                            </Link>
                            <Link href={`/${locale}/halaqat`} className="text-gray-400 hover:text-primary transition-colors text-sm">
                                {t('halaqat')}
                            </Link>
                            <Link href={`/${locale}/maintenance`} className="text-gray-400 hover:text-primary transition-colors text-sm">
                                {t('maintenance')}
                            </Link>
                        </div>
                    </div>

                    {/* Add Service */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">
                            {locale === 'ar' ? 'ساهم معنا' : 'Contribute'}
                        </h3>
                        <p className="text-gray-400 text-sm mb-4">
                            {locale === 'ar'
                                ? 'ساعد مجتمعك بإضافة معلومات الخدمات الدينية القريبة منك'
                                : 'Help your community by adding information about nearby religious services'}
                        </p>
                        <Link href={`/${locale}/imams/submit`} className="btn-primary text-sm !px-4 !py-2">
                            {t('submit')}
                        </Link>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
                    <p>© 2024 {tc('appName')}. {locale === 'ar' ? 'جميع الحقوق محفوظة' : 'All rights reserved'}.</p>
                    <p className="mt-1">{locale === 'ar' ? 'مشروع غير ربحي لخدمة المجتمع' : 'A non-profit community service project'}</p>
                </div>
            </div>
        </footer>
    );
}
