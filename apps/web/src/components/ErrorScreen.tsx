'use client';

import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useEffect, useState } from 'react';

interface ErrorScreenProps {
  status: number;
  locale: string;
  reset?: () => void;
}

// visual configuration for various statuses
const errorConfig: Record<
  number,
  {
    bg?: string;
    orbs: Array<React.CSSProperties>;
    icon: string;
    retry?: boolean;
  }
> = {
  0: {
    // offline/network failure
    bg: 'linear-gradient(160deg,#FFF8F0,#FAF8F3)',
    orbs: [
      {
        width: 440,
        height: 440,
        background: 'radial-gradient(circle,rgba(201,150,42,.06),transparent 70%)',
        top: -90,
        left: -90,
      },
    ],
    icon: '📡',
    retry: true,
  },
  404: {
    bg: undefined,
    orbs: [
      {
        width: 480,
        height: 480,
        background: 'radial-gradient(circle,rgba(27,107,69,.07),transparent 70%)',
        top: -100,
        right: -100,
      },
      {
        width: 360,
        height: 360,
        background: 'radial-gradient(circle,rgba(201,150,42,.05),transparent 70%)',
        bottom: -80,
        left: -80,
      },
    ],
    icon: '🔍',
  },
  429: {
    bg: 'linear-gradient(160deg,#FFF8E1,#FAF8F3)',
    orbs: [
      {
        width: 440,
        height: 440,
        background: 'radial-gradient(circle,rgba(201,150,42,.06),transparent 70%)',
        top: -90,
        left: -90,
      },
    ],
    icon: '⌛',
    retry: true,
  },
  500: {
    bg: 'linear-gradient(160deg,#FFF5F5,#FAF8F3)',
    orbs: [
      {
        width: 440,
        height: 440,
        background: 'radial-gradient(circle,rgba(192,57,43,.06),transparent 70%)',
        top: -90,
        left: -90,
      },
    ],
    icon: '⚠️',
    retry: true,
  },
  401: {
    bg: 'linear-gradient(160deg,#EEF2FF,#FAF8F3)',
    orbs: [
      {
        width: 420,
        height: 420,
        background: 'radial-gradient(circle,rgba(57,73,171,.07),transparent 70%)',
        bottom: -80,
        right: -80,
      },
    ],
    icon: '🔑',
  },
  403: {
    bg: 'linear-gradient(160deg,#FFF8E7,#FAF8F3)',
    orbs: [
      {
        width: 420,
        height: 420,
        background: 'radial-gradient(circle,rgba(201,150,42,.07),transparent 70%)',
        top: -80,
        right: -80,
      },
    ],
    icon: '🔒',
  },
  408: {
    bg: 'linear-gradient(160deg,#E0F2F1,#FAF8F3)',
    orbs: [
      {
        width: 440,
        height: 440,
        background: 'radial-gradient(circle,rgba(0,121,107,.07),transparent 70%)',
        bottom: -90,
        left: -90,
      },
    ],
    icon: '🐢',
    retry: true,
  },
  503: {
    bg: 'linear-gradient(160deg,#F0F4FF,#FAF8F3)',
    orbs: [
      {
        width: 440,
        height: 440,
        background: 'radial-gradient(circle,rgba(27,107,69,.06),transparent 70%)',
        bottom: -90,
        right: -90,
      },
      {
        width: 360,
        height: 360,
        background: 'radial-gradient(circle,rgba(192,57,43,.05),transparent 70%)',
        top: 120,
        left: -80,
      },
    ],
    icon: '🔧',
    retry: true,
  },
};

const textConfig: Record<
  number,
  {
    tagAr: string;
    tagEn: string;
    titleAr: string; // may contain <br/>
    titleEn: string;
    subAr: string;
    subEn: string;
  }
