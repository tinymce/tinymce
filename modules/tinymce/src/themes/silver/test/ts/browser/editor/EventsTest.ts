import { UiFinder, Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyContentActions, TinyHooks, TinyUiActions } from '@ephox/mcagar';
import { SugarBody } from '@ephox/sugar';

import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.themes.silver.editor.EventsTest', () => {
  const hook1 = TinyHooks.bddSetup({
    base_url: '/project/tinymce/js/tinymce'
  }, [ Theme ]);

  it('TINY-7399: Click on the editor should close the menu', async () => {
    const editor = hook1.editor();

    TinyUiActions.clickOnMenu(editor, '[role="menuitem"]');
    await Waiter.pTryUntil(
      'Wait for menu to open',
      () => UiFinder.exists(SugarBody.body(), '[role="menu"]')
    );

    TinyContentActions.trueClick(editor);
    await Waiter.pTryUntil(
      'Wait for menu to close',
      () => UiFinder.notExists(SugarBody.body(), '[role="menu"]')
    );
  });
});
