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
  await page.waitForSelector('body.sb-show-main');

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

for (const story of stories) {
  test(`${story.title} ${story.name} should not have visual regressions`, async ({
    page,
  }, workerInfo) => {
    await visualTest(story, page, workerInfo);
  });
}

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

// This component has custom visual tests as the trigger button needs to be hovered over before the screenshot

const hoveroverStories = Object.values(storybook.entries).filter(
  (e) => e.type === 'story' && e.tags.includes('hover-visual-testing')
);

// The React Tooltip component delays rendering by ~300 ms after hover. We wait up to this
// timeout for the tooltip to appear before taking the screenshot.
const TOOLTIP_APPEARANCE_TIMEOUT_MS = 1_000;

for (const story of hoveroverStories) {
  test(`${story.title} ${story.name} should not have visual hover regressions`, async ({
    page,
  }, workerInfo) => {
    await visualTest(story, page, workerInfo, async () => {
      await page.getByTitle('hover').hover();

      // If the tooltip is not present after the timeout (e.g. on Safari when the tooltip's showCondition detects overflow
      // and suppresses rendering), we continue the test anyway — the screenshot still captures
      // the correct visual state without the tooltip.
      // eslint-disable-next-line @tinymce/prefer-fun
      await page.getByText('Message').waitFor({ state: 'visible', timeout: TOOLTIP_APPEARANCE_TIMEOUT_MS }).catch(() => {});
    });
  });
}
