import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SubmitServiceSection from '@/components/home/SubmitServiceSection';

export default function SubmitSelectorPage({ params: { locale } }: { params: { locale: string } }) {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />
            <main className="flex-1 pt-8">
                <SubmitServiceSection locale={locale} />
            </main>
            <Footer />
        </div>
    );
}