> = {
  404: {
    tagAr: 'الصفحة غير موجودة',
    tagEn: 'Page not found',
    titleAr: 'يبدو أن هذا المسجد<br/>مش في خريطتنا! 🗺️',
    titleEn: 'Looks like this page<br/>is not on our map! 🗺️',
    subAr:
      'الصفحة اللي بتدور عليها مش موجودة أو اتنقلت لمكان تاني. تقدر ترجع للرئيسية أو تبحث عن اللي تحتاجه.',
    subEn:
      'The page you are looking for does not exist or was moved. You can go back home or search again.',
  },
  500: {
    tagAr: 'خطأ في الخادم',
    tagEn: 'Server error',
    titleAr: 'في مشكلة من جهتنا<br/>نعتذر منك! 🙏',
    titleEn: 'Something went wrong<br/>on our side. Sorry! 🙏',
    subAr:
      'حصل خطأ غير متوقع في الخادم. فريقنا التقني اتنبّه تلقائياً وبيشتغل على حل المشكلة دلوقتي.',
    subEn:
      'An unexpected error occurred on the server. Our team has been notified and is working on a fix.',
  },
  401: {
    tagAr: 'غير مصرح',
    tagEn: 'Unauthorized',
    titleAr: 'محتاج تسجّل دخولك<br/>الأول! 👤',
    titleEn: 'You need to<br/>sign in first! 👤',
    subAr:
      'الصفحة دي بتطلب تسجيل دخول. سجّل دخولك وارجع تاني أو أنشئ حساب جديد مجاناً.',
    subEn:
      'This page requires you to be signed in. Please log in and come back, or create a free account.',
  },
  403: {
    tagAr: 'الدخول محظور',
    tagEn: 'Forbidden',
    titleAr: 'هذا المكان<br/>مش ليك يا صديقي! 🚫',
    titleEn: 'You are not allowed<br/>to access this page 🚫',
    subAr:
      'مش عندك صلاحية تدخل على هذه الصفحة. لو بتفتكر إن في غلط، تواصل مع الإدارة.',
    subEn:
      'You do not have permission to access this page. If you think this is a mistake, contact the admin.',
  },
  408: {
    tagAr: 'انتهى وقت الطلب',
    tagEn: 'Request timeout',
    titleAr: 'الاتصال اتأخر<br/>أكتر من اللازم! 📶',
    titleEn: 'The request took<br/>too long to respond! 📶',
    subAr:
      'الطلب بتاعك خد وقت طويل جداً للاستجابة. ممكن يكون عندك مشكلة في الإنترنت أو الخادم مشغول.',
    subEn:
      'Your request took too long to respond. It may be a network issue on your side or a busy server.',
  },
  429: {
    tagAr: 'طلبات كتير أوي',
    tagEn: 'Too many requests',
    titleAr: 'استنّى شوية<br/>والمحاولة تاني! ⏳',
    titleEn: 'Slow down a bit<br/>and try again! ⏳',
    subAr:
      'بعتت طلبات كتير في وقت قصير. منصة قريب بتحمي نفسها من الضغط الزيادة. استنّى الوقت اللي جاي وحاول تاني.',
    subEn:
      'You have sent too many requests in a short time. Qareeb is protecting itself from overload. Please wait and try again.',
  },
  503: {
    tagAr: 'الخدمة غير متاحة',
    tagEn: 'Service unavailable',
    titleAr: 'المنصة بتتصان<br/>هترجع قريباً! 🛠️',
    titleEn: 'The platform is under<br/>maintenance, back soon! 🛠️',
    subAr:
      'قريب بتخضع لتحديثات مجدولة لتحسين خدمتك. شكراً لصبرك — هنكون أحسن وأسرع!',
    subEn:
      'Qareeb is undergoing scheduled updates to improve your experience. Thanks for your patience!',
  },
  0: {
    tagAr: 'مشكلة في الاتصال',
    tagEn: 'Connection issue',
    titleAr: 'شكل الإنترنت عندك<br/>مش ثابت شوية! 📡',
    titleEn: 'Your internet<br/>connection looks unstable 📡',
    subAr:
      'يبدو أن في مشكلة في الاتصال. تأكد من اتصالك بالإنترنت وحاول مرة أخرى.',
    subEn:
      'There seems to be a connectivity issue. Please check your internet connection and try again.',
  },
};

