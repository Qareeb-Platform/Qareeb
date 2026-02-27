'use client';

import UnifiedCard from '@/components/public/UnifiedCard';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useToastStore } from '@/lib/store';

type EntityType = 'imam' | 'halqa' | 'maintenance';

interface LatestUnifiedCardProps {
    id: string;
    entity: EntityType;
    name: string;
    mosque?: string;
    location?: string;
    typeLabel: string;
    typeIcon: string;
    link: string;
    map?: string;
    video?: string;
    whatsapp?: string;
    online?: boolean;
    images?: string[];
}

export default function LatestUnifiedCard({
    id,
    entity,
    name,
    mosque,
    location,
    typeLabel,
    typeIcon,
    link,
    map,
    video,
    whatsapp,
    online,
    images,
}: LatestUnifiedCardProps) {
    const locale = useLocale();
    const router = useRouter();
    const { pushToast } = useToastStore();

    const card = {
        id,
        entity,
        name,
        mosque,
        location,
        typeLabel,
        typeIcon,
        map,
        video,
        whatsapp,
        online: online ?? false,
        images: images || [],
        raw: undefined,
    };

    const handleShare = async () => {
        const shareUrl = link || `/${locale}/${entity}/${id}`;
        try {
            if (navigator.share) {
                await navigator.share({ url: shareUrl });
                return;
            }
            await navigator.clipboard.writeText(shareUrl);
            pushToast(locale === 'ar' ? 'تم نسخ الرابط' : 'Link copied', 'success');
        } catch {
            pushToast(locale === 'ar' ? 'تعذر مشاركة الرابط' : 'Unable to share link', 'error');
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <UnifiedCard
                card={card}
                showWhatsApp={entity !== 'imam'}
                showImages={entity === 'maintenance'}
                onViewDetails={() => router.push(link || `/${locale}/${entity}/${id}`)}
            />
            <button
                className="btn-outline !py-2 !px-3 text-xs font-bold text-center"
                onClick={handleShare}
            >
                {locale === 'ar' ? '📤 مشاركة' : '📤 Share'}
            </button>
        </div>
    );
}

