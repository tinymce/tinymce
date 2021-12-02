import { FocusTools, Keys, UiFinder, Waiter } from '@ephox/agar';
import { before, describe, it } from '@ephox/bedrock-client';
import { PlatformDetection } from '@ephox/sand';
import { Attribute, SugarBody, SugarDocument } from '@ephox/sugar';
import { TinyAssertions, TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/charmap/Plugin';

import { fakeEvent } from '../module/Helpers';

describe('browser.tinymce.plugins.charmap.SearchTest', () => {
  before(function () {
    // TODO: TINY-6905: Test is broken on Chromium Edge 86, so we need to investigate
    const platform = PlatformDetection.detect();
    if (platform.browser.isChromium() && platform.os.isWindows()) {
      this.skip();
    }
  });

  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'charmap',
    toolbar: 'charmap',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ], true);

  // TODO: Replicate this test with only one category of characters.
  it('TBA: Open dialog, Search for "euro", Euro should be first option', async () => {
    const editor = hook.editor();
    const body = SugarBody.body();
    const doc = SugarDocument.getDocument();

    TinyUiActions.clickOnToolbar(editor, 'button[aria-label="Special character"]');
    await TinyUiActions.pWaitForDialog(editor);
    await FocusTools.pTryOnSelector('Focus should start on', doc, 'input'); // TODO: Remove duped startup of these tests
    const input = FocusTools.setActiveValue(doc, 'euro');
    fakeEvent(input, 'input');
    await Waiter.pTryUntil(
      'Wait until Euro is the first choice (search should filter)',
      () => {
        const item = UiFinder.findIn(body, '.tox-collection__item:first').getOrDie();
        const value = Attribute.get(item, 'data-collection-item-value');
        assert.equal(value, '€', 'Search should show euro');
      }
    );
    TinyUiActions.keydown(editor, Keys.tab());
    await FocusTools.pTryOnSelector('Focus should have moved to collection', doc, '.tox-collection__item');
    TinyUiActions.keydown(editor, Keys.enter());
    await Waiter.pTryUntil(
      'Waiting for content update',
      () => TinyAssertions.assertContent(editor, '<p>&euro;</p>')
    );
  });
});
