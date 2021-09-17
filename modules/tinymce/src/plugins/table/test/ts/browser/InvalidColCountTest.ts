import { UiFinder } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Arr, Type } from '@ephox/katamari';
import { TinyAssertions, TinyDom, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/table/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.plugins.table.InvalidColCountTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'table',
    base_url: '/project/tinymce/js/tinymce',
  }, [ Plugin, Theme ], true);

  const assertBasicTablePresence = (editor: Editor, tdCount: number, colCount?: number) => {
    TinyAssertions.assertContentPresence(editor, {
      td: tdCount,
    });

    if (Type.isNonNullable(colCount)) {
      const cols = UiFinder.findAllIn(TinyDom.body(editor), 'col');
      assert.lengthOf(cols, colCount);
    }
  };

  // Note: The goal of these tests is to make sure an exception is not thrown and each table operation works
  // when there are less or more col elements than actual columns
  Arr.each([
    {
      label: 'less cols',
      colgroupHtml: '<colgroup><col /></colgroup>',
      assertColCount: true
    },
    {
      label: 'less cols with span',
      colgroupHtml: '<colgroup><col span="2" /></colgroup>',
    },
    {
      label: 'more cols',
      colgroupHtml: '<colgroup><col /><col /><col /><col /></colgroup>',
      assertColCount: true
    },
    {
      label: 'more cols with span at beginning',
      colgroupHtml: '<colgroup><col span="3" /><col /></colgroup>',
    },
    {
      label: 'more cols with span at end',
      colgroupHtml: '<colgroup><col /><col span="3" /></colgroup>',
    },
    {
      label: 'single col with span greater than cells',
      colgroupHtml: '<colgroup><col span="4" /></colgroup>',
    }
  ], (scenario) => {
    context(scenario.label, () => {
      const tableHtml = '<table>' +
        scenario.colgroupHtml +
        '<tbody>' +
        '<tr><td>1</td><td>2</td><td>3</td></tr>' +
        '<tr><td>4</td><td>5</td><td>6</td></tr>' +
        '</tbody>' +
        '</table>';

      const assertCount = scenario.assertColCount === true;
      const countAfterInsertColumn = assertCount ? 4 : undefined;
      const countAfterDeleteColumn = assertCount ? 2 : undefined;
      const countAfterNonColumnAction = assertCount ? 3 : undefined;

      it('TINY-7041: insert new column at the start of the table', () => {
        const editor = hook.editor();
        editor.setContent(tableHtml);
        TinySelections.setCursor(editor, [ 0, 1, 0, 0, 0 ], 0);
        editor.execCommand('mceTableInsertColBefore');
        assertBasicTablePresence(editor, 8, countAfterInsertColumn);
      });

      it('TINY-7041: insert new column in the middle of the table from first column', () => {
        const editor = hook.editor();
        editor.setContent(tableHtml);
        TinySelections.setCursor(editor, [ 0, 1, 0, 0, 0 ], 0);
        editor.execCommand('mceTableInsertColAfter');
        assertBasicTablePresence(editor, 8, countAfterInsertColumn);
      });

      it('TINY-7041: insert new column in the middle of the table from last column', () => {
        const editor = hook.editor();
        editor.setContent(tableHtml);
        TinySelections.setCursor(editor, [ 0, 1, 0, 2, 0 ], 0);
        editor.execCommand('mceTableInsertColBefore');
        assertBasicTablePresence(editor, 8, countAfterInsertColumn);
      });

      it('TINY-7041: insert new column at the end of the table', () => {
        const editor = hook.editor();
        editor.setContent(tableHtml);
        TinySelections.setCursor(editor, [ 0, 1, 0, 2, 0 ], 0);
        editor.execCommand('mceTableInsertColAfter');
        assertBasicTablePresence(editor, 8, countAfterInsertColumn);
      });

      it('TINY-7041: insert new row', () => {
        const editor = hook.editor();
        editor.setContent(tableHtml);
        TinySelections.setCursor(editor, [ 0, 1, 0, 0, 0 ], 0);
        editor.execCommand('mceTableInsertRowAfter');
        assertBasicTablePresence(editor, 9, countAfterNonColumnAction);
      });

      it('TINY-7041: delete first column in the table', () => {
        const editor = hook.editor();
        editor.setContent(tableHtml);
        TinySelections.setCursor(editor, [ 0, 1, 0, 0, 0 ], 0);
        editor.execCommand('mceTableDeleteCol');
        assertBasicTablePresence(editor, 4, countAfterDeleteColumn);
      });

      it('TINY-7041: delete last column in the table', () => {
        const editor = hook.editor();
        editor.setContent(tableHtml);
        TinySelections.setCursor(editor, [ 0, 1, 0, 2, 0 ], 0);
        editor.execCommand('mceTableDeleteCol');
        assertBasicTablePresence(editor, 4, countAfterDeleteColumn);
      });
    });
  });
});
