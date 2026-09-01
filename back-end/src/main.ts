import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import * as fs from 'fs';
import * as path from 'path';
import * as express from 'express';
import { appLogger } from './utils/winston-logger';

import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // CORS — Allow any local origin and any headers in development
  app.enableCors({
    origin: true,
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  });

  // Security Headers (Helmet) with Cross-Origin Resource Policy for media previews & downloads
  app.use(helmet({
    contentSecurityPolicy: false, // Swagger compatible
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }));

  // Ensure uploads directory exists and mount static assets with CORS and Cross-Origin headers
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use('/uploads', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.header('Access-Control-Allow-Headers', '*');
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  }, express.static(uploadsDir));

  // Global Prefix
  app.setGlobalPrefix('api/v1');

  // Filters & Pipes
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('UCSDP Backend API')
    .setDescription('Unified Citizen Service and Delivery Platform API Documentation')
    .setVersion('1.0')
    .addTag('users', 'User management and Registration')
    .addTag('applications', 'Citizen Service Applications')
    .addTag('grievances', 'Grievance Redressal')
    .addTag('services', 'Government Services Catalog')
    .addTag('workflow', 'Application Status Workflow')
    .addTag('supervisor', 'Supervisor Dashboard & Actions')
    .addTag('super-user', 'System Admin Operations')
    .addTag('notifications', 'User Notifications')
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  
  // Save swagger.json to docs/ folder
  const docsDir = path.join(__dirname, '..', 'docs');
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }
  fs.writeFileSync(path.join(docsDir, 'swagger.json'), JSON.stringify(document, null, 2));

  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'DigiConnect API Portal',
    customCss: `
      .swagger-ui .topbar { background-color: #0f172a; border-bottom: 3px solid #3b82f6; }
      .swagger-ui .topbar .download-url-wrapper { display: none; }
      .swagger-ui .info .title { color: #0f172a; font-weight: 800; font-family: sans-serif; }
      .swagger-ui .opblock.opblock-get .opblock-summary-method { background-color: #0ea5e9; }
      .swagger-ui .opblock.opblock-post .opblock-summary-method { background-color: #22c55e; }
      .swagger-ui .opblock.opblock-patch .opblock-summary-method { background-color: #f59e0b; }
      .swagger-ui .opblock.opblock-delete .opblock-summary-method { background-color: #ef4444; }
      .swagger-ui .btn.execute { background-color: #3b82f6; border-color: #3b82f6; color: #fff; font-weight: bold; text-shadow: none; box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.5); }
      .swagger-ui .btn.execute:hover { background-color: #2563eb; }
      .swagger-ui select { border-radius: 4px; border: 1px solid #cbd5e1; padding: 4px; }
      body { background-color: #f8fafc; }
    `
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  appLogger.info(`Application is running on: http://localhost:${port}`);
  appLogger.info(`Swagger Docs available at: http://localhost:${port}/api/docs`);
}
bootstrap();

