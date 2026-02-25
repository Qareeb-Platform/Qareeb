'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { adminApi } from '@/lib/api';

export default function AdminLoginPage() {
    const t = useTranslations('admin');
    const locale = useLocale();
    const router = useRouter();
    const { setAuth } = useAuthStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await adminApi.login(email, password);
            setAuth(result.access_token, result.admin);
            router.push(`/${locale}/admin/dashboard`);
        } catch {
            setError(locale === 'ar' ? 'بيانات الدخول غير صحيحة' : 'Invalid credentials');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="w-full max-w-md mx-4">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-fab">
                        <span className="text-white text-2xl font-bold">ق</span>
                    </div>
                    <h1 className="text-2xl font-bold text-text">{locale === 'ar' ? 'لوحة تحكم قريب' : 'Qareeb Dashboard'}</h1>
                    <p className="text-text-muted mt-1">{t('login')}</p>
                </div>

                <form onSubmit={handleLogin} className="card p-8 space-y-6">
                    {error && (
                        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
                    )}

                    <div>
                        <label className="block text-sm font-medium mb-2">{t('email')}</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input-field"
                            placeholder="admin@qareeb.app"
                            dir="ltr"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">{t('password')}</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input-field"
                            dir="ltr"
                            required
                        />
                    </div>

                    <button type="submit" disabled={loading} className="btn-primary w-full">
                        {loading ? (locale === 'ar' ? 'جاري الدخول...' : 'Signing in...') : t('loginBtn')}
                    </button>
                </form>

                <p className="text-center text-sm text-text-muted mt-6">
                    {locale === 'ar' ? 'منصة قريب — مشروع غير ربحي' : 'Qareeb Platform — Non-profit Project'}
                </p>
            </div>
        </div>
    );
}
