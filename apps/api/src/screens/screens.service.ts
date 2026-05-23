import { Injectable, NotFoundException } from '@nestjs/common';
import type { SDUIScreen } from '@sdui/schema';

export interface ScreenMeta {
  id: string;
  screenId: string;
  description: string;
}

@Injectable()
export class ScreensService {
  private readonly screens: Map<string, SDUIScreen> = new Map<string, SDUIScreen>([
    ['home', {
      version: '1.0',
      screenId: 'home',
      root: {
        id: 'home-root',
        type: 'stack',
        props: {
          direction: 'column',
          gap: 16,
          children: [
            {
              id: 'home-heading',
              type: 'text',
              props: {
                content: '홈 화면에 오신 것을 환영합니다',
                style: 'heading',
              },
            },
            {
              id: 'home-btn-explore',
              type: 'button',
              props: {
                label: '상품 둘러보기',
                variant: 'primary',
                action: { type: 'navigate', url: '/product-detail' },
              },
            },
            {
              id: 'home-btn-promo',
              type: 'button',
              props: {
                label: '프로모션 보기',
                variant: 'secondary',
                action: { type: 'navigate', url: '/promo-banner' },
              },
            },
          ],
        },
      },
    }],
    ['product-detail', {
      version: '1.0',
      screenId: 'product-detail',
      root: {
        id: 'product-card',
        type: 'card',
        props: {
          children: [
            {
              id: 'product-image',
              type: 'image',
              props: {
                src: 'https://picsum.photos/seed/product/400/300',
                alt: '상품 이미지',
                width: 400,
                height: 300,
              },
            },
            {
              id: 'product-title',
              type: 'text',
              props: {
                content: '프리미엄 무선 이어폰',
                style: 'heading',
              },
            },
            {
              id: 'product-desc',
              type: 'text',
              props: {
                content:
                  '노이즈 캔슬링 기술과 30시간 배터리 수명을 자랑하는 프리미엄 이어폰입니다.',
                style: 'body',
              },
            },
            {
              id: 'product-buy-btn',
              type: 'button',
              props: {
                label: '지금 구매하기',
                variant: 'primary',
                action: {
                  type: 'api_call',
                  endpoint: '/api/orders',
                  method: 'POST',
                },
              },
            },
          ],
        },
      },
    }],
    ['promo-banner', {
      version: '1.0',
      screenId: 'promo-banner',
      root: {
        id: 'promo-card',
        type: 'card',
        props: {
          children: [
            {
              id: 'promo-title',
              type: 'text',
              props: {
                content: '여름 특가 세일 — 최대 50% 할인',
                style: 'heading',
              },
            },
            {
              id: 'promo-subtitle',
              type: 'text',
              props: {
                content: '오늘 자정까지만 진행되는 한정 프로모션입니다. 놓치지 마세요!',
                style: 'caption',
              },
            },
            {
              id: 'promo-cta-btn',
              type: 'button',
              props: {
                label: '혜택 받기',
                variant: 'primary',
                action: { type: 'deeplink', path: '/promo/summer-sale' },
              },
            },
          ],
        },
      },
    }],
  ]);

  private readonly descriptions: Record<string, string> = {
    home: '헤딩 텍스트와 버튼 2개가 있는 홈 화면',
    'product-detail': '이미지, 제목, 설명, 구매 버튼이 카드 안에 있는 상품 상세 화면',
    'promo-banner': '배경 카드에 텍스트와 CTA 버튼이 있는 프로모션 배너 화면',
  };

  findAll(): ScreenMeta[] {
    return Array.from(this.screens.values()).map((screen) => ({
      id: screen.screenId,
      screenId: screen.screenId,
      description: this.descriptions[screen.screenId] ?? '',
    }));
  }

  findOne(screenId: string): SDUIScreen {
    const screen = this.screens.get(screenId);
    if (!screen) {
      throw new NotFoundException(`Screen '${screenId}'을 찾을 수 없습니다`);
    }
    return screen;
  }

  update(screenId: string, screen: SDUIScreen): SDUIScreen {
    if (!this.screens.has(screenId)) {
      throw new NotFoundException(`Screen '${screenId}'을 찾을 수 없습니다`);
    }
    this.screens.set(screenId, screen);
    return screen;
  }
}
