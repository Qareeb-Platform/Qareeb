import { useTranslations } from 'next-intl';
import { getLocale } from 'next-intl/server';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import FAB from '@/components/ui/FAB';
import ChatWidget from '@/components/chat/ChatWidget';

export const revalidate = 60; // ISR: revalidate every 60 seconds

export default async function HomePage() {
    const locale = await getLocale();

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative overflow-hidden bg-gradient-to-br from-[#F0F9F4] via-[#FAF8F3] to-[#FFF9F0] pt-16 pb-20 md:pt-32 md:pb-40">
                    <div className="absolute inset-0 opacity-[0.035] pointer-events-none"
                        style={{ backgroundImage: 'repeating-linear-gradient(90deg, #1B6B45 0, #1B6B45 1px, transparent 1px, transparent 60px), repeating-linear-gradient(0deg, #1B6B45 0, #1B6B45 1px, transparent 1px, transparent 60px)' }} />

                    <div className="absolute top-[-120px] -right-[140px] w-[560px] h-[560px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
                    <div className="absolute bottom-[-100px] -left-[100px] w-[440px] h-[440px] bg-accent/5 rounded-full blur-[80px] pointer-events-none" />

                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-2 rounded-full mb-8 animate-fade-in">
                            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                            <span className="text-sm font-bold text-primary">
                                {locale === 'ar' ? 'منصة غير ربحية لخدمة المسلمين في مصر 🇪🇬' : 'Non-profit platform serving Muslims in Egypt 🇪🇬'}
                            </span>
                        </div>

                        <h1 className="text-4xl md:text-7xl font-black text-dark mb-6 leading-[1.1]">
                            {locale === 'ar' ? (
                                <>ابحث عن <span className="text-primary">مسجدك</span><br />و<span className="text-accent">إمامك</span> القريب 📍</>
                            ) : (
                                <>Find Your <span className="text-primary">Mosque</span><br />& <span className="text-accent">Imam</span> Nearby 📍</>
                            )}
                        </h1>

                        <p className="max-w-2xl mx-auto text-lg md:text-xl text-text-muted mb-10 leading-relaxed">
                            {locale === 'ar'
                                ? 'منصة قريب تربطك بالأئمة ودور التحفيظ وأعمال الإعمار في منطقتك بمصر كلها — بسهولة وسرعة'
                                : 'Qareeb platform connects you with imams, Quran circles, and maintenance projects in your area across Egypt — easily and quickly'}
                        </p>

                        <div className="flex flex-wrap justify-center gap-4 mb-16">
                            <Link href={`/${locale}/imams`} className="btn-primary !px-10 !py-4 text-lg">
                                {locale === 'ar' ? '🔍 ابحث عن إمام' : '🔍 Find an Imam'}
                            </Link>
                            <Link href={`/${locale}/imams/submit`} className="btn-outline !px-10 !py-4 text-lg">
                                {locale === 'ar' ? '➕ أضف مكاناً' : '➕ Add a Place'}
                            </Link>
                        </div>

                        {/* Stats block */}
                        <div className="max-w-lg mx-auto bg-white rounded-[20px] shadow-card flex overflow-hidden border border-border">
                            {[
                                { num: '6', label: locale === 'ar' ? 'إمام مسجل' : 'Registered Imams' },
                                { num: '6', label: locale === 'ar' ? 'دار تحفيظ' : 'Quran Circles' },
                                { num: '6', label: locale === 'ar' ? 'مشروع إعمار' : 'Maintenance Projects' },
                                { num: '27', label: locale === 'ar' ? 'محافظة' : 'Governorates' },
                            ].map((stat, i) => (
                                <div key={i} className={`flex-1 p-4 text-center ${i < 3 ? 'border-e border-border' : ''}`}>
                                    <div className="text-2xl font-black text-primary">{stat.num}</div>
                                    <div className="text-[10px] md:text-[11px] text-text-muted uppercase font-bold tracking-tight">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Search Bar Segment */}
                <div className="px-4 -mt-10 relative z-10">
                    <div className="max-w-4xl mx-auto bg-white rounded-[24px] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.12)] border border-border flex flex-wrap gap-3 items-center">
                        <div className="flex-1 min-w-[200px] flex items-center gap-3 bg-cream rounded-xl px-4 py-3 border-2 border-transparent focus-within:border-primary focus-within:bg-white transition-all">
                            <span className="text-text-muted">🔍</span>
                            <input
                                type="text"
                                placeholder={locale === 'ar' ? 'ابحث عن إمام، حلقة، أو مسجد...' : 'Search for imams, circles, or mosques...'}
                                className="bg-transparent w-full outline-none text-[15px] font-medium"
                            />
                        </div>
                        <select className="bg-cream rounded-xl px-4 py-3 min-w-[140px] outline-none border-2 border-transparent focus:border-primary text-sm font-bold cursor-pointer transition-all">
                            <option value="">{locale === 'ar' ? 'كل المحافظات' : 'All Governorates'}</option>
                        </select>
                        <button className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-light transition-all">
                            {locale === 'ar' ? 'بحث' : 'Search'}
                        </button>
                    </div>
                </div>

                {/* Latest Additions */}
                <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <span className="inline-block bg-primary/10 text-primary px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider mb-3">
                            {locale === 'ar' ? 'أحدث الإضافات' : 'Latest Additions'}
                        </span>
                        <h2 className="text-3xl md:text-4xl font-black text-dark mb-4">
                            {locale === 'ar' ? 'تم إضافتها مؤخراً 🌟' : 'Recently Added 🌟'}
                        </h2>
                        <p className="max-w-md mx-auto text-text-muted text-sm leading-relaxed">
                            {locale === 'ar'
                                ? 'آخر ما أضافه المستخدمون من مساجد وحلقات ومشاريع إعمار في مصر'
                                : 'The latest mosques, circles, and maintenance projects added by our community in Egypt'}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Placeholder for real data */}
                        <div className="col-span-full py-12 text-center text-text-muted italic border-2 border-dashed border-border rounded-3xl">
                            {locale === 'ar' ? 'سيتم عرض أحدث المساجد والحلقات هنا بمجرد تحديث البيانات...' : 'Latest mosques and circles will appear here once data is updated...'}
                        </div>
                    </div>

                    <div className="text-center mt-12">
                        <Link href={`/${locale}/imams`} className="btn-primary">
                            {locale === 'ar' ? 'استعرض الكل ←' : 'Browse All ←'}
                        </Link>
                    </div>
                </section>

                {/* Why Section */}
                <section className="bg-gradient-to-br from-[#E8F5EE] to-[#FAF8F3] py-20 px-4">
                    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        <div className="animate-fade-in">
                            <span className="inline-block bg-primary/10 text-primary px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider mb-3">
                                {locale === 'ar' ? 'لماذا قريب' : 'Why Qareeb'}
                            </span>
                            <h2 className="text-4xl font-black text-dark mb-6 leading-tight">
                                {locale === 'ar' ? (
                                    <>خدمة المسلمين<br /><span className="text-primary">في كل مكان</span></>
                                ) : (
                                    <>Serving Muslims<br /><span className="text-primary">Everywhere</span></>
                                )}
                            </h2>
                            <p className="text-text-muted leading-relaxed mb-8">
                                {locale === 'ar'
                                    ? 'منصة مجتمعية مفتوحة تهدف لتوثيق وتقريب الخدمات الدينية لكل مسلم في مصر، من الإسكندرية للأسوان.'
                                    : 'An open community platform aimed at documenting and bringing religious services closer to every Muslim in Egypt, from Alexandria to Aswan.'}
                            </p>
                            <Link href={`/${locale}/about`} className="btn-primary">
                                {locale === 'ar' ? 'اعرف أكثر' : 'Learn More'}
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { icon: '📍', title: locale === 'ar' ? 'تحديد الموقع' : 'Location Tech', desc: locale === 'ar' ? 'اعرف أقرب مسجد وإمام وحلقة منك فوراً' : 'Find the nearest mosque or imam instantly' },
                                { icon: '✅', title: locale === 'ar' ? 'محتوى موثق' : 'Verified Content', desc: locale === 'ar' ? 'كل الإضافات تمر بمراجعة الإدارة قبل النشر' : 'All updates are reviewed by admins before publishing' },
                                { icon: '💬', title: locale === 'ar' ? 'تواصل مباشر' : 'Direct Contact', desc: locale === 'ar' ? 'اتصل مباشرة عبر واتساب بضغطة واحدة' : 'Contact instantly via WhatsApp with one click' },
                                { icon: '🇪🇬', title: locale === 'ar' ? 'شامل لمصر' : 'All of Egypt', desc: locale === 'ar' ? 'يغطي كل المحافظات الـ ٢٧ في مصر' : 'Covers all 27 governorates across Egypt' },
                            ].map((feat, i) => (
                                <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-border hover:-translate-y-1 transition-all">
                                    <div className="text-3xl mb-3">{feat.icon}</div>
                                    <h3 className="font-black text-dark text-sm mb-2">{feat.title}</h3>
                                    <p className="text-[11px] text-text-muted leading-relaxed">{feat.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Maintenance Strip */}
                <section className="bg-gradient-to-r from-[#1B6B45] to-[#1B4D35] py-20 px-4 text-center text-white">
                    <div className="max-w-xl mx-auto">
                        <div className="text-5xl mb-6">🏗️</div>
                        <h2 className="text-3xl font-black mb-4">
                            {locale === 'ar' ? 'ساهم في إعمار بيوت الله' : 'Contribute to Mosque Maintenance'}
                        </h2>
                        <p className="text-white/80 leading-relaxed mb-10">
                            {locale === 'ar'
                                ? 'المساجد في مصر تحتاج مساعدتك — فرش، تكييف، صيانة، وأكثر. تصفح المشاريع وتبرع مباشرة.'
                                : 'Mosques in Egypt need your help — carpeting, AC, maintenance, and more. Browse projects and donate directly.'}
                        </p>
                        <Link href={`/${locale}/maintenance`} className="inline-flex items-center gap-2 px-8 py-4 bg-accent text-white rounded-xl font-bold shadow-lg hover:bg-accent-dark hover:-translate-y-0.5 transition-all">
                            {locale === 'ar' ? 'تصفح مشاريع الإعمار ←' : 'Browse Maintenance Projects ←'}
                        </Link>
                    </div>
                </section>
            </main>

            <Footer />
            <FAB />
            <ChatWidget />
        </div>
    );
}
