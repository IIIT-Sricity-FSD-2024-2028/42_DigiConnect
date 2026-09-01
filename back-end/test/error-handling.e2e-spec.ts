import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { HttpExceptionFilter } from './../src/filters/http-exception.filter';
import * as fs from 'fs';
import * as path from 'path';

describe('Error Handling & Global Exception Filter (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('1. should return unified 404 JSON for unknown routes', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/invalid-route')
      .expect(404);

    expect(res.body).toMatchObject({
      success: false,
      statusCode: 404,
      path: '/api/v1/invalid-route',
    });
    expect(res.body.timestamp).toBeDefined();
    expect(res.body.message).toBeDefined();
  });

  it('2. should return 400 with field-level validation errors for invalid DTO', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/users/register')
      .send({})
      .expect(400);

    expect(res.body).toMatchObject({
      success: false,
      statusCode: 400,
      path: '/api/v1/users/register',
    });
    expect(Array.isArray(res.body.message)).toBe(true);
    expect(res.body.timestamp).toBeDefined();
  });

  it('3. should return 400 for bad login credentials', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/users/login')
      .send({ email: 'nonexistent@test.com', password: 'wrong' })
      .expect(400);

    expect(res.body).toMatchObject({
      success: false,
      statusCode: 400,
      message: 'Invalid credentials',
      path: '/api/v1/users/login',
    });
    expect(res.body.timestamp).toBeDefined();
  });

  it('4. should return 403 Forbidden for unauthorized role access', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/users')
      .set('x-role', 'citizen')
      .expect(403);

    expect(res.body).toMatchObject({
      success: false,
      statusCode: 403,
      path: '/api/v1/users',
    });
    expect(res.body.message).toMatch(/(Super User Privilege Required|Access denied)/);
  });

  it('5. should have recorded errors in the Winston logs directory', async () => {
    const logsDir = path.join(process.cwd(), 'logs');
    expect(fs.existsSync(logsDir)).toBe(true);

    const files = fs.readdirSync(logsDir);
    const errorLogFiles = files.filter((f) => f.startsWith('error-') && f.endsWith('.log'));
    expect(errorLogFiles.length).toBeGreaterThan(0);

    const latestErrorLog = path.join(logsDir, errorLogFiles[0]);
    const content = fs.readFileSync(latestErrorLog, 'utf-8');
    expect(content.length).toBeGreaterThan(0);
    expect(content).toContain('[EXCEPTION]');
  });
});
