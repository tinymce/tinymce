import { UiFinder } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyDom, TinyHooks } from '@ephox/mcagar';
import { SugarElement } from '@ephox/sugar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { detectHeaderRow, getRowType } from 'tinymce/plugins/table/core/TableSections';
import Plugin from 'tinymce/plugins/table/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.plugins.table.DetectHeaderRowTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'table',
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin, Theme ], true);

  const assertRow = (editor: Editor, selector: string, assertions: (row: SugarElement<HTMLTableRowElement>) => void) => {
    const row = UiFinder.findIn(TinyDom.body(editor), selector).getOrDie();
    assertions(row);
  };

  it('TINY-6007: No header rows', () => {
    const editor = hook.editor();
    editor.setContent(
      '<table>' +
      '<tbody><tr>' +
      '<td>text</td>' +
      '</tr></tbody>' +
      '</table>'
    );
    assertRow(editor, 'tr', (tr) => {
      const rowData = getRowType(editor, tr.dom);
      assert.equal(rowData, 'body', 'Detect as part of the tbody');
    });
  });

  it('TINY-6007: Tbody > tr > th is detected correctly as a header row', () => {
    const editor = hook.editor();
    editor.setContent(
      '<table>' +
      '<tbody><tr>' +
      '<th>text</th>' +
      '</tr></tbody>' +
      '</table>'
    );
    assertRow(editor, 'tr', (tr) => {
      detectHeaderRow(editor, tr.dom).fold(
        () => assert.fail('Row incorrectly detected as not a header row'),
        (rowData) => {
          assert.isFalse(rowData.thead, 'Detect as part of the tbody');
          assert.isTrue(rowData.ths, 'Detect as ths');
        }
      );
    });
  });

  it('TINY-6007: Tbody > tr > ths is detected correctly as a header row', () => {
    const editor = hook.editor();
    editor.setContent(
      '<table>' +
      '<tbody><tr>' +
      '<th>text</th>' +
      '<th>more text</th>' +
      '</tr></tbody>' +
      '</table>'
    );
    assertRow(editor, 'tr', (tr) => {
      const rowData = detectHeaderRow(editor, tr.dom).getOrDie();
      assert.isFalse(rowData.thead, 'Detect as part of the tbody');
      assert.isTrue(rowData.ths, 'Detect as all ths');
    });
  });

  it('TINY-6007: Tbody > tr > td+th is detected correctly as NOT a header row', () => {
    const editor = hook.editor();
    editor.setContent(
      '<table>' +
      '<tbody><tr>' +
      '<td>text</td>' +
      '<th>more text</th>' +
      '</tr></tbody>' +
      '</table>'
    );
    assertRow(editor, 'tr', (tr) => {
      const rowData = getRowType(editor, tr.dom);
      assert.equal(rowData, 'body', 'Detect as part of the tbody');
    });
  });

  it('TINY-6007: Thead > tr > td is detected correctly as a header row', () => {
    const editor = hook.editor();
    editor.setContent(
      '<table>' +
      '<thead><tr class="foo">' +
      '<td>text</td>' +
      '</tr></thead>' +
      '<tbody><tr>' +
      '<td>text</td>' +
      '</tr></tbody>' +
      '</table>'
    );
    assertRow(editor, 'tr.foo', (tr) => {
      const rowData = detectHeaderRow(editor, tr.dom).getOrDie();
      assert.isTrue(rowData.thead, 'Detect as part of the thead');
      assert.isFalse(rowData.ths, 'Detect as td');
    });
  });

  it('TINY-6007: Thead > tr > th is detected correctly as a header row', () => {
    const editor = hook.editor();
    editor.setContent(
      '<table>' +
      '<thead><tr class="foo">' +
      '<th>text</th>' +
      '</tr></thead>' +
      '<tbody><tr>' +
      '<td>text</td>' +
      '</tr></tbody>' +
      '</table>'
    );
    assertRow(editor, 'tr.foo', (tr) => {
      const rowData = detectHeaderRow(editor, tr.dom).getOrDie();
      assert.isTrue(rowData.thead, 'Detect as part of the thead');
      assert.isTrue(rowData.ths, 'Detect as all th');
    });
  });

  it('TINY-6007: Thead > tr > ths is detected correctly as a header row', () => {
    const editor = hook.editor();
    editor.setContent(
      '<table>' +
      '<thead><tr class="foo">' +
      '<th>text</th>' +
      '<th>more text</th>' +
      '</tr></thead>' +
      '<tbody><tr>' +
      '<td>text</td>' +
      '</tr></tbody>' +
      '</table>'
    );
    assertRow(editor, 'tr.foo', (tr) => {
      const rowData = detectHeaderRow(editor, tr.dom).getOrDie();
      assert.isTrue(rowData.thead, 'Detect as part of the thead');
      assert.isTrue(rowData.ths, 'Detect as all th');
    });
  });

  it('TINY-6007: Thead > tr > td+th is detected correctly as a header row', () => {
    const editor = hook.editor();
    editor.setContent(
      '<table>' +
      '<thead><tr class="foo">' +
      '<td>text</td>' +
      '<th>more text</th>' +
      '</tr></thead>' +
      '<tbody><tr>' +
      '<td>text</td>' +
      '</tr></tbody>' +
      '</table>'
    );
    assertRow(editor, 'tr.foo', (tr) => {
      const rowData = detectHeaderRow(editor, tr.dom).getOrDie();
      assert.isTrue(rowData.thead, 'Detect as part of the thead');
      assert.isFalse(rowData.ths, 'Detect as not all th');
    });
  });
});
