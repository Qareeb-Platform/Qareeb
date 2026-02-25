import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Global prefix
    app.setGlobalPrefix('v1');

    // Security
    app.use(helmet());
    app.use(cookieParser());

    // CORS
    const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean);

    app.enableCors({
        origin: (origin, callback) => {
            // allow same-origin or non-browser requests
            if (!origin) return callback(null, true);
            try {
                const host = new URL(origin).host;
                const isExplicit = allowedOrigins.includes(origin);
                const isVercelPreview = host.endsWith('.vercel.app');
                if (isExplicit || isVercelPreview) return callback(null, true);
            } catch {
                /* ignore */
            }
            return callback(new Error('Not allowed by CORS'), false);
        },
        credentials: true,
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

    const port = process.env.PORT || 3001;
    await app.listen(port);
    console.log(`🚀 Qareeb API running on http://localhost:${port}/v1`);
}
bootstrap();
