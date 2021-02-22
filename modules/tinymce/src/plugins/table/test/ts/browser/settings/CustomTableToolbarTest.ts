import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks, TinyUiActions } from '@ephox/mcagar';
import { SelectorFilter } from '@ephox/sugar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/table/Plugin';
import Theme from 'tinymce/themes/silver/Theme';
import * as TableTestUtils from '../../module/test/TableTestUtils';

describe('browser.tinymce.plugins.table.CustomTableToolbarTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'table',
    table_toolbar: 'tableprops tabledelete',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin, Theme ], true);

  it('test custom count of toolbar buttons', async () => {
    const editor = hook.editor();
    editor.setContent('<table><tbody><tr><td>x</td></tr></tbody></table>');
    TableTestUtils.openContextToolbarOn(editor, 'table td', [ 0 ]);
    const toolbar = await TinyUiActions.pWaitForUi(editor, 'div.tox-pop div.tox-toolbar');
    const buttons = SelectorFilter.descendants(toolbar, 'button');
    assert.lengthOf(buttons, 2, 'has correct count');
  });
});
