'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

interface Gov { id: string; nameAr: string; nameEn: string; }
interface Area { id: string; governorateId: string; nameAr: string; nameEn: string; }

export default function LocationsPage() {
    const locale = useLocale();
    const router = useRouter();
    const { token } = useAuthStore();
    const [governorates, setGovernorates] = useState<Gov[]>([]);
    const [areas, setAreas] = useState<Area[]>([]);
    const [selectedGov, setSelectedGov] = useState<string>('');
    const [newGov, setNewGov] = useState({ nameAr: '', nameEn: '' });
    const [newArea, setNewArea] = useState({ nameAr: '', nameEn: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) {
            router.push(`/${locale}/admin`);
            return;
        }
        loadGovs();
    }, [token]);

    const loadGovs = async () => {
        setLoading(true);
        const gs = await api.getGovernorates();
        setGovernorates(gs);
        setLoading(false);
    };

    const loadAreas = async (govId: string) => {
        setSelectedGov(govId);
        const as = await api.getAreas(govId);
        setAreas(as);
    };

    const addGov = async () => {
        if (!newGov.nameAr || !newGov.nameEn) return;
        await api.createGovernorate(token!, newGov);
        setNewGov({ nameAr: '', nameEn: '' });
        await loadGovs();
    };

    const addArea = async () => {
        if (!selectedGov || !newArea.nameAr || !newArea.nameEn) return;
        await api.createArea(token!, { ...newArea, governorateId: selectedGov });
        setNewArea({ nameAr: '', nameEn: '' });
        await loadAreas(selectedGov);
    };

    const updateArea = async (id: string, patch: Partial<Area>) => {
        await api.updateArea(token!, id, patch);
        await loadAreas(selectedGov);
    };

    const deleteArea = async (id: string) => {
        await api.deleteArea(token!, id);
        setAreas((prev) => prev.filter((a) => a.id !== id));
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">{locale === 'ar' ? 'المحافظات والمناطق' : 'Governorates & Areas'}</h1>
                    <p className="text-text-muted text-sm">{locale === 'ar' ? 'إدارة المواقع للدروب داون' : 'Manage locations for dropdowns'}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card p-6 space-y-4">
                    <h3 className="font-semibold">{locale === 'ar' ? 'إضافة محافظة' : 'Add Governorate'}</h3>
                    <div className="flex gap-3 flex-wrap">
                        <input value={newGov.nameAr} onChange={(e) => setNewGov({ ...newGov, nameAr: e.target.value })} placeholder="الاسم عربي" className="input-field flex-1" />
                        <input value={newGov.nameEn} onChange={(e) => setNewGov({ ...newGov, nameEn: e.target.value })} placeholder="Name English" className="input-field flex-1" />
                        <button onClick={addGov} className="btn-primary">{locale === 'ar' ? 'إضافة' : 'Add'}</button>
                    </div>
                    {loading ? <p className="text-sm text-text-muted">{locale === 'ar' ? 'جار التحميل...' : 'Loading...'}</p> : (
                        <ul className="divide-y divide-border max-h-64 overflow-y-auto">
                            {governorates.map((g) => (
                                <li key={g.id} className="py-2 text-sm flex items-center justify-between">
                                    <button className={`font-bold ${selectedGov === g.id ? 'text-primary' : 'text-text'}`} onClick={() => loadAreas(g.id)}>
                                        {locale === 'ar' ? g.nameAr : g.nameEn}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="card p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{locale === 'ar' ? 'المناطق' : 'Areas'}</h3>
                        {selectedGov && <span className="text-xs text-text-muted">{locale === 'ar' ? 'المحافظة المحددة' : 'Selected governorate'}</span>}
                    </div>
                    <div className="flex gap-3 flex-wrap">
                        <input value={newArea.nameAr} onChange={(e) => setNewArea({ ...newArea, nameAr: e.target.value })} placeholder="الاسم عربي" className="input-field flex-1" />
                        <input value={newArea.nameEn} onChange={(e) => setNewArea({ ...newArea, nameEn: e.target.value })} placeholder="Name English" className="input-field flex-1" />
                        <button onClick={addArea} disabled={!selectedGov} className="btn-primary disabled:opacity-40">{locale === 'ar' ? 'إضافة' : 'Add'}</button>
                    </div>
                    {selectedGov ? (
                        areas.length ? (
                            <ul className="divide-y divide-border max-h-72 overflow-y-auto">
                                {areas.map((a) => (
                                    <li key={a.id} className="py-2 text-sm flex items-center justify-between gap-3">
                                        <div>
                                            <div className="font-bold">{locale === 'ar' ? a.nameAr : a.nameEn}</div>
                                            <div className="text-[11px] text-text-muted">{a.nameEn} / {a.nameAr}</div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => updateArea(a.id, { nameAr: prompt('New Arabic name', a.nameAr) || a.nameAr })} className="btn-outline text-xs">{locale === 'ar' ? 'تعديل' : 'Edit'}</button>
                                            <button onClick={() => deleteArea(a.id)} className="btn-outline text-xs text-red-600 border-red-200">{locale === 'ar' ? 'حذف' : 'Delete'}</button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : <p className="text-sm text-text-muted">{locale === 'ar' ? 'لا توجد مناطق بعد' : 'No areas yet'}</p>
                    ) : <p className="text-sm text-text-muted">{locale === 'ar' ? 'اختر محافظة' : 'Select a governorate'}</p>}
                </div>
            </div>
        </div>
    );
}
