import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // CORS
  app.enableCors({ origin: '*' });

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
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger Docs available at: http://localhost:${port}/api/docs`);
}
bootstrap();
