'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';

type LocationMapSectionProps = {
    mapEmbedUrl: string;
    titleId?: string;
};

export default function LocationMapSection({ mapEmbedUrl, titleId = 'location-map' }: LocationMapSectionProps) {
    const locale = useLocale();
    const [loadMap, setLoadMap] = useState(false);

    return (
        <div className="p-4 bg-white rounded-2xl border border-border shadow-sm">
            <h3 className="font-black text-primary text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
                <span>🗺️</span> {locale === 'ar' ? 'الموقع على الخريطة' : 'Location on Map'}
            </h3>
            <div className="w-full aspect-video rounded-xl overflow-hidden border border-border">
                {loadMap ? (
                    <iframe
                        src={mapEmbedUrl}
                        className="w-full h-full"
                        loading="lazy"
                        allowFullScreen
                        title={titleId}
                        referrerPolicy="no-referrer-when-downgrade"
                    />
                ) : (
                    <div className="w-full h-full bg-cream flex items-center justify-center p-4">
                        <button
                            type="button"
                            onClick={() => setLoadMap(true)}
                            className="btn-primary !py-2.5 !px-4 text-sm"
                        >
                            {locale === 'ar' ? 'عرض الخريطة' : 'Load map'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
