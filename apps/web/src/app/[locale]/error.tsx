'use client';

import { useLocale } from 'next-intl';
import ErrorScreen from '@/components/ErrorScreen';

interface ErrorProps {
    error: Error;
    reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorProps) {
    const locale = useLocale();
    const status = (error as any)?.status || 500;

    return <ErrorScreen status={status} locale={locale} reset={reset} />;
}