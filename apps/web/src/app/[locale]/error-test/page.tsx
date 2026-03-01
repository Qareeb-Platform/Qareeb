import ErrorScreen from '@/components/ErrorScreen';

type ErrorTestPageProps = {
  params: { locale: string };
  searchParams: { code?: string };
};

export default function ErrorTestPage({ params, searchParams }: ErrorTestPageProps) {
  const parsed = Number(searchParams.code || 500);
  const status = Number.isFinite(parsed) ? parsed : 500;
  const safeStatus = [0, 401, 403, 404, 408, 429, 500, 503].includes(status) ? status : 500;

  return <ErrorScreen status={safeStatus} locale={params.locale} />;
}
