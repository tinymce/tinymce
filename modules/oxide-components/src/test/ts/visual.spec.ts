import { expect, test } from '@playwright/test';

// This file is created by Storybook
// when we run `npm run build`
import storybook from '../../../storybook-static/index.json' with { type: 'json' };

declare const document: any;

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

    // Wait for final body classes state to avoid a flake where the screenshot would be made while a spinner is shown see #TINY-13132
    await page.waitForFunction(() => {
      // Code here needs to be inlined since this function is evaluated inside the frame
      const requiredBodyClasses = [ 'sb-main-centered', 'sb-show-main' ];
      const bodyClasses = document.body ? Array.from(document.body.classList) : [];

      return requiredBodyClasses.length === bodyClasses.length && requiredBodyClasses.every((cls, i) => cls === bodyClasses[i]);
    }, null, { polling: 10 });

    await expect(page).toHaveScreenshot(
      `${story.id}-${workerInfo.project.name}-${process.platform}.png`,
      {
        fullPage: true,
        animations: 'disabled',
      }
    );
  });
}
