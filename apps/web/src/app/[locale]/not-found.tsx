'use client';

import { useLocale } from 'next-intl';
import ErrorScreen from '@/components/ErrorScreen';

export default function NotFound() {
    const locale = useLocale();
    return <ErrorScreen status={404} locale={locale} />;
}
