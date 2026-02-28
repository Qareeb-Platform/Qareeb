'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { FaEye, FaEyeSlash, FaLock } from 'react-icons/fa';
import { adminApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

export default function AdminSettingsPage() {
    const locale = useLocale();
    const router = useRouter();
    const { token } = useAuthStore();

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const labels = useMemo(() => ({
        title: locale === 'ar' ? 'إعدادات الحساب' : 'Account Settings',
        subtitle: locale === 'ar' ? 'يمكنك تغيير كلمة المرور بأمان من هنا' : 'You can securely change your password from here',
        current: locale === 'ar' ? 'كلمة المرور الحالية' : 'Current password',
        next: locale === 'ar' ? 'كلمة المرور الجديدة' : 'New password',
        confirm: locale === 'ar' ? 'تأكيد كلمة المرور الجديدة' : 'Confirm new password',
        save: locale === 'ar' ? 'حفظ كلمة المرور الجديدة' : 'Save new password',
        success: locale === 'ar' ? 'تم تحديث كلمة المرور بنجاح' : 'Password updated successfully',
        mismatch: locale === 'ar' ? 'تأكيد كلمة المرور غير مطابق' : 'Password confirmation does not match',
        unauthorized: locale === 'ar' ? 'يجب تسجيل الدخول أولاً' : 'You need to sign in first',
        policy: locale === 'ar' ? '8 أحرف على الأقل وتتضمن حرفًا كبيرًا وصغيرًا ورقمًا ورمزًا' : 'At least 8 chars with uppercase, lowercase, number, and symbol',
        show: locale === 'ar' ? 'إظهار كلمة المرور' : 'Show password',
        hide: locale === 'ar' ? 'إخفاء كلمة المرور' : 'Hide password',
        saving: locale === 'ar' ? 'جارٍ الحفظ...' : 'Saving...',
    }), [locale]);

    if (!token) {
        router.push(`/${locale}/admin`);
        return null;
    }

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (newPassword !== confirmPassword) {
            setError(labels.mismatch);
            return;
        }

        setLoading(true);
        try {
            await adminApi.changePassword(token, currentPassword, newPassword);
            setSuccess(labels.success);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            setError(err?.message || labels.unauthorized);
        }
        setLoading(false);
    };

    const inputClass = 'w-full rounded-lg border px-3 py-2.5 text-sm bg-white text-gray-900 border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary';

    return (
        <section className="max-w-2xl">
            <div className="mb-5">
                <h1 className="text-2xl font-black flex items-center gap-2">
                    <FaLock className="text-primary" />
                    <span>{labels.title}</span>
                </h1>
                <p className="text-sm opacity-75 mt-1">{labels.subtitle}</p>
            </div>

            <form onSubmit={onSubmit} className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 space-y-4 shadow-sm">
                {error && <div className="rounded-lg bg-red-50 text-red-700 text-sm px-3 py-2">{error}</div>}
                {success && <div className="rounded-lg bg-emerald-50 text-emerald-700 text-sm px-3 py-2">{success}</div>}

                <Field
                    label={labels.current}
                    value={currentPassword}
                    onChange={setCurrentPassword}
                    show={showCurrent}
                    setShow={setShowCurrent}
                    inputClass={inputClass}
                    showLabel={labels.show}
                    hideLabel={labels.hide}
                />
                <Field
                    label={labels.next}
                    value={newPassword}
                    onChange={setNewPassword}
                    show={showNew}
                    setShow={setShowNew}
                    inputClass={inputClass}
                    showLabel={labels.show}
                    hideLabel={labels.hide}
                />
                <p className="text-xs opacity-70">{labels.policy}</p>
                <Field
                    label={labels.confirm}
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    show={showConfirm}
                    setShow={setShowConfirm}
                    inputClass={inputClass}
                    showLabel={labels.show}
                    hideLabel={labels.hide}
                />

                <button type="submit" disabled={loading} className="btn-primary w-full md:w-auto">
                    {loading ? labels.saving : labels.save}
                </button>
            </form>
        </section>
    );
}

function Field({
    label,
    value,
    onChange,
    show,
    setShow,
    inputClass,
    showLabel,
    hideLabel,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    show: boolean;
    setShow: (value: boolean) => void;
    inputClass: string;
    showLabel: string;
    hideLabel: string;
}) {
    return (
        <div>
            <label className="block text-sm font-semibold mb-2">{label}</label>
            <div className="password-field-wrap">
                <input
                    type={show ? 'text' : 'password'}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={`${inputClass} password-field-input`}
                    dir="ltr"
                    required
                />
                <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="password-toggle-btn text-gray-500 hover:text-gray-700"
                    aria-label={show ? hideLabel : showLabel}
                    title={show ? hideLabel : showLabel}
                >
                    {show ? <FaEyeSlash /> : <FaEye />}
                </button>
            </div>
        </div>
    );
}
