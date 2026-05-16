import { test, expect } from '@playwright/test';

test.describe('관리자 목록 페이지', () => {
  test('스크린 카드 3개가 표시된다', async ({ page }) => {
    await page.goto('/admin');
    const cards = page.locator('a[href^="/admin/preview/"]');
    await expect(cards).toHaveCount(3);
  });

  test('home, product-detail, promo-banner screenId가 노출된다', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.getByText('home')).toBeVisible();
    await expect(page.getByText('product-detail')).toBeVisible();
    await expect(page.getByText('promo-banner')).toBeVisible();
  });

  test('카드 클릭 시 /admin/preview/[screenId]로 이동한다', async ({ page }) => {
    await page.goto('/admin');
    await page.getByText('home').click();
    await expect(page).toHaveURL(/\/admin\/preview\/home/);
  });
});
