'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { adminApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

export default function AuditPage() {
    const t = useTranslations('admin');
    const locale = useLocale();
    const router = useRouter();
    const { token } = useAuthStore();
    const [data, setData] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) {
            router.push(`/${locale}/admin`);
            return;
        }
        fetchLogs(page);
    }, [token, page]);

    const fetchLogs = async (p: number) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: p.toString(), limit: '20' });
            const res = await adminApi.getAuditLogs(token!, params.toString());
            setData(res.data || []);
            setTotalPages(res.meta?.totalPages || 1);
        } catch (err) {
            console.error('Audit fetch error', err);
        }
        setLoading(false);
    };

    const formatDate = (d: string) => new Date(d).toLocaleString(locale === 'ar' ? 'ar-EG' : 'en-US');

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">{locale === 'ar' ? 'سجل التدقيق' : 'Audit Log'}</h1>
                    <p className="text-text-muted text-sm">{locale === 'ar' ? 'من قام بالمراجعة ومتى' : 'Who approved/edited and when'}</p>
                </div>
                <Link href={`/${locale}/admin/dashboard`} className="btn-outline">{t('dashboard')}</Link>
            </div>

            <div className="card p-4 overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead>
                        <tr className="text-left text-text-muted">
                            <th className="py-2 pe-4">{locale === 'ar' ? 'الكيان' : 'Entity'}</th>
                            <th className="py-2 pe-4">{locale === 'ar' ? 'الإجراء' : 'Action'}</th>
                            <th className="py-2 pe-4">{locale === 'ar' ? 'المستخدم' : 'User'}</th>
                            <th className="py-2 pe-4">{locale === 'ar' ? 'الوقت' : 'Time'}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {loading ? (
                            <tr><td className="py-6 text-center" colSpan={4}>{locale === 'ar' ? 'جار التحميل...' : 'Loading...'}</td></tr>
                        ) : data.length ? data.map((log: any) => (
                            <tr key={log.id} className="hover:bg-cream/60 transition-colors">
                                <td className="py-2 pe-4 font-bold">{log.entityType} / {log.entityId}</td>
                                <td className="py-2 pe-4 uppercase text-xs font-black text-primary">{log.action}</td>
                                <td className="py-2 pe-4 text-text-muted">{log.admin?.email || '—'}</td>
                                <td className="py-2 pe-4 text-text-muted">{formatDate(log.createdAt)}</td>
                            </tr>
                        )) : (
                            <tr><td className="py-6 text-center" colSpan={4}>{locale === 'ar' ? 'لا يوجد سجلات' : 'No entries'}</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="flex gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 5).map((p) => (
                        <button
                            key={p}
                            onClick={() => setPage(p)}
                            className={`px-3 py-2 rounded-btn text-sm font-medium ${p === page ? 'bg-primary text-white' : 'bg-white border border-border text-text'}`}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
