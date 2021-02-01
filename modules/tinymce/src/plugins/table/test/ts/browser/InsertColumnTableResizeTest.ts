import { before, context, describe, it } from '@ephox/bedrock-client';
import { McEditor, TinyDom } from '@ephox/mcagar';
import { SelectorFind, Width } from '@ephox/sugar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { RawEditorSettings } from 'tinymce/core/api/SettingsTypes';
import Plugin from 'tinymce/plugins/table/Plugin';

describe('browser.tinymce.plugins.table.InsertColumnTableResizeTest', () => {
  /**
   * Test the width of tables before and after column operations
   * There is a 2 pixel delta allowed from the expected width, to account for table borders
   */

  before(() => {
    Plugin();
  });

  const pCreateEditor = (settings: RawEditorSettings) => McEditor.pFromSettings<Editor>({
    ...settings,
    plugins: 'table',
    base_url: '/project/tinymce/js/tinymce',
  });

  const getTableWidth = (editor: Editor) =>
    SelectorFind.child<HTMLTableElement>(TinyDom.body(editor), 'table').map((table) => Width.get(table)).getOrDie();

  // TODO: colspan
  context('Responsive table', () => {
    context('table_column_resizing=preservetable', () => {
      it('will resize table because responsive tables cannot honour this setting', async () => {
        const editor = await pCreateEditor({
          table_sizing_mode: 'responsive',
          table_column_resizing: 'preservetable',
        });
        editor.setContent(`
          <table>
            <tbody>
              <tr>
                <td></td>
                <td data-mce-selected="1"></td>
              </tr>
              <tr>
                <td></td>
                <td></td>
              </tr>
            </tbody>
          </table>
        `);
        const beforeWidth = getTableWidth(editor);
        editor.selection.select(editor.dom.select('td[data-mce-selected]')[0], true);
        editor.execCommand('mceTableInsertColAfter');
        const afterWidth = getTableWidth(editor);
        assert.closeTo(afterWidth, beforeWidth * 1.5, 2);
        McEditor.remove(editor);
      });

      it('will resize when inserting multiple columns', async () => {
        const editor = await pCreateEditor({
          table_sizing_mode: 'responsive',
          table_column_resizing: 'preservetable',
        });
        editor.setContent(`
          <table>
            <tbody>
              <tr>
                <td data-mce-selected="1" data-mce-first-selected="1"></td>
                <td data-mce-selected="1" data-mce-last-selected="1"></td>
              </tr>
              <tr>
                <td></td>
                <td></td>
              </tr>
            </tbody>
          </table>
        `);
        const beforeWidth = getTableWidth(editor);
        editor.selection.select(editor.dom.select('td[data-mce-selected]')[0], true);
        editor.execCommand('mceTableInsertColAfter');
        const afterWidth = getTableWidth(editor);
        assert.closeTo(afterWidth, beforeWidth * 2, 2);
        McEditor.remove(editor);
      });

      it('will function with a colgroup', async () => {
        const editor = await pCreateEditor({
          table_sizing_mode: 'responsive',
          table_column_resizing: 'preservetable',
        });
        editor.setContent(`
          <table>
            <colgroup>
              <col>
              <col>
            </colgroup>
            <tbody>
              <tr>
                <td data-mce-selected="1" data-mce-first-selected="1"></td>
                <td data-mce-selected="1" data-mce-last-selected="1"></td>
              </tr>
              <tr>
                <td></td>
                <td></td>
              </tr>
            </tbody>
          </table>
        `);
        const beforeWidth = getTableWidth(editor);
        editor.selection.select(editor.dom.select('td[data-mce-selected]')[0], true);
        editor.execCommand('mceTableInsertColAfter');
        const afterWidth = getTableWidth(editor);
        assert.closeTo(afterWidth, beforeWidth * 2, 2);
        McEditor.remove(editor);
      });
    });

    context('table_column_resizing=resizetable', () => {
      it('should resize table when inserting a column', async () => {
        const editor = await pCreateEditor({
          table_sizing_mode: 'responsive',
          table_column_resizing: 'resizetable',
        });
        editor.setContent(`
          <table>
            <tbody>
              <tr>
                <td></td>
                <td data-mce-selected="1"></td>
              </tr>
              <tr>
                <td></td>
                <td></td>
              </tr>
            </tbody>
          </table>
        `);
        const beforeWidth = getTableWidth(editor);
        editor.selection.select(editor.dom.select('td[data-mce-selected]')[0], true);
        editor.execCommand('mceTableInsertColAfter');
        const afterWidth = getTableWidth(editor);
        assert.closeTo(afterWidth, beforeWidth * 1.5, 2);
        McEditor.remove(editor);
      });

      it('will resize when inserting multiple columns', async () => {
        const editor = await pCreateEditor({
          table_sizing_mode: 'responsive',
          table_column_resizing: 'resizetable',
        });
        editor.setContent(`
          <table>
            <tbody>
              <tr>
                <td data-mce-selected="1" data-mce-first-selected="1"></td>
                <td data-mce-selected="1" data-mce-last-selected="1"></td>
              </tr>
              <tr>
                <td></td>
                <td></td>
              </tr>
            </tbody>
          </table>
        `);
        const beforeWidth = getTableWidth(editor);
        editor.selection.select(editor.dom.select('td[data-mce-selected]')[0], true);
        editor.execCommand('mceTableInsertColAfter');
        const afterWidth = getTableWidth(editor);
        assert.closeTo(afterWidth, beforeWidth * 2, 2);
        McEditor.remove(editor);
      });

      it('will function with a colgroup', async () => {
        const editor = await pCreateEditor({
          table_sizing_mode: 'responsive',
          table_column_resizing: 'resizetable',
        });
        editor.setContent(`
          <table>
            <colgroup>
              <col>
              <col>
            </colgroup>
            <tbody>
              <tr>
                <td data-mce-selected="1" data-mce-first-selected="1"></td>
                <td data-mce-selected="1" data-mce-last-selected="1"></td>
              </tr>
              <tr>
                <td></td>
                <td></td>
              </tr>
            </tbody>
          </table>
        `);
        const beforeWidth = getTableWidth(editor);
        editor.selection.select(editor.dom.select('td[data-mce-selected]')[0], true);
        editor.execCommand('mceTableInsertColAfter');
        const afterWidth = getTableWidth(editor);
        assert.closeTo(afterWidth, beforeWidth * 2, 2);
        McEditor.remove(editor);
      });
    });
  });

  context('Fixed width table', () => {
    context('table_column_resizing=preservetable', () => {
      it('should preserve table width when inserting a column', async () => {
        const editor = await pCreateEditor({
          table_sizing_mode: 'fixed',
          table_column_resizing: 'preservetable',
        });
        editor.setContent(`
          <table style="width: 455px;">
            <tbody>
              <tr>
                <td style="width: 184.219px;"></td>
                <td data-mce-selected="1" style="width: 242.219px;"></td>
              </tr>
              <tr>
                <td style="width: 184.219px;"></td>
                <td style="width: 242.219px;"></td>
              </tr>
            </tbody>
          </table>
        `);
        const beforeWidth = getTableWidth(editor);
        editor.selection.select(editor.dom.select('td[data-mce-selected]')[0], true);
        editor.execCommand('mceTableInsertColAfter');
        const afterWidth = getTableWidth(editor);
        assert.closeTo(afterWidth, beforeWidth, 2);
        McEditor.remove(editor);
      });

      it('should preserve table width when inserting multiple columns', async () => {
        const editor = await pCreateEditor({
          table_sizing_mode: 'fixed',
          table_column_resizing: 'preservetable',
        });
        editor.setContent(`
          <table style="width: 455px;">
            <tbody>
              <tr>
                <td data-mce-selected="1" data-mce-first-selected="1" style="width: 184.219px;"></td>
                <td data-mce-selected="1" data-mce-last-selected="1" style="width: 242.219px;"></td>
              </tr>
              <tr>
                <td style="width: 184.219px;"></td>
                <td style="width: 242.219px;"></td>
              </tr>
            </tbody>
          </table>
        `);
        const beforeWidth = getTableWidth(editor);
        editor.selection.select(editor.dom.select('td[data-mce-selected]')[0], true);
        editor.execCommand('mceTableInsertColAfter');
        const afterWidth = getTableWidth(editor);
        assert.closeTo(afterWidth, beforeWidth, 2);
        McEditor.remove(editor);
      });

      it('will preserve width with a colgroup', async () => {
        const editor = await pCreateEditor({
          table_sizing_mode: 'fixed',
          table_column_resizing: 'preservetable',
        });
        editor.setContent(`
          <table style="width: 865px;">
            <colgroup>
              <col style="width: 432px;"/>
              <col style="width: 432px;"/>
            </colgroup>
            <tbody>
              <tr>
                <td data-mce-selected="1" data-mce-first-selected="1"></td>
                <td data-mce-selected="1" data-mce-last-selected="1"></td>
              </tr>
              <tr>
                <td></td>
                <td></td>
              </tr>
            </tbody>
          </table>
        `);
        const beforeWidth = getTableWidth(editor);
        editor.selection.select(editor.dom.select('td[data-mce-selected]')[0], true);
        editor.execCommand('mceTableInsertColAfter');
        const afterWidth = getTableWidth(editor);
        assert.closeTo(afterWidth, beforeWidth, 2);
        McEditor.remove(editor);
      });
    });

    context('table_column_resizing=resizetable', () => {
      it('should resize table when inserting a column', async () => {
        const editor = await pCreateEditor({
          table_sizing_mode: 'fixed',
          table_column_resizing: 'resizetable',
        });
        editor.setContent(`
          <table style="width: 674px">
            <tbody>
              <tr>
                <td style="width: 323px;"></td>
                <td data-mce-selected="1" style="width: 322px;"></td>
              </tr>
              <tr>
                <td style="width: 323px;"></td>
                <td style="width: 322px;"></td>
              </tr>
            </tbody>
          </table>
        `);
        const beforeWidth = getTableWidth(editor);
        editor.selection.select(editor.dom.select('td[data-mce-selected]')[0], true);
        editor.execCommand('mceTableInsertColAfter');
        const afterWidth = getTableWidth(editor);
        assert.closeTo(afterWidth, beforeWidth * 1.5, 2);
        McEditor.remove(editor);
      });

      it('should resize table when inserting multiple columns', async () => {
        const editor = await pCreateEditor({
          table_sizing_mode: 'fixed',
          table_column_resizing: 'resizetable',
        });
        editor.setContent(`
          <table style="width: 674px">
            <tbody>
              <tr>
                <td data-mce-selected="1" data-mce-first-selected="1" style="width: 323px;"></td>
                <td data-mce-selected="1" data-mce-last-selected="1" style="width: 322px;"></td>
              </tr>
              <tr>
                <td style="width: 323px;"></td>
                <td style="width: 322px;"></td>
              </tr>
            </tbody>
          </table>
        `);
        const beforeWidth = getTableWidth(editor);
        editor.selection.select(editor.dom.select('td[data-mce-selected]')[0], true);
        editor.execCommand('mceTableInsertColAfter');
        const afterWidth = getTableWidth(editor);
        assert.closeTo(afterWidth, beforeWidth * 2, 2);
        McEditor.remove(editor);
      });

      it('should resize table when using a colgroup', async () => {
        const editor = await pCreateEditor({
          table_sizing_mode: 'fixed',
          table_column_resizing: 'resizetable',
        });
        editor.setContent(`
          <table style="width: 432px;">
            <colgroup>
              <col style="width: 216px;"/>
              <col style="width: 216px;"/>
            </colgroup>
            <tbody>
              <tr>
                <td data-mce-selected="1" data-mce-first-selected="1"></td>
                <td data-mce-selected="1" data-mce-last-selected="1"></td>
              </tr>
              <tr>
                <td></td>
                <td></td>
              </tr>
            </tbody>
          </table>
        `);
        const beforeWidth = getTableWidth(editor);
        editor.selection.select(editor.dom.select('td[data-mce-selected]')[0], true);
        editor.execCommand('mceTableInsertColAfter');
        const afterWidth = getTableWidth(editor);
        assert.closeTo(afterWidth, beforeWidth * 2, 2);
        McEditor.remove(editor);
      });
    });
  });

  context('Relative table', () => {
    context('table_column_resizing=preservetable', () => {
      it('should preserve table width when inserting a column', async () => {
        const editor = await pCreateEditor({
          table_sizing_mode: 'relative',
          table_column_resizing: 'preservetable',
        });
        editor.setContent(`
          <table style="width: 50%;">
            <tbody>
              <tr style="height: 21px;">
                <td style="width: 50.6463%;"></td>
                <td data-mce-selected="1" style="width: 49.3537%;"></td>
              </tr>
              <tr style="height: 22px;">
                <td style="width: 50.6463%;"></td>
                <td style="width: 49.3537%;"></td>
              </tr>
            </tbody>
          </table>
        `);
        const beforeWidth = getTableWidth(editor);
        editor.selection.select(editor.dom.select('td[data-mce-selected]')[0], true);
        editor.execCommand('mceTableInsertColAfter');
        const afterWidth = getTableWidth(editor);
        assert.closeTo(afterWidth, beforeWidth, 2);
        McEditor.remove(editor);
      });

      it('should preserve table width when inserting multiple columns', async () => {
        const editor = await pCreateEditor({
          table_sizing_mode: 'relative',
          table_column_resizing: 'preservetable',
        });
        editor.setContent(`
          <table style="width: 50%;">
            <tbody>
              <tr style="height: 21px;">
                <td data-mce-selected="1" data-mce-first-selected="1" style="width: 50.6463%;"></td>
                <td data-mce-selected="1" data-mce-last-selected="1" style="width: 49.3537%;"></td>
              </tr>
              <tr style="height: 22px;">
                <td style="width: 50.6463%;"></td>
                <td style="width: 49.3537%;"></td>
              </tr>
            </tbody>
          </table>
        `);
        const beforeWidth = getTableWidth(editor);
        editor.selection.select(editor.dom.select('td[data-mce-selected]')[0], true);
        editor.execCommand('mceTableInsertColAfter');
        const afterWidth = getTableWidth(editor);
        assert.closeTo(afterWidth, beforeWidth, 2);
        McEditor.remove(editor);
      });

      it('should preserve table width when using a colgroup', async () => {
        const editor = await pCreateEditor({
          table_sizing_mode: 'relative',
          table_column_resizing: 'preservetable',
        });
        editor.setContent(`
          <table style="width: 57.8035%;">
            <colgroup>
              <col style="width: 49.9422%;"/>
              <col style="width: 49.9422%;"/>
            </colgroup>
            <tbody>
              <tr>
                <td data-mce-selected="1" data-mce-first-selected="1"></td>
                <td data-mce-selected="1" data-mce-last-selected="1"></td>
              </tr>
              <tr>
                <td></td>
                <td></td>
              </tr>
            </tbody>
          </table>
        `);
        const beforeWidth = getTableWidth(editor);
        editor.selection.select(editor.dom.select('td[data-mce-selected]')[0], true);
        editor.execCommand('mceTableInsertColAfter');
        const afterWidth = getTableWidth(editor);
        assert.closeTo(afterWidth, beforeWidth, 2);
        McEditor.remove(editor);
      });
    });

    context('table_column_resizing=resizetable', () => {
      it('should should resize table when inserting a column', async () => {
        const editor = await pCreateEditor({
          table_sizing_mode: 'relative',
          table_column_resizing: 'resizetable',
        });
        editor.setContent(`
          <table width: 33.3433%; border="1">
            <tbody>
              <tr>
                <td style="width: 47.0386%;"></td>
                <td data-mce-selected="1" style="width: 47.9985%;"></td>
              </tr>
              <tr>
                <td style="width: 47.0386%;"></td>
                <td style="width: 47.9985%;"></td>
              </tr>
            </tbody>
          </table>
        `);
        const beforeWidth = getTableWidth(editor);
        editor.selection.select(editor.dom.select('td[data-mce-selected]')[0], true);
        editor.execCommand('mceTableInsertColAfter');
        const afterWidth = getTableWidth(editor);
        assert.closeTo(afterWidth, beforeWidth * 1.5, 2);
        McEditor.remove(editor);
      });

      it('should should resize table when inserting multiple columns', async () => {
        const editor = await pCreateEditor({
          table_sizing_mode: 'relative',
          table_column_resizing: 'resizetable',
        });
        editor.setContent(`
          <table width: 33.3433%; border="1">
            <tbody>
              <tr>
                <td data-mce-selected="1" data-mce-first-selected="1" style="width: 47.0386%;"></td>
                <td data-mce-selected="1" data-mce-last-selected="1" style="width: 47.9985%;"></td>
              </tr>
              <tr>
                <td style="width: 47.0386%;"></td>
                <td style="width: 47.9985%;"></td>
              </tr>
            </tbody>
          </table>
        `);
        const beforeWidth = getTableWidth(editor);
        editor.selection.select(editor.dom.select('td[data-mce-selected]')[0], true);
        editor.execCommand('mceTableInsertColAfter');
        const afterWidth = getTableWidth(editor);
        assert.closeTo(afterWidth, beforeWidth * 2, 2);
        McEditor.remove(editor);
      });

      it('should should resize table when using a colgroup', async () => {
        const editor = await pCreateEditor({
          table_sizing_mode: 'relative',
          table_column_resizing: 'resizetable',
        });
        editor.setContent(`
          <table style="width: 57.8035%;">
            <colgroup>
              <col style="width: 49.9422%;"/>
              <col style="width: 49.9422%;"/>
            </colgroup>
            <tbody>
              <tr>
                <td data-mce-selected="1" data-mce-first-selected="1"></td>
                <td data-mce-selected="1" data-mce-last-selected="1"></td>
              </tr>
              <tr>
                <td></td>
                <td></td>
              </tr>
            </tbody>
          </table>
        `);
        const beforeWidth = getTableWidth(editor);
        editor.selection.select(editor.dom.select('td[data-mce-selected]')[0], true);
        editor.execCommand('mceTableInsertColAfter');
        const afterWidth = getTableWidth(editor);
        assert.closeTo(afterWidth, beforeWidth * 2, 2);
        McEditor.remove(editor);
      });
    });
  });
});
