import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import type { SDUIScreen } from '@sdui/schema';

describe('ScreensController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /screens', () => {
    it('200과 함께 3개 항목을 반환한다', async () => {
      const res = await request(app.getHttpServer()).get('/screens').expect(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(3);
    });

    it('각 항목에 id, screenId, description 필드가 있다', async () => {
      const res = await request(app.getHttpServer()).get('/screens').expect(200);
      for (const item of res.body) {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('screenId');
        expect(item).toHaveProperty('description');
      }
    });
  });

  describe('GET /screens/:screenId', () => {
    it('home 조회 시 200과 SDUIScreen 구조를 반환한다', async () => {
      const res = await request(app.getHttpServer()).get('/screens/home').expect(200);
      expect(res.body.screenId).toBe('home');
      expect(res.body.version).toBe('1.0');
      expect(res.body.root.type).toBe('stack');
    });

    it('product-detail, promo-banner도 200으로 조회된다', async () => {
      await request(app.getHttpServer()).get('/screens/product-detail').expect(200);
      await request(app.getHttpServer()).get('/screens/promo-banner').expect(200);
    });

    it('존재하지 않는 ID 조회 시 404를 반환한다', async () => {
      const res = await request(app.getHttpServer()).get('/screens/unknown-screen').expect(404);
      expect(res.body.message).toContain('unknown-screen');
    });
  });

  describe('PUT /screens/:screenId', () => {
    const updatedScreen: SDUIScreen = {
      version: '1.0',
      screenId: 'home',
      root: { id: 'new-root', type: 'text', props: { content: '수정된 홈', style: 'heading' } },
    };

    it('존재하는 screenId 업데이트 시 200과 수정된 화면을 반환한다', async () => {
      const res = await request(app.getHttpServer())
        .put('/screens/home')
        .send(updatedScreen)
        .expect(200);
      expect(res.body).toEqual(updatedScreen);
    });

    it('업데이트 후 GET으로 변경된 데이터를 조회할 수 있다', async () => {
      await request(app.getHttpServer()).put('/screens/home').send(updatedScreen).expect(200);

      const res = await request(app.getHttpServer()).get('/screens/home').expect(200);
      expect(res.body.root.type).toBe('text');
      expect(res.body.root.props.content).toBe('수정된 홈');
    });

    it('존재하지 않는 ID 업데이트 시 404를 반환한다', async () => {
      const res = await request(app.getHttpServer())
        .put('/screens/unknown-screen')
        .send(updatedScreen)
        .expect(404);
      expect(res.body.message).toContain('unknown-screen');
    });
  });
});