export default function ErrorScreen({ status, locale, reset }: ErrorScreenProps) {
  // server-side log to help trace which error screens are rendered in production
  // eslint-disable-next-line no-console
  console.log('[ErrorScreen] render', { status, locale });
  const isAr = locale === 'ar';

  const info = (errorConfig as any)[status] || errorConfig[500];
  const textInfo = textConfig[status] || textConfig[500];

  const tag = isAr ? textInfo.tagAr : textInfo.tagEn;
  const title = isAr ? textInfo.titleAr : textInfo.titleEn;
  const sub = isAr ? textInfo.subAr : textInfo.subEn;

  // countdown for 429
  const [cooldown, setCooldown] = useState(status === 429 ? 60 : 0);

  useEffect(() => {
    if (status !== 429) return;
    setCooldown(60);
    let current = 60;
    const id = setInterval(() => {
      current -= 1;
      setCooldown(current);
      if (current <= 0) {
        clearInterval(id);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [status]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <div
          className="error-page active"
          id={`e${status}`}
          style={info.bg ? { background: info.bg } : undefined}
        >
          <div className="bg-grid"></div>
          {info.orbs.map((style: React.CSSProperties, i: number) => (
            <div key={i} className="orb" style={style}></div>
          ))}
          <div className="error-card">
            <div className="error-code-wrap">
              <div className="error-code">{status}</div>
              <div className="error-icon-badge">{info.icon}</div>
            </div>
            <div className="error-tag">{tag}</div>
            <div
              className="error-title"
              dangerouslySetInnerHTML={{ __html: title }}
            />
            <div className="error-sub">{sub}</div>
            {status === 429 && (
              <div className="countdown-wrap">
                <div className="countdown-num">
                  {cooldown > 0 ? cooldown : 0}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#7B1FA2' }}>
                    {isAr ? 'ثانية' : 'seconds'}
                  </div>
                  <div className="countdown-lbl">
                    {isAr ? 'وتقدر تحاول تاني' : 'until you can try again'}
                  </div>
                </div>
              </div>
            )}

            {status === 503 && (
              <div className="status-list">
                <div className="status-row">
                  <div className="status-dot ok" />
                  <div className="status-name">{isAr ? 'قاعدة البيانات' : 'Database'}</div>
                  <div className="status-val ok">{isAr ? '✓ تعمل' : '✓ Operational'}</div>
                </div>
                <div className="status-row">
                  <div className="status-dot warn" />
                  <div className="status-name">{isAr ? 'الخادم الرئيسي' : 'Main server'}</div>
                  <div className="status-val warn">{isAr ? '⟳ تحديث' : '⟳ Updating'}</div>
                </div>
                <div className="status-row">
                  <div className="status-dot err" />
                  <div className="status-name">{isAr ? 'واجهة المستخدم' : 'Frontend'}</div>
                  <div className="status-val err">{isAr ? '✗ صيانة' : '✗ Maintenance'}</div>
                </div>
                <div className="status-row">
                  <div className="status-dot ok" />
                  <div className="status-name">{isAr ? 'نظام الواتساب' : 'WhatsApp system'}</div>
                  <div className="status-val ok">{isAr ? '✓ تعمل' : '✓ Operational'}</div>
                </div>
              </div>
            )}

            <div className="error-btns">
              {info.retry && reset && (
                <button
                  onClick={() => reset()}
                  className="btn-primary"
                  disabled={status === 429 && cooldown > 0}
                >
                  {isAr ? '🔄 إعادة المحاولة' : '🔄 Retry'}
                </button>
              )}
              <Link
                href={`/${locale}`}
                className="btn-outline"
              >
                {isAr ? '🏠 الرئيسية' : '🏠 Home'}
              </Link>
            </div>
            <div className="quick-links" style={{ borderColor: '#FECACA' }}>
              <div className="ql-title">
                {isAr ? 'يمكنك كمان' : 'You can also'}
              </div>
              <div className="ql-grid">
                <a
                  href={`/${locale}/contact`}
                  className="ql-item"
                  style={{ '--hover-c': '#FEE2E2' } as any}
                >
                  <div className="ql-icon">📧</div>
                  <div className="ql-text">
                    {isAr ? 'تواصل معنا' : 'Contact us'}
                  </div>
                </a>
                <button onClick={() => location.reload()} className="ql-item">
                  <div className="ql-icon">🔄</div>
                  <div className="ql-text">
                    {isAr ? 'تحديث الصفحة' : 'Refresh'}
                  </div>
                </button>
                <a href={`/${locale}`} className="ql-item">
                  <div className="ql-icon">🏠</div>
                  <div className="ql-text">
                    {isAr ? 'الرئيسية' : 'Home'}
                  </div>
                </a>
                <a href="/" className="ql-item">
                  <div className="ql-icon">⚙️</div>
                  <div className="ql-text">
                    {isAr ? 'الحالة' : 'Status'}
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}