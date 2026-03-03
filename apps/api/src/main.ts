import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';

export async function createApp() {
    const app = await NestFactory.create(AppModule, {
        cors: false,
    });

    const httpAdapter = app.getHttpAdapter().getInstance();
    httpAdapter.set('trust proxy', 1);
    httpAdapter.disable('x-powered-by');

    const renderLanding = () => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Qareeb API</title>
  <style>
    :root {
      color-scheme: light;
    }
    body {
      margin: 0;
      font-family: "Segoe UI", Tahoma, Arial, sans-serif;
      background: #f7f3ee;
      color: #1e1e1e;
    }
    .wrap {
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 32px;
    }
    .card {
      width: min(720px, 100%);
      background: #fff;
      border: 1px solid #e7e0d8;
      box-shadow: 0 12px 36px rgba(0, 0, 0, 0.08);
      border-radius: 16px;
      padding: 28px;
    }
    h1 {
      margin: 0 0 8px;
      font-size: 28px;
      letter-spacing: 0.2px;
    }
    p {
      margin: 6px 0 0;
      line-height: 1.6;
    }
    .hint {
      margin-top: 16px;
      padding: 12px 14px;
      border-radius: 10px;
      background: #f5efe6;
      border: 1px solid #e6ddcf;
      font-family: Consolas, "Courier New", monospace;
      font-size: 14px;
    }
    a {
      color: #1f4b99;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="wrap">
    <main class="card">
      <h1>Qareeb API</h1>
      <p>This is an API service. There is no public website on the root path.</p>
      <p>Use the versioned routes under <strong>/v1</strong>.</p>
      <div class="hint">
        Health check: <a href="/v1/health">/v1/health</a> or <a href="/v1/healthz">/v1/healthz</a>
      </div>
    </main>
  </div>
</body>
</html>`;

    httpAdapter.get('/', (_req, res) => {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.status(200).send(renderLanding());
    });

    httpAdapter.get('/v1', (_req, res) => {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.status(200).send({
            message: 'Qareeb API root. Use /v1/{resource}.',
            health: ['/v1/health', '/v1/healthz'],
        });
    });

    // Global prefix
    app.setGlobalPrefix('v1');

    app.use(json({ limit: process.env.REQUEST_BODY_LIMIT || '1mb' }));
    app.use(urlencoded({ extended: true, limit: process.env.REQUEST_BODY_LIMIT || '1mb' }));

    // Security headers
    app.use(
        helmet({
            crossOriginEmbedderPolicy: false,
            referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
            hsts: {
                maxAge: 63072000,
                includeSubDomains: true,
                preload: true,
            },
            frameguard: { action: 'deny' },
            contentSecurityPolicy: false,
        }),
    );
    app.use(cookieParser());

    // CORS
    const allowedOrigins = (process.env.CORS_ORIGIN || 'https://qareeb-web.vercel.app')
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean);
    const allowVercelPreview = process.env.ALLOW_VERCEL_PREVIEW === 'true';

    app.enableCors({
        origin: (origin, callback) => {
            if (!origin) return callback(null, true);
            try {
                const host = new URL(origin).host;
                const isExplicit = allowedOrigins.includes(origin);
                const isVercelPreview = allowVercelPreview && host.endsWith('.vercel.app');
                if (isExplicit || isVercelPreview) return callback(null, true);
            } catch {
                // no-op
            }
            return callback(new Error('Not allowed by CORS'), false);
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Authorization', 'Content-Type', 'X-CSRF-Token'],
        exposedHeaders: ['X-Request-Id'],
        maxAge: 600,
    });

    // Validation
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            transformOptions: { enableImplicitConversion: true },
        }),
    );

    return app;
}

async function bootstrap() {
    const app = await createApp();
    const port = process.env.PORT || 3001;
    await app.listen(port);
    console.log(`🚀 Qareeb API running on http://localhost:${port}/v1`);
}

if (process.env.SERVERLESS !== 'true') {
    bootstrap();
}
