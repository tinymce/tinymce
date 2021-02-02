import { context, describe, it } from '@ephox/bedrock-client';
import { TinyDom, TinyHooks } from '@ephox/mcagar';
import { PlatformDetection } from '@ephox/sand';
import { SelectorFind, Width } from '@ephox/sugar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/table/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.plugins.table.ModifyColumnsTableResizeTest', () => {
  /**
   * Test the width of tables before and after column operations
   * There is a 2 pixel delta allowed from the expected width, to account for table borders
   */

  const baseSettings = {
    plugins: 'table',
    base_url: '/project/tinymce/js/tinymce',
  };

  const platform = PlatformDetection.detect();

  const getTableWidth = (editor: Editor) =>
    SelectorFind.child<HTMLTableElement>(TinyDom.body(editor), 'table').map(Width.get).getOrDie();

  const assertWidth = (editor: Editor, multiplier: number, command: string) => {
    const beforeWidth = getTableWidth(editor);
    editor.selection.select(editor.dom.select('td[data-mce-selected]')[0], true);
    editor.execCommand(command);
    const afterWidth = getTableWidth(editor);
    // 2px margin of error, 30px margin of error for IE
    assert.approximately(afterWidth, beforeWidth * multiplier, platform.browser.isIE() ? 30 : 2);
  };

  interface TableCommandMap {
    readonly mceTableInsertColBefore: number;
    readonly mceTableInsertColAfter: number;
    readonly mceTableDeleteCol: number;
  }

  const performCommandsAndAssertWidths = (editor: Editor, content: string, multipliers: TableCommandMap) => {
    editor.setContent(content);
    assertWidth(editor, multipliers.mceTableInsertColBefore, 'mceTableInsertColBefore');
    editor.setContent(content);
    assertWidth(editor, multipliers.mceTableInsertColAfter, 'mceTableInsertColAfter');
    editor.setContent(content);
    assertWidth(editor, multipliers.mceTableDeleteCol, 'mceTableDeleteCol');
  };

  // TODO: tests for colspan #TINY-6949
  context('Responsive table', () => {
    context('table_column_resizing=preservetable', () => {
      const hook = TinyHooks.bddSetupLight<Editor>({
        ...baseSettings,
        table_sizing_mode: 'responsive',
        table_column_resizing: 'preservetable',
      }, [ Plugin, Theme ]);

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
    });

    context('table_column_resizing=resizetable', () => {
      const hook = TinyHooks.bddSetupLight<Editor>({
        ...baseSettings,
        table_sizing_mode: 'responsive',
        table_column_resizing: 'resizetable',
      }, [ Plugin, Theme ]);

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
    });
  });

  context('Fixed width table', () => {
    context('table_column_resizing=preservetable', () => {
      const hook = TinyHooks.bddSetupLight<Editor>({
        ...baseSettings,
        table_sizing_mode: 'fixed',
        table_column_resizing: 'preservetable',
      }, [ Plugin, Theme ]);

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
          mceTableDeleteCol: 1
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
          mceTableDeleteCol: 1
        });
      });
    });

    context('table_column_resizing=resizetable', () => {
      const hook = TinyHooks.bddSetupLight<Editor>({
        ...baseSettings,
        table_sizing_mode: 'fixed',
        table_column_resizing: 'resizetable',
      }, [ Plugin, Theme ]);

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
    });
  });

  context('Relative table', () => {
    context('table_column_resizing=preservetable', () => {
      const hook = TinyHooks.bddSetupLight<Editor>({
        ...baseSettings,
        table_sizing_mode: 'relative',
        table_column_resizing: 'preservetable',
      }, [ Plugin, Theme ]);

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
    });

    context('table_column_resizing=resizetable', () => {
      const hook = TinyHooks.bddSetupLight<Editor>({
        ...baseSettings,
        table_sizing_mode: 'relative',
        table_column_resizing: 'resizetable',
      }, [ Plugin, Theme ]);

      it('TINY-6711: should should resize table when inserting a column', () => {
        const editor = hook.editor();
        const content = (`
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
        performCommandsAndAssertWidths(editor, content, {
          mceTableInsertColBefore: 1.5,
          mceTableInsertColAfter: 1.5,
          mceTableDeleteCol: 0.5
        });
      });

      it('TINY-6711: should should resize table when inserting multiple columns', () => {
        const editor = hook.editor();
        const content = (`
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
        performCommandsAndAssertWidths(editor, content, {
          mceTableInsertColBefore: 2,
          mceTableInsertColAfter: 2,
          mceTableDeleteCol: 0
        });
      });

      it('TINY-6711: should should resize table when using a colgroup', () => {
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
    });
  });
});
