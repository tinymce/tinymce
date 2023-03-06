import { FocusTools, Keys, Mouse, UiFinder, Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { SugarBody } from '@ephox/sugar';
import { TinyDom, TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.themes.silver.editor.Tooltip', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    plugins: [ 'link', 'image' ],
    toolbar: 'link image | fontsize'
  });

  const tooltipSelector = '.tox-silver-sink .tox-tooltip__body';
  const insertLinkSelector = 'button.tox-tbtn[aria-label="Insert/edit link"]';
  const assertTooltip = (text: string) => {
    const tooltip = UiFinder.findIn(SugarBody.body(), tooltipSelector).getOrDie();
    assert.equal(tooltip.dom.textContent, text);
  };

  it('TINY-9275: should be rendered after a delay on mouse over', async () => {
    const editor = hook.editor();

    // Mouse over the font sizes dropdown
    Mouse.mouseOver(UiFinder.findIn(TinyDom.container(editor), 'button.tox-tbtn.tox-tbtn--select.tox-tbtn--bespoke').getOrDie());
    // Not expecting the tooltip to be rendered immedilately
    UiFinder.notExists(SugarBody.body(), tooltipSelector);
    // This is a slightly higher than the default delay for showing a tooltip to take renderinging time into account
    await Waiter.pWait(1000);
    assertTooltip('Font sizes');

    // Then move mouse over the insert link button
    const insertLinkButton = UiFinder.findIn(TinyDom.container(editor), insertLinkSelector).getOrDie();
    Mouse.mouseOver(insertLinkButton);
    // There is a small delay between hiding the current tooltip and showing another one
    await Waiter.pWait(200);
    assertTooltip('Insert/edit link');

    // Mouseovering another element doesn't trigger `mouseout` event on tooltip
    Mouse.mouseOut(insertLinkButton);
    await Waiter.pTryUntil(
      'wait for tooltip to be removed',
      () => UiFinder.notExists(SugarBody.body(), tooltipSelector)
    );
  });

  it('TINY-9275: should be rendered immediately when navigating by keyboard', async () => {
    const editor = hook.editor();
    // Focus on the first toolbar button
    FocusTools.setFocus(TinyDom.container(editor), insertLinkSelector);
    // Wait for the tooltip to be visible. Notice that the waiting is significant less
    await Waiter.pWait(500);
    assertTooltip('Insert/edit link');

    // Navigate to another button in the toolbar
    TinyUiActions.keydown(editor, Keys.tab());
    await Waiter.pWait(300);
    assertTooltip('Font sizes');
  });
});
