import { context, describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/table/Plugin';

import * as TableTestUtils from '../module/test/TableTestUtils';

describe('browser.tinymce.plugins.table.TableCellPropsStyleTest', () => {

  const baseSettings = {
    plugins: 'table',
    base_url: '/project/tinymce/js/tinymce'
  };

  context('TINY-3909: remove_trailing_br is true', () => {
    const hookWithTrailingBr = TinyHooks.bddSetup<Editor>({ ...baseSettings, remove_trailing_br: true }, [ Plugin ], true);

    it('TINY-3909: remove_trailing_br: true', async () => {
      const editor = hookWithTrailingBr.editor();
      editor.setContent('');
      await TableTestUtils.pInsertTableViaGrid(editor, 2, 2);
      await TableTestUtils.pInsertTableViaGrid(editor, 2, 2);
      TinyAssertions.assertContent(editor,
        '<table style="border-collapse: collapse; width: 99.9728%;" border="1"><colgroup><col style="width: 50%;"><col style="width: 50%;"></colgroup>' +
        '<tbody>' +
        '<tr>' +
        '<td>' +
        '<table style="border-collapse: collapse; width: 100.045%;" border="1"><colgroup><col style="width: 49.9022%;"><col style="width: 49.9022%;"></colgroup>' +
        '<tbody>' +
        '<tr><td>&nbsp;</td><td>&nbsp;</td></tr>' +
        '<tr><td>&nbsp;</td><td>&nbsp;</td></tr>' +
        '</tbody>' +
        '</table>' +
        '</td>' +
        '<td>&nbsp;</td>' +
        '</tr>' +
        '<tr><td>&nbsp;</td><td>&nbsp;</td></tr>' +
        '</tbody>' +
        '</table>'
      );
    });
  });

  context('TINY-3909: remove_trailing_br is false', () => {
    const hookWithoutTrailingBr = TinyHooks.bddSetup<Editor>({ ...baseSettings, remove_trailing_br: false }, [ Plugin ], true);

    it('TINY-3909: remove_trailing_br: false', async () => {
      const editor = hookWithoutTrailingBr.editor();
      editor.setContent('');
      await TableTestUtils.pInsertTableViaGrid(editor, 2, 2);
      await TableTestUtils.pInsertTableViaGrid(editor, 2, 2);
      TinyAssertions.assertContent(editor,
        '<table style="border-collapse: collapse; width: 99.9728%;" border="1"><colgroup><col style="width: 50%;"><col style="width: 50%;"></colgroup>' +
        '<tbody>' +
        '<tr>' +
        '<td>' +
        '<table style="border-collapse: collapse; width: 100.045%;" border="1"><colgroup><col style="width: 49.9022%;"><col style="width: 49.9022%;"></colgroup>' +
        '<tbody>' +
        '<tr><td>&nbsp;</td><td>&nbsp;</td></tr>' +
        '<tr><td>&nbsp;</td><td>&nbsp;</td></tr>' +
        '</tbody>' +
        '</table>' +
        '</td>' +
        '<td>&nbsp;</td>' +
        '</tr>' +
        '<tr><td>&nbsp;</td><td>&nbsp;</td></tr>' +
        '</tbody>' +
        '</table>'
      );
    });
  });
});
