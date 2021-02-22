import { Assertions, Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks, TinyUiActions } from '@ephox/mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/table/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.plugins.table.TableGridFalse', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    plugins: 'table',
    table_grid: false,
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin, Theme ], true);

  it('test table grid disabled', async () => {
    const editor = hook.editor();
    TinyUiActions.clickOnMenu(editor, 'span:contains("Table")');
    await Waiter.pTryUntil('click table menu', () =>
      TinyUiActions.clickOnUi(editor, 'div.tox-menu div.tox-collection__item .tox-collection__item-label:contains("Table")')
    );
    const dialog = await TinyUiActions.pWaitForDialog(editor, 'div.tox-dialog:has(div.tox-dialog__title:contains("Table Properties"))');
    Assertions.assertPresence(
      'assert presence of col and row input',
      {
        'label:contains("Cols")': 1,
        'label:contains("Rows")': 1
      },
      dialog
    );
  });
});
