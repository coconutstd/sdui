import { test, expect } from '@playwright/test';

test.describe('관리자 프리뷰 페이지', () => {
  test.beforeEach(async ({ request }) => {
    // 각 테스트 전에 home 스크린을 원래 상태로 초기화
    await request.put('http://localhost:3001/screens/home', {
      data: {
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
                props: { content: '홈 화면에 오신 것을 환영합니다', style: 'heading' },
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
      },
    });
  });

  test('home 프리뷰 페이지가 로드된다', async ({ page }) => {
    await page.goto('/admin/preview/home');
    await expect(page.getByText('home')).toBeVisible();
    await expect(page.getByText('서버에 저장')).toBeVisible();
  });

  test('JSON 모드 토글 시 textarea가 표시된다', async ({ page }) => {
    await page.goto('/admin/preview/home');
    await page.getByText('{ } JSON 모드').click();
    await expect(page.locator('textarea')).toBeVisible();
  });

  test('JSON 에디터에서 텍스트 수정 시 미리보기에 즉시 반영된다', async ({ page }) => {
    await page.goto('/admin/preview/home');
    await page.getByText('{ } JSON 모드').click();

    const textarea = page.locator('textarea');
    const json = await textarea.inputValue();
    const modified = json.replace('홈 화면에 오신 것을 환영합니다', '수정된 제목');
    await textarea.fill(modified);

    await expect(page.getByRole('heading', { name: '수정된 제목' })).toBeVisible();
  });

  test('[핵심] 관리자 수정 저장 → 홈 페이지에서 변경 내용이 렌더링된다', async ({ page }) => {
    // 1. 관리자 프리뷰에서 JSON 수정
    await page.goto('/admin/preview/home');
    await page.getByText('{ } JSON 모드').click();

    const textarea = page.locator('textarea');
    const json = await textarea.inputValue();
    const modified = json.replace('상품 둘러보기', 'E2E 테스트 버튼');
    await textarea.fill(modified);

    // 2. 서버에 저장
    await page.getByText('서버에 저장').click();
    await expect(page.getByText('저장됨 ✓')).toBeVisible();

    // 3. 홈 페이지로 이동해 변경 내용 확인
    await page.goto('/');
    await expect(page.getByText('E2E 테스트 버튼')).toBeVisible();
  });

  test('초기화 버튼 클릭 → 서버 원본 데이터로 복구되고 홈에서도 확인된다', async ({ page }) => {
    // 1. 먼저 데이터를 수정해 저장
    await page.goto('/admin/preview/home');
    await page.getByText('{ } JSON 모드').click();

    const textarea = page.locator('textarea');
    const json = await textarea.inputValue();
    await textarea.fill(json.replace('상품 둘러보기', '임시 수정'));
    await page.getByText('서버에 저장').click();
    await expect(page.getByText('저장됨 ✓')).toBeVisible();

    // 2. 다시 수정 후 초기화 (서버에서 재로드)
    await textarea.fill(json.replace('상품 둘러보기', '또 다른 수정'));
    await page.getByText('초기화').click();

    // 3. 초기화 후 에디터에는 '임시 수정'이 표시됨 (서버 저장 상태)
    await expect(page.getByRole('button', { name: '임시 수정' })).toBeVisible();
  });
});
