'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useAuthStore } from '@/lib/store';
import { adminApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminDashboard() {
    const t = useTranslations('admin');
    const locale = useLocale();
    const router = useRouter();
    const { token } = useAuthStore();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) {
            router.push(`/${locale}/admin`);
            return;
        }
        fetchStats();
    }, [token]);

    const fetchStats = async () => {
        try {
            const data = await adminApi.getDashboardStats(token!);
            setStats(data);
        } catch (err) {
            console.error('Dashboard error:', err);
        }
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (<div key={i} className="card p-6 animate-pulse"><div className="h-8 bg-gray-200 rounded w-1/2 mb-2" /><div className="h-4 bg-gray-200 rounded w-1/3" /></div>))}
                </div>
            </div>
        );
    }

    if (!stats) return null;

    const pendingCards = [
        { label: locale === 'ar' ? 'أئمة قيد المراجعة' : 'Pending Imams', count: stats.pending?.imams || 0, color: 'text-primary', bg: 'bg-primary-light', icon: '🕌' },
        { label: locale === 'ar' ? 'حلقات قيد المراجعة' : 'Pending Circles', count: stats.pending?.halaqat || 0, color: 'text-halqa', bg: 'bg-orange-50', icon: '📖' },
        { label: locale === 'ar' ? 'صيانة قيد المراجعة' : 'Pending Maintenance', count: stats.pending?.maintenance || 0, color: 'text-maintenance', bg: 'bg-red-50', icon: '🔧' },
    ];

    const totalCards = [
        { label: locale === 'ar' ? 'إجمالي الأئمة' : 'Total Imams', count: stats.total?.imams || 0 },
        { label: locale === 'ar' ? 'إجمالي الحلقات' : 'Total Circles', count: stats.total?.halaqat || 0 },
        { label: locale === 'ar' ? 'إجمالي الصيانة' : 'Total Maintenance', count: stats.total?.maintenance || 0 },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold mb-1">{t('dashboard')}</h1>
                <p className="text-text-muted">{locale === 'ar' ? 'نظرة عامة على المنصة' : 'Platform overview'}</p>
            </div>

            <div className="flex flex-wrap gap-3">
                <Link href={`/${locale}/imams/submit`} className="btn-primary !py-3">
                    {locale === 'ar' ? '➕ إضافة إمام' : '➕ Add Imam'}
                </Link>
                <Link href={`/${locale}/halaqat/submit`} className="btn-outline !py-3">
                    {locale === 'ar' ? '➕ إضافة حلقة' : '➕ Add Halqa'}
                </Link>
                <Link href={`/${locale}/maintenance/submit`} className="btn-outline !py-3">
                    {locale === 'ar' ? '➕ إضافة صيانة' : '➕ Add Maintenance'}
                </Link>
                <Link href={`/${locale}/admin/audit`} className="btn-outline !py-3">
                    {locale === 'ar' ? 'سجل التدقيق' : 'Audit Log'}
                </Link>
            </div>

            {/* Pending Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingCards.map((card, i) => (
                    <div key={i} className="card p-6 animate-fade-in">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-text-muted mb-1">{card.label}</p>
                                <p className={`text-3xl font-bold ${card.color}`}>{card.count}</p>
                            </div>
                            <div className={`w-12 h-12 ${card.bg} rounded-xl flex items-center justify-center text-2xl`}>
                                {card.icon}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Total Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {totalCards.map((card, i) => (
                    <div key={i} className="card p-6">
                        <p className="text-sm text-text-muted mb-1">{card.label}</p>
                        <p className="text-2xl font-bold text-text">{card.count}</p>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* By Governorate */}
                <div className="card p-6">
                    <h3 className="font-semibold mb-4">{t('submissionsByGov')}</h3>
                    <div className="space-y-3">
                        {(stats.byGovernorate || []).map((item: any, i: number) => {
                            const maxCount = Math.max(...(stats.byGovernorate || []).map((g: any) => g.count), 1);
                            return (
                                <div key={i} className="flex items-center gap-3">
                                    <span className="text-sm w-20 shrink-0 text-text-muted">{item.name}</span>
                                    <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                                        <div
                                            className="h-full gradient-bg rounded-full flex items-center justify-end px-2 transition-all duration-500"
                                            style={{ width: `${(item.count / maxCount) * 100}%` }}
                                        >
                                            <span className="text-xs text-white font-medium">{item.count}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Maintenance Breakdown */}
                <div className="card p-6">
                    <h3 className="font-semibold mb-4">{t('maintenanceBreakdown')}</h3>
                    <div className="space-y-3">
                        {(stats.maintenanceTypeBreakdown || []).map((item: any, i: number) => {
                            const typeLabels: Record<string, string> = locale === 'ar'
                                ? { flooring: 'أرضيات', ac: 'تكييف', plumbing: 'سباكة', painting: 'دهان', furniture: 'أثاث', electrical: 'كهرباء', other: 'أخرى' }
                                : {};
                            return (
                                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <span className="text-sm font-medium">{typeLabels[item.type] || item.type}</span>
                                    <span className="badge bg-red-100 text-red-800 text-xs">{item.count}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Last 30 Days */}
                <div className="card p-6 lg:col-span-2">
                    <h3 className="font-semibold mb-4">{t('last30Days')}</h3>
                    <div className="flex items-end gap-1 h-32">
                        {(stats.last30Days || []).slice(-30).map((item: any, i: number) => {
                            const maxCount = Math.max(...(stats.last30Days || []).map((d: any) => d.count), 1);
                            return (
                                <div key={i} className="flex-1 flex flex-col items-center gap-1" title={`${item.date}: ${item.count}`}>
                                    <div
                                        className="w-full gradient-bg rounded-t transition-all duration-300 min-h-[4px]"
                                        style={{ height: `${(item.count / maxCount) * 100}%` }}
                                    />
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-text-muted">
                        <span>{stats.last30Days?.[0]?.date || ''}</span>
                        <span>{stats.last30Days?.[stats.last30Days.length - 1]?.date || ''}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
