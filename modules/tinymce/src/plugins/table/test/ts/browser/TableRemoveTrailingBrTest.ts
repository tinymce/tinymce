import { context, describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/table/Plugin';

import * as TableTestUtils from '../module/test/TableTestUtils';

describe('browser.tinymce.plugins.table.TableRemoveTrailingBrTest', () => {

  const baseSettings = {
    plugins: 'table code',
    base_url: '/project/tinymce/js/tinymce'
  };

  context('remove_trailing_br with nested table', () => {
    const hookWithTrailingBr = TinyHooks.bddSetup<Editor>({ ...baseSettings, remove_trailing_br: true }, [ Plugin ], true);
    const hookWithoutTrailingBr = TinyHooks.bddSetup<Editor>({ ...baseSettings, remove_trailing_br: false }, [ Plugin ], true);

    it('TINY-3909: single table, not removing br', async () => {
      const editor = hookWithoutTrailingBr.editor();
      editor.setContent('');
      await TableTestUtils.pInsertTableViaGrid(editor, 2, 2);
      TinyAssertions.assertCursor(editor, [ 0, 1, 0, 0 ], 0);
      TinyAssertions.assertContentPresence(editor, { br: 4 });
    });

    it('TINY-3909: nested table, removing br', async () => {
      const editor = hookWithTrailingBr.editor();
      editor.setContent('');
      await TableTestUtils.pInsertTableViaGrid(editor, 2, 2);
      await TableTestUtils.pInsertTableViaGrid(editor, 2, 2);
      TinyAssertions.assertCursor(editor, [ 0, 1, 0, 0, 0, 1, 0, 0 ], 0);
    });

    it('TINY-3909: nested table, not removing br', async () => {
      const editor = hookWithoutTrailingBr.editor();
      editor.setContent('');
      await TableTestUtils.pInsertTableViaGrid(editor, 2, 2);
      await TableTestUtils.pInsertTableViaGrid(editor, 2, 2);
      TinyAssertions.assertCursor(editor, [ 0, 1, 0, 0, 0, 1, 0, 0 ], 0);
    });
  });

});
