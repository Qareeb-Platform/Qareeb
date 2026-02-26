'use client';

type PaginationProps = {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    locale?: string;
    className?: string;
};

export default function Pagination({ page, totalPages, onPageChange, locale = 'ar', className = '' }: PaginationProps) {
    if (!totalPages || totalPages <= 1) return null;

    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, start + 4);
    const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

    const prevLabel = locale === 'ar' ? 'السابق' : 'Previous';
    const nextLabel = locale === 'ar' ? 'التالي' : 'Next';

    return (
        <div className={`flex items-center justify-center gap-2 flex-wrap ${className}`}>
            <button
                type="button"
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1}
                className="px-3 py-2 rounded-btn text-sm font-bold bg-white border border-border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-light hover:text-primary"
            >
                {prevLabel}
            </button>

            {pages.map((p) => (
                <button
                    key={p}
                    type="button"
                    onClick={() => onPageChange(p)}
                    className={`w-10 h-10 rounded-btn text-sm font-bold transition-all ${p === page ? 'bg-primary text-white' : 'bg-white border border-border hover:bg-primary-light hover:text-primary'}`}
                >
                    {p}
                </button>
            ))}

            <button
                type="button"
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages}
                className="px-3 py-2 rounded-btn text-sm font-bold bg-white border border-border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-light hover:text-primary"
            >
                {nextLabel}
            </button>
        </div>
    );
}
