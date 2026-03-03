'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLocale } from 'next-intl';
import { adminApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

type Group = 'WHATSAPP' | 'CLOUDINARY';

type SettingView = {
    key: string;
    valueMasked: string;
    group: string;
    isSecret: boolean;
    hasValue: boolean;
    updatedAt: string;
};

type FieldDef = {
    key: string;
    labelAr: string;
    labelEn: string;
    placeholder: string;
    isSecret: boolean;
    type?: 'text' | 'checkbox';
};

const GROUP_FIELDS: Record<Group, FieldDef[]> = {
    WHATSAPP: [
        { key: 'WHAPI_ENABLED', labelAr: 'تفعيل واتساب', labelEn: 'Enable WhatsApp', placeholder: '', isSecret: false, type: 'checkbox' },
        { key: 'WHAPI_BASE_URL', labelAr: 'رابط Whapi', labelEn: 'Whapi Base URL', placeholder: 'https://gate.whapi.cloud', isSecret: false },
        { key: 'WHAPI_TOKEN', labelAr: 'توكن Whapi', labelEn: 'Whapi Token', placeholder: 'Update Secret', isSecret: true },
        { key: 'WHAPI_INSTANCE_ID', labelAr: 'معرف الانستانس', labelEn: 'Instance ID', placeholder: 'Optional', isSecret: false },
    ],
    CLOUDINARY: [
        { key: 'CLOUDINARY_CLOUD_NAME', labelAr: 'Cloud Name', labelEn: 'Cloud Name', placeholder: 'djseokhow', isSecret: false },
        { key: 'CLOUDINARY_API_KEY', labelAr: 'Cloudinary API Key', labelEn: 'Cloudinary API Key', placeholder: 'Update Secret', isSecret: true },
        { key: 'CLOUDINARY_API_SECRET', labelAr: 'Cloudinary API Secret', labelEn: 'Cloudinary API Secret', placeholder: 'Update Secret', isSecret: true },
        { key: 'CLOUDINARY_URL', labelAr: 'Cloudinary URL', labelEn: 'Cloudinary URL', placeholder: 'Optional', isSecret: false },
    ],
};

export default function AdminSettingsPage() {
    const locale = useLocale();
    const isAr = locale === 'ar';
    const { token, admin } = useAuthStore();

    const [activeTab, setActiveTab] = useState<Group>('WHATSAPP');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [settingsMap, setSettingsMap] = useState<Record<string, SettingView>>({});
    const [form, setForm] = useState<Record<string, string | boolean>>({});

    const fields = useMemo(() => GROUP_FIELDS[activeTab], [activeTab]);

    const loadGroup = async (group: Group) => {
        if (!token) return;
        setLoading(true);
        setError('');
        setMessage('');
        try {
            const rows = await adminApi.getSettingsByGroup(token, group) as SettingView[];
            const nextMap: Record<string, SettingView> = {};
            const nextForm: Record<string, string | boolean> = {};

            for (const row of rows) {
                nextMap[row.key] = row;
                if (row.key === 'WHAPI_ENABLED') {
                    nextForm[row.key] = row.valueMasked.toLowerCase() === 'true';
                } else {
                    nextForm[row.key] = row.isSecret ? '' : (row.valueMasked || '');
                }
            }

            for (const def of GROUP_FIELDS[group]) {
                if (!(def.key in nextForm)) {
                    nextForm[def.key] = def.type === 'checkbox' ? false : '';
                }
            }

            setSettingsMap(nextMap);
            setForm(nextForm);
        } catch (err: any) {
            setError(String(err?.message || (isAr ? 'تعذر تحميل الإعدادات' : 'Failed to load settings')));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadGroup(activeTab);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, token]);

    const save = async () => {
        if (!token) return;
        setSaving(true);
        setError('');
        setMessage('');
        try {
            for (const field of fields) {
                const rawValue = form[field.key];
                const existing = settingsMap[field.key];

                if (field.type === 'checkbox') {
                    await adminApi.upsertSetting(token, {
                        key: field.key,
                        group: activeTab,
                        value: rawValue ? 'true' : 'false',
                        isSecret: field.isSecret,
                    });
                    continue;
                }

                const nextValue = String(rawValue || '').trim();
                if (field.isSecret && !nextValue) {
                    if (!existing?.hasValue) {
                        await adminApi.upsertSetting(token, {
                            key: field.key,
                            group: activeTab,
                            value: '',
                            isSecret: true,
                        });
                    }
                    continue;
                }

                await adminApi.upsertSetting(token, {
                    key: field.key,
                    group: activeTab,
                    value: nextValue,
                    isSecret: field.isSecret,
                });
            }

            setMessage(isAr ? 'تم حفظ الإعدادات بنجاح' : 'Settings saved successfully');
            await loadGroup(activeTab);
        } catch (err: any) {
            setError(String(err?.message || (isAr ? 'فشل حفظ الإعدادات' : 'Failed to save settings')));
        } finally {
            setSaving(false);
        }
    };

    if (!token) {
        return <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm font-semibold text-gray-600">{isAr ? 'يجب تسجيل الدخول' : 'Login required'}</div>;
    }

    if (admin?.role !== 'super_admin') {
        return <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm font-semibold text-red-700">{isAr ? 'غير مصرح لك بهذه الصفحة' : 'You are not authorized to access this page'}</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-black text-gray-900">{isAr ? 'إعدادات النظام' : 'System Settings'}</h1>
                <p className="text-sm text-gray-500 mt-1">{isAr ? 'إدارة واتساب و Cloudinary بدون إعادة نشر' : 'Manage WhatsApp and Cloudinary without redeploy'}</p>
            </div>

            <div className="flex flex-wrap gap-2">
                {(['WHATSAPP', 'CLOUDINARY'] as Group[]).map((tab) => (
                    <button
                        key={tab}
                        type="button"
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-xl border text-sm font-bold ${activeTab === tab ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 border-gray-200 hover:border-primary/40'}`}
                    >
                        {tab === 'WHATSAPP' ? (isAr ? 'إعدادات واتساب' : 'WhatsApp Settings') : (isAr ? 'إعدادات Cloudinary' : 'Cloudinary Settings')}
                    </button>
                ))}
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 space-y-4">
                {loading ? (
                    <p className="text-sm text-gray-500">{isAr ? 'جاري التحميل...' : 'Loading...'}</p>
                ) : (
                    <>
                        {fields.map((field) => {
                            const setting = settingsMap[field.key];
                            const label = isAr ? field.labelAr : field.labelEn;

                            if (field.type === 'checkbox') {
                                return (
                                    <label key={field.key} className="flex items-center gap-3 text-sm font-bold text-gray-800">
                                        <input
                                            type="checkbox"
                                            checked={Boolean(form[field.key])}
                                            onChange={(e) => setForm((prev) => ({ ...prev, [field.key]: e.target.checked }))}
                                            className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                        <span>{label}</span>
                                    </label>
                                );
                            }

                            return (
                                <div key={field.key} className="space-y-1.5">
                                    <label className="text-sm font-bold text-gray-800 block">{label}</label>
                                    <input
                                        type="text"
                                        value={String(form[field.key] || '')}
                                        onChange={(e) => setForm((prev) => ({ ...prev, [field.key]: e.target.value }))}
                                        placeholder={field.isSecret ? (isAr ? 'تحديث القيمة السرية' : 'Update Secret') : field.placeholder}
                                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary"
                                    />
                                    {field.isSecret && setting?.hasValue && (
                                        <p className="text-xs text-gray-500">
                                            {isAr ? 'القيمة الحالية:' : 'Current value:'} <span className="font-bold">{setting.valueMasked}</span>
                                        </p>
                                    )}
                                </div>
                            );
                        })}

                        {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</div>}
                        {message && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">{message}</div>}

                        <div className="pt-2">
                            <button
                                type="button"
                                onClick={() => { void save(); }}
                                disabled={saving}
                                className="btn-primary !px-6 !py-2.5 text-sm disabled:opacity-60"
                            >
                                {saving ? (isAr ? 'جارٍ الحفظ...' : 'Saving...') : (isAr ? 'حفظ الإعدادات' : 'Save Settings')}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
