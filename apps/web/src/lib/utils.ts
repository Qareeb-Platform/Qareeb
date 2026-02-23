import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
    return clsx(inputs);
}

export function formatDistance(meters: number): string {
    if (meters < 1000) {
        return `${Math.round(meters)} م`;
    }
    return `${(meters / 1000).toFixed(1)} كم`;
}

export function getWhatsAppUrl(phone: string, message?: string): string {
    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    const url = `https://wa.me/${cleanPhone.replace('+', '')}`;
    return message ? `${url}?text=${encodeURIComponent(message)}` : url;
}

export function getStatusColor(status: string): string {
    switch (status) {
        case 'approved':
            return 'badge-approved';
        case 'rejected':
            return 'badge-rejected';
        case 'pending':
        default:
            return 'badge-pending';
    }
}

export function getStatusLabel(status: string, locale: string): string {
    const labels: Record<string, Record<string, string>> = {
        ar: { pending: 'قيد المراجعة', approved: 'مقبول', rejected: 'مرفوض' },
        en: { pending: 'Pending', approved: 'Approved', rejected: 'Rejected' },
    };
    return labels[locale]?.[status] || status;
}
