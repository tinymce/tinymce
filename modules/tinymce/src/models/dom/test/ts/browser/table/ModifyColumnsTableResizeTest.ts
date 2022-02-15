import { context, describe, it } from '@ephox/bedrock-client';
import { SelectorFind, Width } from '@ephox/sugar';
import { TinyAssertions, TinyDom, TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

interface TableCommandMap {
  readonly mceTableInsertColBefore: number;
  readonly mceTableInsertColAfter: number;
  readonly mceTableDeleteCol: number;
}

describe('browser.tinymce.models.dom.table.ModifyColumnsTableResizeTest', () => {
  /**
   * Test the width of tables before and after column operations
   * There is a 2 pixel delta allowed from the expected width, to account for table borders
   */

  const baseSettings = {
    base_url: '/project/tinymce/js/tinymce',
  };

  const getTableWidth = (editor: Editor) =>
    SelectorFind.child<HTMLTableElement>(TinyDom.body(editor), 'table').map(Width.get).getOrDie();

  const assertWidth = (editor: Editor, multiplier: number, command: string) => {
    const beforeWidth = getTableWidth(editor);
    editor.selection.select(editor.dom.select('td[data-mce-selected]')[0], true);
    editor.execCommand(command);
    if (multiplier === 0) {
      TinyAssertions.assertContent(editor, '');
    } else {
      const afterWidth = getTableWidth(editor);
      assert.approximately(afterWidth, beforeWidth * multiplier, 2, 'Assert table width');
    }
  };

  const performCommandsAndAssertWidths = (editor: Editor, content: string, multipliers: TableCommandMap) => {
    editor.setContent(content);
    assertWidth(editor, multipliers.mceTableInsertColBefore, 'mceTableInsertColBefore');
    editor.setContent(content);
    assertWidth(editor, multipliers.mceTableInsertColAfter, 'mceTableInsertColAfter');
    editor.setContent(content);
    assertWidth(editor, multipliers.mceTableDeleteCol, 'mceTableDeleteCol');
  };

  // TODO: more complex tests for colspan #TINY-6949
  context('Responsive table', () => {
    context('table_column_resizing=preservetable', () => {
      const hook = TinyHooks.bddSetupLight<Editor>({
        ...baseSettings,
        table_sizing_mode: 'responsive',
        table_column_resizing: 'preservetable',
      }, []);

      it('TINY-6711: will resize table because responsive tables cannot honour this setting', () => {
        const editor = hook.editor();
        const content = (
          `<table>
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
          </table>`
        );
        performCommandsAndAssertWidths(editor, content, {
          mceTableInsertColBefore: 1.5,
          mceTableInsertColAfter: 1.5,
          mceTableDeleteCol: 0.5
        });
      });

      it('TINY-6711: will resize when inserting multiple columns', () => {
        const editor = hook.editor();
        const content = (`
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
        performCommandsAndAssertWidths(editor, content, {
          mceTableInsertColBefore: 2,
          mceTableInsertColAfter: 2,
          mceTableDeleteCol: 0
        });
      });

      it('TINY-6711: will function with a colgroup', () => {
        const editor = hook.editor();
        const content = (`
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
        performCommandsAndAssertWidths(editor, content, {
          mceTableInsertColBefore: 2,
          mceTableInsertColAfter: 2,
          mceTableDeleteCol: 0
        });
      });

      it('TINY-6711: will function with a colspan', () => {
        const editor = hook.editor();
        const content = (`
          <table>
            <tbody>
              <tr>
                <td data-mce-selected="1" colspan="2"></td>
              </tr>
              <tr>
                <td></td>
                <td></td>
              </tr>
            </tbody>
          </table>
        `);
        performCommandsAndAssertWidths(editor, content, {
          mceTableInsertColBefore: 1.5,
          mceTableInsertColAfter: 1.5,
          mceTableDeleteCol: 0.5
        });
      });
    });

    context('table_column_resizing=resizetable', () => {
      const hook = TinyHooks.bddSetupLight<Editor>({
        ...baseSettings,
        table_sizing_mode: 'responsive',
        table_column_resizing: 'resizetable',
      }, []);

      it('TINY-6711: should resize table when inserting a column', () => {
        const editor = hook.editor();
        const content = (`
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
        performCommandsAndAssertWidths(editor, content, {
          mceTableInsertColBefore: 1.5,
          mceTableInsertColAfter: 1.5,
          mceTableDeleteCol: 0.5
        });
      });

      it('TINY-6711: will resize when inserting multiple columns', () => {
        const editor = hook.editor();
        const content = (`
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
        performCommandsAndAssertWidths(editor, content, {
          mceTableInsertColBefore: 2,
          mceTableInsertColAfter: 2,
          mceTableDeleteCol: 0
        });
      });

      it('TINY-6711: will function with a colgroup', () => {
        const editor = hook.editor();
        const content = (`
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
        performCommandsAndAssertWidths(editor, content, {
          mceTableInsertColBefore: 2,
          mceTableInsertColAfter: 2,
          mceTableDeleteCol: 0
        });
      });

      it('TINY-6711: will function with a colspan', () => {
        const editor = hook.editor();
        const content = (`
          <table>
            <colgroup>
              <col>
              <col>
            </colgroup>
            <tbody>
              <tr>
                <td data-mce-selected="1" colspan="2"></td>
              </tr>
              <tr>
                <td></td>
                <td></td>
              </tr>
            </tbody>
          </table>
        `);
        performCommandsAndAssertWidths(editor, content, {
          mceTableInsertColBefore: 1.5,
          mceTableInsertColAfter: 1.5,
          mceTableDeleteCol: 0.5
        });
      });
    });
  });

  context('Fixed width table', () => {
    context('table_column_resizing=preservetable', () => {
      const hook = TinyHooks.bddSetupLight<Editor>({
        ...baseSettings,
        table_sizing_mode: 'fixed',
        table_column_resizing: 'preservetable',
      }, []);

      it('TINY-6711: should preserve table width when inserting a column', () => {
        const editor = hook.editor();
        const content = (`
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
        performCommandsAndAssertWidths(editor, content, {
          mceTableInsertColBefore: 1,
          mceTableInsertColAfter: 1,
          mceTableDeleteCol: 1
        });
      });

      it('TINY-6711: should preserve table width when inserting multiple columns', () => {
        const editor = hook.editor();
        const content = (`
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
        performCommandsAndAssertWidths(editor, content, {
          mceTableInsertColBefore: 1,
          mceTableInsertColAfter: 1,
          mceTableDeleteCol: 0
        });
      });

      it('TINY-6711: will preserve width with a colgroup', () => {
        const editor = hook.editor();
        const content = (`
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
        performCommandsAndAssertWidths(editor, content, {
          mceTableInsertColBefore: 1,
          mceTableInsertColAfter: 1,
          mceTableDeleteCol: 0
        });
      });

      it('TINY-6711: will preserve width with a colspan', () => {
        const editor = hook.editor();
        const content = (`
          <table style="width: 455px;">
            <tbody>
              <tr>
                <td data-mce-selected="1" style="width: 440.219px;" colspan="2"></td>
              </tr>
              <tr>
                <td style="width: 184.219px;"></td>
                <td style="width: 242.219px;"></td>
              </tr>
            </tbody>
          </table>
        `);
        performCommandsAndAssertWidths(editor, content, {
          mceTableInsertColBefore: 1,
          mceTableInsertColAfter: 1,
          mceTableDeleteCol: 1
        });
      });
    });

    context('table_column_resizing=resizetable', () => {
      const hook = TinyHooks.bddSetupLight<Editor>({
        ...baseSettings,
        table_sizing_mode: 'fixed',
        table_column_resizing: 'resizetable',
      }, []);

      it('TINY-6711: should resize table when inserting a column', () => {
        const editor = hook.editor();
        const content = (`
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
        performCommandsAndAssertWidths(editor, content, {
          mceTableInsertColBefore: 1.5,
          mceTableInsertColAfter: 1.5,
          mceTableDeleteCol: 0.5
        });
      });

      it('TINY-6711: should resize table when inserting multiple columns', () => {
        const editor = hook.editor();
        const content = (`
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
        performCommandsAndAssertWidths(editor, content, {
          mceTableInsertColBefore: 2,
          mceTableInsertColAfter: 2,
          mceTableDeleteCol: 0
        });
      });

      it('TINY-6711: should resize table when using a colgroup', () => {
        const editor = hook.editor();
        const content = (`
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
        performCommandsAndAssertWidths(editor, content, {
          mceTableInsertColBefore: 2,
          mceTableInsertColAfter: 2,
          mceTableDeleteCol: 0
        });
      });

      it('TINY-6711: should resize table by single column width with a colspan', () => {
        const editor = hook.editor();
        const content = (`
          <table style="width: 455px;">
            <tbody>
              <tr>
                <td data-mce-selected="1" style="width: 440.219px;" colspan="2"></td>
              </tr>
              <tr>
                <td style="width: 184.219px;"></td>
                <td style="width: 242.219px;"></td>
              </tr>
            </tbody>
          </table>
        `);
        performCommandsAndAssertWidths(editor, content, {
          // 184/(184+242) === 0.432 so the table should be adjusted by 43.2%
          mceTableInsertColBefore: 1.432,
          mceTableInsertColAfter: 1.432,
          mceTableDeleteCol: 0.568
        });
      });
    });
  });

  context('Relative table', () => {
    context('table_column_resizing=preservetable', () => {
      const hook = TinyHooks.bddSetupLight<Editor>({
        ...baseSettings,
        table_sizing_mode: 'relative',
        table_column_resizing: 'preservetable',
      }, []);

      it('TINY-6711: should preserve table width when inserting a column', () => {
        const editor = hook.editor();
        const content = (`
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
        performCommandsAndAssertWidths(editor, content, {
          mceTableInsertColBefore: 1,
          mceTableInsertColAfter: 1,
          mceTableDeleteCol: 1
        });
      });

      it('TINY-6711: should preserve table width when inserting multiple columns', () => {
        const editor = hook.editor();
        const content = (`
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
        performCommandsAndAssertWidths(editor, content, {
          mceTableInsertColBefore: 1,
          mceTableInsertColAfter: 1,
          mceTableDeleteCol: 0
        });
      });

      it('TINY-6711: should preserve table width when using a colgroup', () => {
        const editor = hook.editor();
        const content = (`
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
        performCommandsAndAssertWidths(editor, content, {
          mceTableInsertColBefore: 1,
          mceTableInsertColAfter: 1,
          mceTableDeleteCol: 0
        });
      });

      it('TINY-6711: should preserve table width when using a colspan', () => {
        const editor = hook.editor();
        const content = (`
          <table style="width: 50%;">
            <tbody>
              <tr style="height: 21px;">
                <td data-mce-selected="1" style="width: 100%;" colspan="2"></td>
              </tr>
              <tr style="height: 22px;">
                <td style="width: 50.6463%;"></td>
                <td style="width: 49.3537%;"></td>
              </tr>
            </tbody>
          </table>
        `);
        performCommandsAndAssertWidths(editor, content, {
          mceTableInsertColBefore: 1,
          mceTableInsertColAfter: 1,
          mceTableDeleteCol: 1
        });
      });
    });

    context('table_column_resizing=resizetable', () => {
      const hook = TinyHooks.bddSetupLight<Editor>({
        ...baseSettings,
        table_sizing_mode: 'relative',
        table_column_resizing: 'resizetable',
      }, []);

      it('TINY-6711: should resize table when inserting a column', () => {
        const editor = hook.editor();
        const content = (`
          <table style="width: 33.3433%;" border="1">
            <tbody>
              <tr>
                <td style="width: 47.4386%;"></td>
                <td data-mce-selected="1" style="width: 47.5985%;"></td>
              </tr>
              <tr>
                <td style="width: 47.4386%;"></td>
                <td style="width: 47.5985%;"></td>
              </tr>
            </tbody>
          </table>
        `);
        performCommandsAndAssertWidths(editor, content, {
          mceTableInsertColBefore: 1.5,
          mceTableInsertColAfter: 1.5,
          mceTableDeleteCol: 0.5
        });
      });

      it('TINY-6711: should resize table when inserting multiple columns', () => {
        const editor = hook.editor();
        const content = (`
          <table style="width: 33.3433%;" border="1">
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
        performCommandsAndAssertWidths(editor, content, {
          mceTableInsertColBefore: 2,
          mceTableInsertColAfter: 2,
          mceTableDeleteCol: 0
        });
      });

      it('TINY-6711: should resize table when using a colgroup', () => {
        const editor = hook.editor();
        const content = (`
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
        performCommandsAndAssertWidths(editor, content, {
          mceTableInsertColBefore: 2,
          mceTableInsertColAfter: 2,
          mceTableDeleteCol: 0
        });
      });

      it('TINY-6711: should resize table width when using a colspan', () => {
        const editor = hook.editor();
        const content = (`
          <table style="width: 33.3433%;" border="1">
            <tbody>
              <tr>
                <td data-mce-selected="1" style="width: 95.0371%;" colspan="2"></td>
              </tr>
              <tr>
                <td style="width: 47.4386%;"></td>
                <td style="width: 47.5985%;"></td>
              </tr>
            </tbody>
          </table>
        `);
        performCommandsAndAssertWidths(editor, content, {
          mceTableInsertColBefore: 1.5,
          mceTableInsertColAfter: 1.5,
          mceTableDeleteCol: 0.5
        });
      });
    });
  });
});
