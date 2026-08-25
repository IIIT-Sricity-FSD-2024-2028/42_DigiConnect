import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as express from 'express';
import * as fs from 'fs';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import * as path from 'path';

describe('Static Uploads Serving (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const nestApp = moduleFixture.createNestApplication<NestExpressApplication>();
    const uploadsDir = path.join(process.cwd(), 'uploads');
    const docsDir = path.join(uploadsDir, 'documents');
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });
    }
    fs.writeFileSync(path.join(docsDir, 'test-preview.txt'), 'DigiConnect Document Static Serving Test Success!');

    nestApp.use('/uploads', express.static(uploadsDir));
    app = nestApp;
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('serves uploaded documents under /uploads/ prefix (200)', async () => {
    const res = await request(app.getHttpServer())
      .get('/uploads/documents/test-preview.txt');

    expect(res.status).toBe(200);
    expect(res.text).toContain('DigiConnect Document Static Serving Test Success!');
  });
});
