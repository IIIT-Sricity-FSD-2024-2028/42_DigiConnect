import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { HttpExceptionFilter } from './../src/filters/http-exception.filter';

describe('Router-Level Middlewares (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('CitizenContextMiddleware', () => {
    it('rejects GET /applications/my without x-user-id (401)', async () => {
      const res = await request(app.getHttpServer())
        .get('/applications/my')
        .set('x-role', 'citizen');
      
      expect(res.status).toBe(401);
      expect(res.body.message).toContain('Citizen Context Required');
    });

    it('allows GET /applications/my with valid x-user-id and role (200)', async () => {
      const res = await request(app.getHttpServer())
        .get('/applications/my')
        .set('x-role', 'citizen')
        .set('x-user-id', 'CIT-1001');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('keeps public tracking route GET /applications/track/:ref accessible (200)', async () => {
      const res = await request(app.getHttpServer())
        .get('/applications/track/APP-1001')
        .set('x-role', 'citizen');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('rejects GET /grievances/my without x-user-id (401)', async () => {
      const res = await request(app.getHttpServer())
        .get('/grievances/my')
        .set('x-role', 'citizen');

      expect(res.status).toBe(401);
      expect(res.body.message).toContain('Citizen Context Required');
    });

    it('rejects GET /notifications without x-user-id (401)', async () => {
      const res = await request(app.getHttpServer())
        .get('/notifications')
        .set('x-role', 'citizen');

      expect(res.status).toBe(401);
      expect(res.body.message).toContain('Citizen Context Required');
    });
  });

  describe('SuperUserAuthMiddleware', () => {
    it('blocks unauthorized citizen from GET /super-user/dashboard (403)', async () => {
      const res = await request(app.getHttpServer())
        .get('/super-user/dashboard')
        .set('x-role', 'citizen');

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('Super User Privilege Required');
    });

    it('allows super_user access to GET /super-user/dashboard (200)', async () => {
      const res = await request(app.getHttpServer())
        .get('/super-user/dashboard')
        .set('x-role', 'super_user');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('blocks non-super-user from GET /workflow/config (403)', async () => {
      const res = await request(app.getHttpServer())
        .get('/workflow/config')
        .set('x-role', 'officer');

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('Super User Privilege Required');
    });
  });

  describe('OfficerScopeMiddleware', () => {
    it('blocks citizen role from GET /applications/officer-queue (403)', async () => {
      const res = await request(app.getHttpServer())
        .get('/applications/officer-queue')
        .set('x-role', 'citizen');

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('Staff Scope Required');
    });

    it('blocks mutating PATCH /applications/:id/status without x-user-id (401)', async () => {
      const res = await request(app.getHttpServer())
        .patch('/applications/APP-1001/status')
        .set('x-role', 'officer')
        .send({ status: 'Under Review' });

      expect(res.status).toBe(401);
      expect(res.body.message).toContain('Staff Context Required');
    });

    it('allows valid officer on GET /applications/officer-queue (200)', async () => {
      const res = await request(app.getHttpServer())
        .get('/applications/officer-queue')
        .set('x-role', 'officer')
        .set('x-user-id', 'EMP-1001');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
