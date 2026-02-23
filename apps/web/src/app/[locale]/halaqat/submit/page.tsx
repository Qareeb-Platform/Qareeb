'use client';

import { useLocale } from 'next-intl';
import SubmitPage from '@/app/[locale]/imams/submit/page';

// Halaqat submit page reuses the same multi-step form as Imams submit
// The form allows selecting entity type (imam, halqa, maintenance)
export default function HalaqatSubmitPage() {
    return <SubmitPage />;
}
