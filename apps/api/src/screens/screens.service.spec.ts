import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ScreensService } from './screens.service';
import type { SDUIScreen } from '@sdui/schema';

const minimalScreen = (screenId: string): SDUIScreen => ({
  version: '1.0',
  screenId,
  root: { id: 'root', type: 'text', props: { content: '테스트', style: 'body' } },
});

describe('ScreensService', () => {
  let service: ScreensService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScreensService],
    }).compile();

    service = module.get<ScreensService>(ScreensService);
  });

  describe('findAll()', () => {
    it('초기 3개 스크린 메타를 반환한다', () => {
      const result = service.findAll();
      expect(result).toHaveLength(3);
    });

    it('각 항목에 id, screenId, description 필드가 있다', () => {
      const result = service.findAll();
      for (const item of result) {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('screenId');
        expect(item).toHaveProperty('description');
        expect(typeof item.description).toBe('string');
      }
    });

    it('home 스크린의 description이 빈 문자열이 아니다', () => {
      const result = service.findAll();
      const home = result.find((s) => s.screenId === 'home');
      expect(home).toBeDefined();
      expect(home!.description).not.toBe('');
    });
  });

  describe('findOne()', () => {
    it('유효한 screenId로 SDUIScreen을 반환한다', () => {
      const result = service.findOne('home');
      expect(result.screenId).toBe('home');
      expect(result.version).toBe('1.0');
      expect(result.root).toBeDefined();
      expect(result.root.type).toBe('stack');
    });

    it('product-detail, promo-banner도 반환한다', () => {
      expect(service.findOne('product-detail').screenId).toBe('product-detail');
      expect(service.findOne('promo-banner').screenId).toBe('promo-banner');
    });

    it('존재하지 않는 ID는 NotFoundException을 던진다', () => {
      expect(() => service.findOne('unknown')).toThrow(NotFoundException);
    });

    it('에러 메시지에 screenId가 포함된다', () => {
      expect(() => service.findOne('no-such')).toThrow("Screen 'no-such'을 찾을 수 없습니다");
    });
  });

  describe('update()', () => {
    it('존재하는 screenId를 업데이트하고 새 화면을 반환한다', () => {
      const updated = minimalScreen('home');
      const result = service.update('home', updated);
      expect(result).toEqual(updated);
    });

    it('업데이트 후 findOne으로 변경된 데이터를 조회할 수 있다', () => {
      const updated = minimalScreen('home');
      service.update('home', updated);
      expect(service.findOne('home').root.type).toBe('text');
    });

    it('존재하지 않는 ID는 NotFoundException을 던진다', () => {
      expect(() => service.update('ghost', minimalScreen('ghost'))).toThrow(NotFoundException);
    });

    it('에러 메시지에 screenId가 포함된다', () => {
      expect(() => service.update('ghost', minimalScreen('ghost'))).toThrow(
        "Screen 'ghost'을 찾을 수 없습니다",
      );
    });
  });
});
