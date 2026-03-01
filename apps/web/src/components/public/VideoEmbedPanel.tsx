'use client';

import { useState } from 'react';
import { getEmbeddableVideoUrl } from '@/lib/video';

type VideoEmbedPanelProps = {
    locale: string;
    url: string;
    title: string;
};

export default function VideoEmbedPanel({ locale, url, title }: VideoEmbedPanelProps) {
    const embedUrl = getEmbeddableVideoUrl(url);
    const [loadEmbed, setLoadEmbed] = useState(false);

    if (!embedUrl) {
        return (
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-bold underline break-all"
            >
                {url}
            </a>
        );
    }

    if (!loadEmbed) {
        return (
            <div className="rounded-2xl border border-primary/10 bg-white p-4 flex items-center justify-center">
                <button
                    type="button"
                    onClick={() => setLoadEmbed(true)}
                    className="btn-primary !py-2.5 !px-4 text-sm"
                >
                    {locale === 'ar' ? 'تشغيل الفيديو' : 'Load video'}
                </button>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-primary/10 bg-black/5">
            <div className="aspect-video w-full">
                <iframe
                    src={embedUrl}
                    title={title}
                    className="h-full w-full"
                    loading="lazy"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                />
            </div>
        </div>
    );
}
