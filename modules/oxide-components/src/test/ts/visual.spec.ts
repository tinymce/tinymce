import { expect, test, type Page, type TestInfo } from '@playwright/test';

// This file is created by Storybook
// when we run `npm run build`
import storybook from '../../../storybook-static/index.json' with { type: 'json' };

// Only run tests on stories, not other documentation pages.
const stories = Object.values(storybook.entries).filter(
  (e) => e.type === 'story' && !e.tags.includes('skip-visual-testing')
);

const visualTest = async (story: (typeof stories)[number], page: Page, workerInfo: TestInfo, cb?: () => Promise<void>) => {
// eslint-disable-next-line @tinymce/no-implicit-dom-globals
  const params = new URLSearchParams({
    id: story.id,
    viewMode: 'story',
  });

  await page.goto(`/iframe.html?${params.toString()}`);
  await page.waitForSelector('#storybook-root', { state: 'attached' });

  // Wait for final body classes state to avoid a flake where the screenshot would be made while a spinner is shown see #TINY-13132
  await page.waitForSelector('body[class="sb-main-centered sb-show-main"]');

  await page.waitForLoadState('networkidle');

  await cb?.();

  await expect(page).toHaveScreenshot(
    `${story.id}-${workerInfo.project.name}-${process.platform}.png`,
    {
      fullPage: true,
      animations: 'disabled',
    }
  );
};

// for (const story of stories) {
//   test(`${story.title} ${story.name} should not have visual regressions`, async ({
//     page,
//   }, workerInfo) => {
//     await visualTest(story, page, workerInfo);
//   });
// }

// This component has custom visual tests as the trigger button needs to be clicked before the screenshot
const dropdownStories = Object.values(storybook.entries).filter(
  (e) => e.type === 'story' && e.tags.includes('dropdown-visual-testing')
);

for (const story of dropdownStories) {
  test(`${story.title} ${story.name} should not have visual regressions`, async ({
    page,
  }, workerInfo) => {
    await visualTest(story, page, workerInfo, async () => {
      await page.getByRole('button').click();
      await expect(page.locator('[popover]:popover-open')).toBeVisible();
    });
  });
}

