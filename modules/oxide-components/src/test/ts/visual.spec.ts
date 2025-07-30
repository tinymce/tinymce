import { expect, test } from '@playwright/test';

// This file is created by Storybook
// when we run `npm run build`
import storybook from '../../../storybook-static/index.json' with { type: 'json' };

// Only run tests on stories, not other documentation pages.
const stories = Object.values(storybook.entries).filter(
  (e) => e.type === 'story' && !e.tags.includes('skip-visual-testing')
);

for (const story of stories) {
  test(`${story.title} ${story.name} should not have visual regressions`, async ({
    page,
  }, workerInfo) => {
    // eslint-disable-next-line @tinymce/no-implicit-dom-globals
    const params = new URLSearchParams({
      id: story.id,
      viewMode: 'story',
    });

    await page.goto(`/iframe.html?${params.toString()}`);
    await page.waitForSelector('#storybook-root');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot(
      `${story.id}-${workerInfo.project.name}-${process.platform}.png`,
      {
        fullPage: true,
        animations: 'disabled',
      }
    );
  });
}
