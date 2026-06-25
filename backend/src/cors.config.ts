import { INestApplication } from '@nestjs/common';

/**
 * Dynamic CORS — allows any frontend origin (Vercel previews, custom domains, localhost).
 * Uses origin reflection instead of a fixed whitelist so deploy URLs never need updating.
 */
export function configureCors(app: INestApplication): void {
  app.enableCors({
    origin: (_origin: string | undefined, callback: (err: Error | null, allow?: boolean | string) => void) => {
      callback(null, _origin ?? true);
    },
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Accept',
      'Authorization',
      'X-Requested-With',
      'Origin',
      'Access-Control-Request-Method',
      'Access-Control-Request-Headers',
    ],
    exposedHeaders: ['Authorization'],
    credentials: false,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });
}
