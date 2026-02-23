'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import FAB from '@/components/ui/FAB';
import ChatWidget from '@/components/chat/ChatWidget';
import { api } from '@/lib/api';
import { useGeolocationStore } from '@/lib/store';
import { getWhatsAppUrl } from '@/lib/utils';

const maintenanceLabels: Record<string, Record<string, string>> = {
    ar: { flooring: 'أرضيات', ac: 'تكييف', plumbing: 'سباكة', painting: 'دهان', furniture: 'أثاث', electrical: 'كهرباء', other: 'أخرى' },
    en: { flooring: 'Flooring', ac: 'AC', plumbing: 'Plumbing', painting: 'Painting', furniture: 'Furniture', electrical: 'Electrical', other: 'Other' },
};

export default function MaintenancePage() {
    const t = useTranslations('maintenance');
    const tc = useTranslations('common');
    const locale = useLocale();
    const { lat, lng, requestLocation } = useGeolocationStore();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { requestLocation(); }, []);
    useEffect(() => { fetchData(); }, [lat, lng]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (lat && lng) { params.set('lat', lat.toString()); params.set('lng', lng.toString()); params.set('radius', '15000'); }
            const result = await api.getMaintenance(params.toString());
            setData(result);
        } catch (err) { console.error('Error:', err); }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />
            <main className="flex-1">
                <div className="bg-gradient-to-br from-[#1B6B45] to-[#2D8A5E] text-white py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <span className="inline-block bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold mb-4 uppercase tracking-widest text-white/90">
                            {locale === 'ar' ? 'إعمار المساجد' : 'Mosque Maintenance'}
                        </span>
                        <h1 className="text-4xl md:text-5xl font-black mb-4">{t('title')}</h1>
                        <p className="text-white/80 text-lg max-w-2xl">{t('subtitle')}</p>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="card p-6 animate-pulse"><div className="h-4 bg-gray-200 rounded w-3/4 mb-4" /><div className="h-3 bg-gray-200 rounded w-full mb-2" /><div className="h-3 bg-gray-200 rounded w-2/3" /></div>
                            ))}
                        </div>
                    ) : data?.data?.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {data.data.map((item: any) => (
                                <div key={item.id} className="bg-white rounded-[24px] overflow-hidden shadow-card border border-border group hover:-translate-y-1 transition-all duration-300 animate-fade-in p-6 flex flex-col">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <h3 className="font-black text-xl text-dark leading-tight group-hover:text-primary transition-colors">{item.mosque_name || item.mosqueName}</h3>
                                            <div className="flex items-center gap-1.5 mt-2 text-text-muted font-bold text-sm">
                                                <span className="text-primary text-lg">🕌</span>
                                                {item.governorate} — {item.city}
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap justify-end gap-1.5 max-w-[150px]">
                                            {(item.maintenance_types || item.maintenanceTypes || []).map((type: string) => (
                                                <span key={type} className="inline-flex items-center px-2 py-0.5 bg-red-50 text-red-700 rounded-md text-[9px] font-black uppercase border border-red-100">
                                                    {maintenanceLabels[locale]?.[type] || type}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3 mb-6 p-4 bg-cream rounded-2xl border border-primary/5 flex-1">
                                        <p className="text-sm text-text font-medium leading-relaxed line-clamp-3 italic">
                                            " {item.description} "
                                        </p>

                                        {(item.estimated_cost_min || item.estimatedCostMin) && (
                                            <div className="mt-2 pt-3 border-t border-border flex items-center justify-between">
                                                <span className="text-[10px] font-black uppercase text-text-muted">{locale === 'ar' ? 'التكلفة التقديرية' : 'Est. Cost'}</span>
                                                <span className="text-sm font-black text-primary">
                                                    {item.estimated_cost_min || item.estimatedCostMin} - {item.estimated_cost_max || item.estimatedCostMax}
                                                    <span className="text-[10px] ms-1">{locale === 'ar' ? 'ج.م' : 'EGP'}</span>
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mt-auto">
                                        <Link href={`/${locale}/maintenance/${item.id}`} className="btn-outline !py-3 !px-2 text-xs text-center truncate">{tc('viewDetails')}</Link>
                                        <a href={getWhatsAppUrl(item.whatsapp)} target="_blank" rel="noopener noreferrer" className="btn-primary !py-3 !px-2 text-xs flex items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(27,107,69,0.25)] bg-[#1B6B45]">{tc('whatsapp')}</a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16"><h3 className="text-lg font-semibold mb-2">{tc('noResults')}</h3></div>
                    )}
                </div>
            </main>
            <Footer />
            <FAB />
            <ChatWidget />
        </div>
    );
}
