'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useAuthStore } from '@/lib/store';
import { adminApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaBook, FaClipboardList, FaTools, FaUserTie } from 'react-icons/fa';

export default function AdminDashboard() {
    const t = useTranslations('admin');
    const locale = useLocale();
    const router = useRouter();
    const { token, admin } = useAuthStore();

    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) {
            router.push(`/${locale}/admin`);
            return;
        }
        void fetchStats();
    }, [token, locale, router]);

    const fetchStats = async () => {
        try {
            const data = await adminApi.getDashboardStats(token!);
            setStats(data);
        } catch {
            setStats(null);
        }
        setLoading(false);
    };

    const pendingCards = useMemo(() => ([
        {
            label: locale === 'ar' ? 'أئمة قيد المراجعة' : 'Pending Imams',
            count: stats?.pending?.imams || 0,
            color: 'text-primary',
            bg: 'bg-primary/10',
            icon: FaUserTie,
        },
        {
            label: locale === 'ar' ? 'حلقات قيد المراجعة' : 'Pending Halaqat',
            count: stats?.pending?.halaqat || 0,
            color: 'text-orange-600',
            bg: 'bg-orange-100',
            icon: FaBook,
        },
        {
            label: locale === 'ar' ? 'صيانة قيد المراجعة' : 'Pending Maintenance',
            count: stats?.pending?.maintenance || 0,
            color: 'text-red-600',
            bg: 'bg-red-100',
            icon: FaTools,
        },
    ]), [stats, locale]);

    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="rounded-xl border border-gray-200 bg-white p-6 animate-pulse">
                        <div className="h-7 bg-gray-200 rounded w-1/2 mb-3" />
                        <div className="h-4 bg-gray-200 rounded w-1/3" />
                    </div>
                ))}
            </div>
        );
    }

    if (!stats) {
        return <p className="text-sm opacity-70">{locale === 'ar' ? 'تعذر تحميل الإحصائيات' : 'Could not load stats'}</p>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-2xl font-black">{t('dashboard')}</h1>
                    <p className="text-sm opacity-70 mt-1">
                        {locale === 'ar' ? 'نظرة عامة على طلبات المنصة وحالة المراجعة' : 'Overview of platform requests and review status'}
                    </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <Link href={`/${locale}/imams/submit`} className="btn-primary !py-2.5 !px-4 text-sm">{locale === 'ar' ? 'إضافة إمام' : 'Add Imam'}</Link>
                    <Link href={`/${locale}/halaqat/submit`} className="btn-outline !py-2.5 !px-4 text-sm">{locale === 'ar' ? 'إضافة حلقة' : 'Add Halqa'}</Link>
                    <Link href={`/${locale}/maintenance/submit`} className="btn-outline !py-2.5 !px-4 text-sm">{locale === 'ar' ? 'إضافة صيانة' : 'Add Maintenance'}</Link>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingCards.map((card, i) => {
                    const Icon = card.icon;
                    return (
                        <div key={i} className="rounded-xl border border-gray-200 bg-white p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm opacity-70">{card.label}</p>
                                    <p className={`text-3xl font-black ${card.color}`}>{card.count}</p>
                                </div>
                                <span className={`w-11 h-11 rounded-xl inline-flex items-center justify-center ${card.bg}`}>
                                    <Icon className={card.color} />
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title={locale === 'ar' ? 'إجمالي الأئمة' : 'Total Imams'} value={stats.total?.imams || 0} />
                <StatCard title={locale === 'ar' ? 'إجمالي الحلقات' : 'Total Halaqat'} value={stats.total?.halaqat || 0} />
                <StatCard title={locale === 'ar' ? 'إجمالي الصيانة' : 'Total Maintenance'} value={stats.total?.maintenance || 0} />
                <StatCard title={locale === 'ar' ? 'دورك الحالي' : 'Your role'} value={admin?.role?.replace('_', ' ') || '-'} icon={<FaClipboardList />} />
            </div>
        </div>
    );
}

function StatCard({ title, value, icon }: { title: string; value: string | number; icon?: React.ReactNode }) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between">
                <p className="text-sm opacity-70">{title}</p>
                {icon ? <span className="text-primary">{icon}</span> : null}
            </div>
            <p className="text-2xl font-black mt-2">{value}</p>
        </div>
    );
}
