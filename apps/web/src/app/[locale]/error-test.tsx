// temporary page used to simulate error codes in production/test deployments
// usage: /en/error-test?code=500 or 404 or 429 or 503 or offline

interface ErrorTestProps {
  searchParams: { code?: string };
}

export default function ErrorTest({ searchParams }: ErrorTestProps) {
  const code = searchParams.code || '500';

  // log server-side so we can see Vercel function logs for debugging
  // eslint-disable-next-line no-console
  console.log('[error-test] invoked with searchParams:', JSON.stringify(searchParams));

  // "offline" treated specially, map to status 0
  if (code === 'offline') {
    // eslint-disable-next-line no-console
    console.log('[error-test] throwing offline (status 0)');
    throw new Response('Network offline', { status: 0 });
  }

  const status = parseInt(code, 10) || 500;
  // eslint-disable-next-line no-console
  console.log(`[error-test] throwing Response with status ${status}`);
  throw new Response('testing', { status });
}
