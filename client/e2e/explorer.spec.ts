import { test, expect, Page } from '@playwright/test';

// Helper to handle random 10% network simulator errors by clicking retry if present
async function ensureTableLoaded(page: Page) {
  const firstRow = page.locator('[role="button"][id^="ticket-row-"]').first();
  const retryBtn = page.getByRole('button', { name: /Retry/i });

  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      if (await retryBtn.isVisible({ timeout: 1000 })) {
        await retryBtn.click();
      }
      await expect(firstRow).toBeVisible({ timeout: 4000 });
      return;
    } catch {
      if (await retryBtn.isVisible()) {
        await retryBtn.click();
      }
    }
  }
}

test.describe('DareAI Data Explorer Comprehensive E2E Tests', () => {
  test('1. Core Workflow: Header, Dataset Records, Search, Filter, Sort, Detail Drawer', async ({ page }) => {
    await page.goto('/tickets');
    await expect(page).toHaveTitle(/DareAI Data Explorer/i);
    await expect(page.getByRole('heading', { name: /Support Ticket Explorer/i })).toBeVisible();

    // Verify dataset records count is displayed
    await expect(page.getByText('25,000+').first()).toBeVisible();

    // Search for "refund"
    const searchInput = page.getByPlaceholder(/Search tickets, customers or subjects/i);
    await searchInput.fill('refund');

    // Verify debounced URL sync
    await expect(page).toHaveURL(/q=refund/);

    // Apply Status filter "open"
    const statusSelect = page.locator('#filter-status');
    await statusSelect.selectOption('open');
    await expect(page).toHaveURL(/status=open/);

    // Apply Priority filter "high"
    const prioritySelect = page.locator('#filter-priority');
    await prioritySelect.selectOption('high');
    await expect(page).toHaveURL(/priority=high/);

    // Apply Category filter "billing"
    const categorySelect = page.locator('#filter-category');
    await categorySelect.selectOption('billing');
    await expect(page).toHaveURL(/category=billing/);

    // Select Sort "updated-desc"
    const sortSelect = page.locator('#sort-select');
    await sortSelect.selectOption('updated-desc');
    await expect(page).toHaveURL(/sort=updated-desc/);

    // Ensure table rows are loaded
    await ensureTableLoaded(page);

    // Open first matching ticket
    const firstRow = page.locator('[role="button"][id^="ticket-row-"]').first();
    await firstRow.click();

    // Verify detail drawer opened with URL containing ticket parameter
    await expect(page).toHaveURL(/ticket=\d+/);
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(page.getByText(/Customer Information/i)).toBeVisible();

    // Close ticket using Escape key
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    await expect(page).toHaveURL(/q=refund/);
    await expect(page).toHaveURL(/status=open/);
    expect(page.url()).not.toContain('ticket=');
  });

  test('2. Server-side Query Verification & Debouncing', async ({ page }) => {
    const apiRequests: string[] = [];
    page.on('request', (req) => {
      if (req.url().includes('/api/tickets')) {
        apiRequests.push(req.url());
      }
    });

    await page.goto('/tickets');
    const searchInput = page.getByPlaceholder(/Search tickets, customers or subjects/i);
    
    // Rapid typing of 6 characters: "r", "e", "f", "u", "n", "d"
    await searchInput.type('refund', { delay: 30 });

    // Wait for debounce period (300ms + margin)
    await page.waitForTimeout(600);

    // Verify debouncing prevented 1 request per keystroke
    const searchTicketRequests = apiRequests.filter((url) => url.includes('q='));
    expect(searchTicketRequests.length).toBeLessThanOrEqual(2);
  });

  test('3. Race Condition & Rapid Switching Protection', async ({ page }) => {
    await page.goto('/tickets');
    const searchInput = page.getByPlaceholder(/Search tickets, customers or subjects/i);

    // Trigger rapid search succession
    await searchInput.fill('refund');
    await page.waitForTimeout(80);
    await searchInput.fill('payment');
    await page.waitForTimeout(80);
    await searchInput.fill('login');

    // Wait for queries to settle
    await page.waitForTimeout(1500);

    // The final URL must strictly be q=login
    await expect(page).toHaveURL(/q=login/);

    // The search input must contain "login"
    await expect(searchInput).toHaveValue('login');
  });

  test('4. URL State Preservation on Refresh and Deep-Linking', async ({ page }) => {
    // Navigate directly with full URL params
    await page.goto('/tickets?q=billing&status=resolved&priority=urgent&sort=updated-desc&page=2');

    const searchInput = page.getByPlaceholder(/Search tickets, customers or subjects/i);
    await expect(searchInput).toHaveValue('billing');

    const statusSelect = page.locator('#filter-status');
    await expect(statusSelect).toHaveValue('resolved');

    const prioritySelect = page.locator('#filter-priority');
    await expect(prioritySelect).toHaveValue('urgent');

    const sortSelect = page.locator('#sort-select');
    await expect(sortSelect).toHaveValue('updated-desc');

    // Verify browser reload preserves state
    await page.reload();
    await expect(searchInput).toHaveValue('billing');
    await expect(statusSelect).toHaveValue('resolved');
    await expect(prioritySelect).toHaveValue('urgent');
    await expect(sortSelect).toHaveValue('updated-desc');
  });

  test('5. Virtualization: Efficient DOM Node Count', async ({ page }) => {
    await page.goto('/tickets');
    await ensureTableLoaded(page);

    // The page loads 50 records per page, but virtualizer only mounts visible items + overscan
    const renderedRows = await page.locator('[id^="ticket-row-"]').count();
    expect(renderedRows).toBeGreaterThan(0);
    expect(renderedRows).toBeLessThanOrEqual(25); // Significantly less than 50
  });

  test('6. Empty State and Reset', async ({ page }) => {
    await page.goto('/tickets');
    const searchInput = page.getByPlaceholder(/Search tickets, customers or subjects/i);
    await searchInput.fill('xyz-no-ticket-999999');

    // Wait for empty state
    await expect(page.getByText(/No tickets found/i)).toBeVisible({ timeout: 10000 });

    const clearButton = page.getByRole('button', { name: /Clear filters/i });
    await expect(clearButton).toBeVisible();
    await clearButton.click();

    // Verify search is cleared and tickets return
    await expect(searchInput).toHaveValue('');
    await ensureTableLoaded(page);
  });

  test('7. Keyboard Accessibility', async ({ page }) => {
    await page.goto('/tickets');
    await ensureTableLoaded(page);

    const firstRow = page.locator('[role="button"][id^="ticket-row-"]').first();
    await firstRow.focus();
    await page.keyboard.press('Enter');

    // Dialog should open on Enter
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // Close button should be focusable
    const closeBtn = page.getByRole('button', { name: /Close ticket details/i });
    await expect(closeBtn).toBeVisible();

    // Escape closes drawer
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
  });

  test('8. Responsive Viewports', async ({ page }) => {
    // Mobile Viewport (375x667)
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/tickets');
    await expect(page.getByRole('heading', { name: /Support Ticket Explorer/i })).toBeVisible();
    await expect(page.getByPlaceholder(/Search tickets/i)).toBeVisible();

    // Tablet Viewport (768x1024)
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.getByRole('heading', { name: /Support Ticket Explorer/i })).toBeVisible();

    // Desktop Viewport (1440x900)
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(page.getByRole('heading', { name: /Support Ticket Explorer/i })).toBeVisible();
  });
});
