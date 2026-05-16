import { test, expect } from '@playwright/test';

test.describe('홈 페이지 — SDUI 렌더링', () => {
  test('기본 home 스크린이 렌더링된다', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('홈 화면에 오신 것을 환영합니다')).toBeVisible();
  });

  test('버튼 컴포넌트의 label이 노출된다', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('상품 둘러보기')).toBeVisible();
    await expect(page.getByText('프로모션 보기')).toBeVisible();
  });

  test('?screen=product-detail로 다른 스크린을 렌더링한다', async ({ page }) => {
    await page.goto('/?screen=product-detail');
    await expect(page.getByText('프리미엄 무선 이어폰')).toBeVisible();
  });

  test('존재하지 않는 screen 파라미터는 에러 메시지를 표시한다', async ({ page }) => {
    await page.goto('/?screen=no-such-screen');
    await expect(page.getByText(/찾을 수 없습니다/)).toBeVisible();
  });
});
