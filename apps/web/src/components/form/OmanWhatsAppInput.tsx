'use client';

import { useEffect, useMemo, useState } from 'react';
import { COUNTRY_CONFIG } from '@/lib/countryConfig';

type Props = {
    value?: string;
    onChange: (value: string) => void;
    label?: string;
    required?: boolean;
    id?: string;
    className?: string;
    error?: string;
};

function extractLocalOmanNumber(value?: string): string {
    const digits = (value || '').replace(/\D/g, '');
    if (!digits) return '';

    const dialDigits = COUNTRY_CONFIG.dialCode.replace('+', '');

    if (digits.startsWith(dialDigits)) {
        return digits.slice(dialDigits.length, dialDigits.length + COUNTRY_CONFIG.phoneDigits);
    }

    if (COUNTRY_CONFIG.phoneRegex.test(digits)) {
        return digits;
    }

    return digits.slice(0, COUNTRY_CONFIG.phoneDigits);
}

export default function OmanWhatsAppInput({
    value,
    onChange,
    label,
    required = false,
    id,
    className,
    error,
}: Props) {
    const [localNumber, setLocalNumber] = useState('');

    useEffect(() => {
        setLocalNumber(extractLocalOmanNumber(value));
    }, [value]);

    const helperText = useMemo(() => {
        if (error) return error;
        if (required) return 'اكتب رقم واتساب عُماني صحيح (8 أرقام تبدأ بـ 9 أو 2)';
        return 'اختياري: اكتب رقم واتساب عُماني صحيح إذا توفر';
    }, [error, required]);

    return (
        <div className={className}>
            {label && (
                <label htmlFor={id} className="block text-sm font-black text-dark mb-2 ms-1">
                    {label} {required ? <span className="text-red-500">*</span> : null}
                </label>
            )}

            <div
                dir="ltr"
                className={`flex items-stretch rounded-2xl border-2 bg-cream overflow-hidden transition-colors ${error ? 'border-red-500' : 'border-transparent focus-within:border-primary focus-within:bg-white'}`}
            >
                <div className="shrink-0 inline-flex items-center gap-2 px-3 sm:px-4 border-e border-border bg-white/75 text-dark font-black text-sm sm:text-base">
                    <span aria-hidden="true" className="text-lg leading-none">🇴🇲</span>
                    <span dir="ltr">{COUNTRY_CONFIG.dialCode}</span>
                </div>
                <input
                    id={id}
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    className="min-w-0 flex-1 px-3 sm:px-4 py-3.5 sm:py-4 bg-transparent outline-none font-bold text-sm sm:text-base text-left"
                    placeholder="9xxxxxxx"
                    value={localNumber}
                    onChange={(e) => {
                        const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, COUNTRY_CONFIG.phoneDigits);
                        setLocalNumber(digitsOnly);
                        onChange(digitsOnly ? `${COUNTRY_CONFIG.dialCode.replace('+', '')}${digitsOnly}` : '');
                    }}
                    dir="ltr"
                />
            </div>

            <p className={`text-xs mt-1 ms-1 ${error ? 'text-red-600' : 'text-text-muted'}`}>{helperText}</p>
        </div>
    );
}
