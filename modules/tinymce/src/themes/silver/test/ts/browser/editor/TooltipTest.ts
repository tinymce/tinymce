import { FocusTools, Keys, Mouse, UiFinder, Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { SugarBody, SugarElement } from '@ephox/sugar';
import { TinyDom, TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import ImagePlugin from 'tinymce/plugins/image/Plugin';
import LinkPlugin from 'tinymce/plugins/link/Plugin';

describe('browser.tinymce.themes.silver.editor.TooltipTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    plugins: [ 'link', 'image' ],
    toolbar: 'link image | fontsize'
  }, [ ImagePlugin, LinkPlugin ]);

  const tooltipSelector = '.tox-silver-sink .tox-tooltip__body';
  const insertLinkSelector = 'button.tox-tbtn[aria-label="Insert/edit link"]';
  const assertTooltip = async (editor: Editor, text: string) => {
    const tooltip = await TinyUiActions.pWaitForUi(editor, tooltipSelector) as SugarElement<HTMLElement>;
    assert.equal(tooltip.dom.textContent, text);
  };

  // TODO: TINY-10465 - Improve tests
  it('TINY-9275: should be rendered after a delay on mouse over', async () => {
    const editor = hook.editor();

    // Mouse over the font sizes dropdown
    Mouse.mouseOver(UiFinder.findIn(TinyDom.container(editor), 'button.tox-tbtn.tox-tbtn--select.tox-tbtn--bespoke').getOrDie());
    // Not expecting the tooltip to be rendered immedilately
    UiFinder.notExists(SugarBody.body(), tooltipSelector);
    // This is a slightly higher than the default delay for showing a tooltip to take renderinging time into account
    await assertTooltip(editor, 'Font size 12pt');

    // Then move mouse over the insert link button
    const insertLinkButton = await TinyUiActions.pWaitForUi(editor, insertLinkSelector);
    Mouse.mouseOver(insertLinkButton);

    await Waiter.pWait(500);
    // There is a small delay between hiding the current tooltip and showing another one
    await assertTooltip(editor, 'Insert/edit link');

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

    await TinyUiActions.pWaitForUi(editor, insertLinkSelector);
    FocusTools.setFocus(SugarBody.body(), insertLinkSelector);
    // Wait for the tooltip to be visible. Notice that the waiting is significant less
    await Waiter.pWait(500);
    await assertTooltip(editor, 'Insert/edit link');

    // Navigate to another button in the toolbar
    TinyUiActions.keydown(editor, Keys.tab());
    await Waiter.pWait(500);
    await assertTooltip(editor, 'Font size 12pt');
  });
});
