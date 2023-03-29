import { Clipboard } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Arr, Optional } from '@ephox/katamari';
import { SugarElement, SugarNode, Traverse } from '@ephox/sugar';
import { LegacyUnit, TinyAssertions, TinyDom, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { TableEventData } from 'tinymce/core/api/EventTypes';
import * as FakeClipboard from 'tinymce/plugins/table/api/Clipboard';
import TablePlugin from 'tinymce/plugins/table/Plugin';

import * as TableTestUtils from '../module/test/TableTestUtils';

describe('browser.tinymce.plugins.table.ClipboardTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'table',
    indent: false,
    valid_styles: {
      '*': 'width,height,vertical-align,text-align,float,border-color,background-color,border,padding,border-spacing,border-collapse'
    },
    base_url: '/project/tinymce/js/tinymce'
  }, [ TablePlugin ], true);

  const cleanTableHtml = (html: string) => html.replace(/<p>(&nbsp;|<br[^>]+>)<\/p>$/, '');

  const selectOne = (editor: Editor, start: string) => {
    const startElm = editor.dom.select(start)[0];

    editor.dispatch('mousedown', { target: startElm, button: 0 } as unknown as MouseEvent);
    editor.dispatch('mouseup', { target: startElm, button: 0 } as unknown as MouseEvent);

    LegacyUnit.setSelection(editor, startElm, 0);
  };

  const selectRangeXY = (editor: Editor, start: string, end: string) => {
    const startElm = editor.dom.select(start)[0];
    const endElm = editor.dom.select(end)[0];

    editor.dispatch('mousedown', { target: startElm, button: 0 } as unknown as MouseEvent);
    editor.dispatch('mouseover', { target: endElm, button: 0 } as unknown as MouseEvent);
    editor.dispatch('mouseup', { target: endElm, button: 0 } as unknown as MouseEvent);

    LegacyUnit.setSelection(editor, endElm, 0);
  };

  it('TBA: selection.getContent with format equal to text', () => {
    const editor = hook.editor();
    editor.setContent(
      '<table>' +
      '<tbody>' +
      '<tr>' +
      '<td>a</td>' +
      '<td>b</td>' +
      '</tr>' +
      '</tbody>' +
      '</table>'
    );

    selectRangeXY(editor, 'table tr td:nth-child(1)', 'table tr td:nth-child(2)');

    assert.equal(editor.selection.getContent({ format: 'text' }), 'ab');
  });

  it('TBA: mceTablePasteRowBefore command', () => {
    const editor = hook.editor();
    editor.setContent(
      '<table>' +
      '<tr><td>1</td><td>2</td></tr>' +
      '<tr><td>2</td><td>3</td></tr>' +
      '<tr><td>3</td><td>4</td></tr>' +
      '</table>'
    );

    selectOne(editor, 'tr:nth-child(1) td');
    editor.execCommand('mceTableCopyRow');
    selectOne(editor, 'tr:nth-child(3) td');
    editor.execCommand('mceTablePasteRowBefore');

    assert.equal(
      cleanTableHtml(editor.getContent()),

      '<table>' +
      '<tbody>' +
      '<tr><td>1</td><td>2</td></tr>' +
      '<tr><td>2</td><td>3</td></tr>' +
      '<tr><td>1</td><td>2</td></tr>' +
      '<tr><td>3</td><td>4</td></tr>' +
      '</tbody>' +
      '</table>'
    );

    selectOne(editor, 'tr:nth-child(3) td');
    editor.execCommand('mceTablePasteRowBefore');

    assert.equal(
      cleanTableHtml(editor.getContent()),

      '<table>' +
      '<tbody>' +
      '<tr><td>1</td><td>2</td></tr>' +
      '<tr><td>2</td><td>3</td></tr>' +
      '<tr><td>1</td><td>2</td></tr>' +
      '<tr><td>1</td><td>2</td></tr>' +
      '<tr><td>3</td><td>4</td></tr>' +
      '</tbody>' +
      '</table>'
    );
  });

  it('TBA: mceTablePasteRowAfter command', () => {
    const editor = hook.editor();
    editor.setContent(
      '<table>' +
      '<tr><td>1</td><td>2</td></tr>' +
      '<tr><td>2</td><td>3</td></tr>' +
      '</table>'
    );

    selectOne(editor, 'tr:nth-child(1) td');
    editor.execCommand('mceTableCopyRow');
    selectOne(editor, 'tr:nth-child(2) td');
    editor.execCommand('mceTablePasteRowAfter');

    assert.equal(
      cleanTableHtml(editor.getContent()),

      '<table>' +
      '<tbody>' +
      '<tr><td>1</td><td>2</td></tr>' +
      '<tr><td>2</td><td>3</td></tr>' +
      '<tr><td>1</td><td>2</td></tr>' +
      '</tbody>' +
      '</table>'
    );

    selectOne(editor, 'tr:nth-child(2) td');
    editor.execCommand('mceTablePasteRowAfter');

    assert.equal(
      cleanTableHtml(editor.getContent()),

      '<table>' +
      '<tbody>' +
      '<tr><td>1</td><td>2</td></tr>' +
      '<tr><td>2</td><td>3</td></tr>' +
      '<tr><td>1</td><td>2</td></tr>' +
      '<tr><td>1</td><td>2</td></tr>' +
      '</tbody>' +
      '</table>'
    );
  });

  it('TBA: mceTablePasteRowAfter command with thead and tfoot', () => {
    const editor = hook.editor();
    editor.setContent(
      '<table>' +
      '<thead>' +
        '<tr><td>Head1</td><td>Head2</td></tr>' +
      '</thead>' +
      '<tbody>' +
        '<tr><td>a</td><td>b</td></tr>' +
        '<tr><td>c</td><td>d</td></tr>' +
      '</tbody>' +
      '<tfoot>' +
        '<tr><td>Foot1</td><td>Foot2</td></tr>' +
      '</tfoot>' +
      '</table>'
    );

    selectOne(editor, 'tbody tr:nth-child(1) td');
    editor.execCommand('mceTableCopyRow');
    selectOne(editor, 'tbody tr:nth-child(2) td');
    editor.execCommand('mceTablePasteRowAfter');

    assert.equal(
      cleanTableHtml(editor.getContent()),

      '<table>' +
      '<thead>' +
        '<tr><td>Head1</td><td>Head2</td></tr>' +
      '</thead>' +
      '<tbody>' +
        '<tr><td>a</td><td>b</td></tr>' +
        '<tr><td>c</td><td>d</td></tr>' +
        '<tr><td>a</td><td>b</td></tr>' +
      '</tbody>' +
      '<tfoot>' +
        '<tr><td>Foot1</td><td>Foot2</td></tr>' +
      '</tfoot>' +
      '</table>'
    );

    selectOne(editor, 'tbody tr:nth-child(2) td');
    editor.execCommand('mceTablePasteRowAfter');

    assert.equal(
      cleanTableHtml(editor.getContent()),

      '<table>' +
      '<thead>' +
        '<tr><td>Head1</td><td>Head2</td></tr>' +
      '</thead>' +
      '<tbody>' +
        '<tr><td>a</td><td>b</td></tr>' +
        '<tr><td>c</td><td>d</td></tr>' +
        '<tr><td>a</td><td>b</td></tr>' +
        '<tr><td>a</td><td>b</td></tr>' +
      '</tbody>' +
      '<tfoot>' +
        '<tr><td>Foot1</td><td>Foot2</td></tr>' +
      '</tfoot>' +
      '</table>'
    );
  });

  it('TBA: mceTablePasteRowAfter from merged row source', () => {
    const editor = hook.editor();
    editor.setContent(
      '<table>' +
      '<tbody>' +
      '<tr><td colspan="2">1 2</td><td rowspan="2">3</td></tr>' +
      '<tr><td>1</td><td>2</td></tr>' +
      '</tbody>' +
      '</table>'
    );

    selectOne(editor, 'tr:nth-child(1) td');
    editor.execCommand('mceTableCopyRow');
    selectOne(editor, 'tr:nth-child(2) td:nth-child(2)');
    editor.execCommand('mceTablePasteRowAfter');

    assert.equal(
      cleanTableHtml(editor.getContent()),

      '<table>' +
      '<tbody>' +
      '<tr><td colspan="2">1 2</td><td rowspan="2">3</td></tr>' +
      '<tr><td>1</td><td>2</td></tr>' +
      '<tr><td colspan="2">1 2</td><td>3</td></tr>' +
      '</tbody>' +
      '</table>'
    );
  });

  it('TBA: mceTablePasteRowAfter from merged row source to merged row target', () => {
    const editor = hook.editor();
    editor.setContent(
      '<table>' +
      '<tbody>' +
      '<tr><td colspan="2">1 2</td><td rowspan="2">3</td></tr>' +
      '<tr><td>1</td><td>2</td></tr>' +
      '</tbody>' +
      '</table>'
    );

    selectOne(editor, 'tr:nth-child(1) td');
    editor.execCommand('mceTableCopyRow');
    selectOne(editor, 'tr:nth-child(1) td');
    editor.execCommand('mceTablePasteRowAfter');

    assert.equal(
      cleanTableHtml(editor.getContent()),

      '<table>' +
      '<tbody>' +
      '<tr><td colspan="2">1 2</td><td>3</td></tr>' +
      '<tr><td colspan="2">1 2</td><td>3</td></tr>' +
      '<tr><td>1</td><td>2</td><td>&nbsp;</td></tr>' +
      '</tbody>' +
      '</table>'
    );
  });

  it('TBA: mceTablePasteRowAfter to wider table', () => {
    const editor = hook.editor();
    editor.setContent(
      '<table>' +
      '<tbody>' +
      '<tr><td>1a</td><td>2a</td><td>3a</td></tr>' +
      '</tbody>' +
      '</table>' +

      '<table>' +
      '<tbody>' +
      '<tr><td>1b</td><td>2b</td><td>3b</td><td>4b</td></tr>' +
      '</tbody>' +
      '</table>'
    );

    selectOne(editor, 'table:nth-child(1) tr:nth-child(1) td');
    editor.execCommand('mceTableCopyRow');

    selectOne(editor, 'table:nth-child(2) td');
    editor.execCommand('mceTablePasteRowAfter');

    assert.equal(
      cleanTableHtml(editor.getContent()),

      '<table>' +
      '<tbody>' +
      '<tr><td>1a</td><td>2a</td><td>3a</td></tr>' +
      '</tbody>' +
      '</table>' +

      '<table>' +
      '<tbody>' +
      '<tr><td>1b</td><td>2b</td><td>3b</td><td>4b</td></tr>' +
      '<tr><td>1a</td><td>2a</td><td>3a</td><td>&nbsp;</td></tr>' +
      '</tbody>' +
      '</table>'
    );
  });

  it('TBA: mceTablePasteRowAfter to narrower table', () => {
    const editor = hook.editor();
    editor.setContent(
      '<table>' +
      '<tbody>' +
      '<tr><td>1a</td><td>2a</td><td>3a</td><td>4a</td><td>5a</td></tr>' +
      '<tr><td>1a</td><td colspan="3">2a</td><td>5a</td></tr>' +
      '</tbody>' +
      '</table>' +

      '<table>' +
      '<tbody>' +
      '<tr><td>1b</td><td>2b</td><td>3b</td></tr>' +
      '</tbody>' +
      '</table>'
    );

    selectRangeXY(editor, 'table:nth-child(1) tr:nth-child(1) td:nth-child(1)', 'table:nth-child(1) tr:nth-child(2) td:nth-child(3)');
    editor.execCommand('mceTableCopyRow');

    selectOne(editor, 'table:nth-child(2) tr td');
    editor.execCommand('mceTablePasteRowAfter');

    assert.equal(
      cleanTableHtml(editor.getContent()),

      '<table>' +
      '<tbody>' +
      '<tr><td>1a</td><td>2a</td><td>3a</td><td>4a</td><td>5a</td></tr>' +
      '<tr><td>1a</td><td colspan="3">2a</td><td>5a</td></tr>' +
      '</tbody>' +
      '</table>' +

      '<table>' +
      '<tbody>' +
      '<tr><td>1b</td><td>2b</td><td>3b</td><td>&nbsp;</td><td>&nbsp;</td></tr>' +
      '<tr><td>1a</td><td>2a</td><td>3a</td><td>4a</td><td>5a</td></tr>' +
      '<tr><td>1a</td><td colspan="3">2a</td><td>5a</td></tr>' +
      '</tbody>' +
      '</table>'
    );
  });

  it('TBA: Copy/paste several rows with multiple rowspans', () => {
    const editor = hook.editor();
    editor.setContent(
      '<table>' +
      '<tbody>' +
      '<tr><td rowspan="2">1</td><td>2</td><td>3</td></tr>' +
      '<tr><td>2</td><td rowspan="3">3</td></tr>' +
      '<tr><td>1</td><td>2</td></tr>' +
      '<tr><td>1</td><td>2</td></tr>' +
      '</tbody>' +
      '</table>'
    );

    selectRangeXY(editor, 'table tr:nth-child(1) td:nth-child(1)', 'table tr:nth-child(3) td:nth-child(2)');
    editor.execCommand('mceTableCopyRow');

    selectOne(editor, 'table tr:nth-child(4) td');
    editor.execCommand('mceTablePasteRowAfter');

    assert.equal(
      cleanTableHtml(editor.getContent()),
      '<table>' +
      '<tbody>' +
      '<tr><td rowspan="2">1</td><td>2</td><td>3</td></tr>' +
      '<tr><td>2</td><td rowspan="3">3</td></tr>' +
      '<tr><td>1</td><td>2</td></tr>' +
      '<tr><td>1</td><td>2</td></tr>' +
      '<tr><td rowspan="2">1</td><td>2</td><td>3</td></tr>' +
      '<tr><td>2</td><td rowspan="2">3</td></tr>' +
      '<tr><td>1</td><td>2</td></tr>' +
      '</tbody>' +
      '</table>'
    );
  });

  it('TBA: row clipboard api', () => {
    const editor = hook.editor();
    editor.setContent(
      '<table>' +
      '<tr><td>1</td><td>2</td></tr>' +
      '<tr><td>2</td><td>3</td></tr>' +
      '</table>'
    );

    LegacyUnit.setSelection(editor, 'tr:nth-child(1) td', 0);
    editor.execCommand('mceTableCopyRow');

    const clipboardRows = FakeClipboard.getRows().getOr([] as SugarElement<HTMLTableRowElement>[]);

    assert.equal(clipboardRows.length, 1);
    assert.isTrue(SugarNode.isTag('tr')(clipboardRows[0]));

    FakeClipboard.setRows(Optional.some(clipboardRows.concat([
      TableTestUtils.createRow([ 'a', 'b' ]),
      TableTestUtils.createRow([ 'c', 'd' ])
    ])));

    LegacyUnit.setSelection(editor, 'tr:nth-child(2) td', 0);
    editor.execCommand('mceTablePasteRowAfter');

    assert.equal(
      cleanTableHtml(editor.getContent()),

      '<table>' +
      '<tbody>' +
      '<tr><td>1</td><td>2</td></tr>' +
      '<tr><td>2</td><td>3</td></tr>' +
      '<tr><td>1</td><td>2</td></tr>' +
      '<tr><td>a</td><td>b</td></tr>' +
      '<tr><td>c</td><td>d</td></tr>' +
      '</tbody>' +
      '</table>'
    );
  });

  it('TINY-6006: mceTablePasteColBefore command', () => {
    const editor = hook.editor();
    editor.setContent(
      '<table>' +
      '<tr><td>1</td><td>2</td><td>3</td></tr>' +
      '<tr><td>2</td><td>3</td><td>4</td></tr>' +
      '</table>'
    );

    selectOne(editor, 'tr td:nth-child(1)');
    editor.execCommand('mceTableCopyCol');
    selectOne(editor, 'tr td:nth-child(3)');
    editor.execCommand('mceTablePasteColBefore');

    assert.equal(
      cleanTableHtml(editor.getContent()),

      '<table>' +
      '<tbody>' +
      '<tr><td>1</td><td>2</td><td>1</td><td>3</td></tr>' +
      '<tr><td>2</td><td>3</td><td>2</td><td>4</td></tr>' +
      '</tbody>' +
      '</table>'
    );
  });

  it('TINY-6006: mceTablePasteColAfter command', () => {
    const editor = hook.editor();
    editor.setContent(
      '<table>' +
      '<tr><td>1</td><td>2</td><td>3</td></tr>' +
      '<tr><td>2</td><td>3</td><td>4</td></tr>' +
      '</table>'
    );

    selectOne(editor, 'tr td:nth-child(2)');
    editor.execCommand('mceTableCopyCol');
    selectOne(editor, 'tr td:nth-child(3)');
    editor.execCommand('mceTablePasteColAfter');

    assert.equal(
      cleanTableHtml(editor.getContent()),

      '<table>' +
      '<tbody>' +
      '<tr><td>1</td><td>2</td><td>3</td><td>2</td></tr>' +
      '<tr><td>2</td><td>3</td><td>4</td><td>3</td></tr>' +
      '</tbody>' +
      '</table>'
    );
  });

  it('TINY-6006: Copy/paste several cols with colspans', () => {
    const editor = hook.editor();
    editor.setContent(
      '<table>' +
      '<tbody>' +
      '<tr><td colspan="2">1</td><td>3</td></tr>' +
      '<tr><td>1</td><td colspan="2">2</td></tr>' +
      '<tr><td>1</td><td>2</td><td>3</td></tr>' +
      '</tbody>' +
      '</table>'
    );

    selectRangeXY(editor, 'table tr:nth-child(1) td:nth-child(1)', 'table tr:nth-child(2) td:nth-child(2)');
    editor.execCommand('mceTableCopyCol');

    selectOne(editor, 'table tr:nth-child(1) td:nth-child(2)');
    editor.execCommand('mceTablePasteColAfter');

    assert.equal(
      cleanTableHtml(editor.getContent()),
      '<table>' +
      '<tbody>' +
      '<tr><td colspan="2">1</td><td>3</td><td colspan="2">1</td><td>3</td></tr>' +
      '<tr><td>1</td><td colspan="2">2</td><td>1</td><td colspan="2">2</td></tr>' +
      '<tr><td>1</td><td>2</td><td>3</td><td>1</td><td>2</td><td>3</td></tr>' +
      '</tbody>' +
      '</table>'
    );
  });

  it('TINY-6006: col clipboard api', () => {
    const editor = hook.editor();
    editor.setContent(
      '<table>' +
      '<tr><td>1</td><td>2</td></tr>' +
      '<tr><td>2</td><td>3</td></tr>' +
      '</table>'
    );

    LegacyUnit.setSelection(editor, 'tr td:nth-child(1)', 0);
    editor.execCommand('mceTableCopyCol');

    const clipboardCols = FakeClipboard.getColumns().getOr([]);

    assert.equal(clipboardCols.length, 2);
    assert.isTrue(SugarNode.isTag('tr')(clipboardCols[0]));
    const cells = Traverse.children(clipboardCols[0]);
    assert.equal(cells.length, 1);
    assert.isTrue(SugarNode.isTag('td')(cells[0]));

    FakeClipboard.setColumns(Optional.some([
      TableTestUtils.createRow([ 'a', 'b' ]),
      TableTestUtils.createRow([ 'c', 'd' ])
    ]));

    LegacyUnit.setSelection(editor, 'tr td:nth-child(2)', 0);
    editor.execCommand('mceTablePasteColAfter');

    assert.equal(
      cleanTableHtml(editor.getContent()),

      '<table>' +
      '<tbody>' +
      '<tr><td>1</td><td>2</td><td>a</td><td>b</td></tr>' +
      '<tr><td>2</td><td>3</td><td>c</td><td>d</td></tr>' +
      '</tbody>' +
      '</table>'
    );
  });

  it('TINY-6684: mceTablePasteColBefore command with colgroups', () => {
    const editor = hook.editor();
    editor.setContent(
      '<table>' +
      '<colgroup><col><col></colgroup>' +
      '<tbody>' +
      '<tr><td>1</td><td>2</td></tr>' +
      '<tr><td>2</td><td>3</td></tr>' +
      '</tbody>' +
      '</table>'
    );

    selectOne(editor, 'tr td:nth-child(2)');
    editor.execCommand('mceTableCopyCol');
    selectOne(editor, 'tr td:nth-child(1)');
    editor.execCommand('mceTablePasteColBefore');

    assert.equal(
      cleanTableHtml(editor.getContent()),

      '<table>' +
      '<colgroup><col><col><col></colgroup>' +
      '<tbody>' +
      '<tr><td>2</td><td>1</td><td>2</td></tr>' +
      '<tr><td>3</td><td>2</td><td>3</td></tr>' +
      '</tbody>' +
      '</table>'
    );
  });

  it('TINY-6684: mceTablePasteColAfter command with colgroups', () => {
    const editor = hook.editor();
    editor.setContent(
      '<table>' +
      '<colgroup><col><col><col></colgroup>' +
      '<tbody>' +
      '<tr><td>1</td><td>2</td><td>3</td></tr>' +
      '<tr><td>2</td><td>3</td><td>4</td></tr>' +
      '</tbody>' +
      '</table>'
    );

    selectOne(editor, 'tr td:nth-child(1)');
    editor.execCommand('mceTableCopyCol');
    selectOne(editor, 'tr td:nth-child(2)');
    editor.execCommand('mceTablePasteColAfter');

    assert.equal(
      cleanTableHtml(editor.getContent()),

      '<table>' +
      '<colgroup><col><col><col><col></colgroup>' +
      '<tbody>' +
      '<tr><td>1</td><td>2</td><td>1</td><td>3</td></tr>' +
      '<tr><td>2</td><td>3</td><td>2</td><td>4</td></tr>' +
      '</tbody>' +
      '</table>'
    );
  });

  it('TINY-6765: mceTablePasteColBefore command with locked columns', () => {
    const editor = hook.editor();
    editor.setContent(
      '<table data-snooker-locked-cols="0">' +
      '<colgroup><col><col></colgroup>' +
      '<tbody>' +
      '<tr><td>1</td><td>2</td></tr>' +
      '<tr><td>2</td><td>3</td></tr>' +
      '</tbody>' +
      '</table>'
    );

    selectRangeXY(editor, 'table tr:nth-child(1) td:nth-child(1)', 'table tr:nth-child(2) td:nth-child(2)');
    // Only the second column should be copied as the first column is locked
    editor.execCommand('mceTableCopyCol');
    selectOne(editor, 'tr td:nth-child(2)');
    editor.execCommand('mceTablePasteColBefore');

    assert.equal(
      cleanTableHtml(editor.getContent()),

      '<table data-snooker-locked-cols="0">' +
      '<colgroup><col><col><col></colgroup>' +
      '<tbody>' +
      '<tr><td>1</td><td>2</td><td>2</td></tr>' +
      '<tr><td>2</td><td>3</td><td>3</td></tr>' +
      '</tbody>' +
      '</table>'
    );
  });

  it('TINY-6765: mceTablePasteColAfter command with locked columns', () => {
    const editor = hook.editor();
    editor.setContent(
      '<table data-snooker-locked-cols="1">' +
      '<colgroup><col><col></colgroup>' +
      '<tbody>' +
      '<tr><td>1</td><td>2</td></tr>' +
      '<tr><td>2</td><td>3</td></tr>' +
      '</tbody>' +
      '</table>'
    );

    selectRangeXY(editor, 'table tr:nth-child(1) td:nth-child(1)', 'table tr:nth-child(2) td:nth-child(2)');
    // Only the first column should be copied as the second column is locked
    editor.execCommand('mceTableCopyCol');
    selectOne(editor, 'tr td:nth-child(1)');
    editor.execCommand('mceTablePasteColAfter');

    assert.equal(
      cleanTableHtml(editor.getContent()),

      '<table data-snooker-locked-cols="2">' +
      '<colgroup><col><col><col></colgroup>' +
      '<tbody>' +
      '<tr><td>1</td><td>1</td><td>2</td></tr>' +
      '<tr><td>2</td><td>2</td><td>3</td></tr>' +
      '</tbody>' +
      '</table>'
    );
  });

  it('TINY-7485: Pasting into a table with a single cells contents selected', () => {
    const editor = hook.editor();
    editor.setContent(
      '<table><tbody>' +
      '<tr><td>A</td><td>B</td></tr>' +
      '<tr><td>C</td><td>D</td></tr>' +
      '</tbody></table>'
    );

    TinySelections.setSelection(editor, [ 0, 0, 0, 1, 0 ], 0, [ 0, 0, 0, 1, 0 ], 1);
    Clipboard.pasteItems(TinyDom.body(editor), {
      'text/html': '<table><tbody>' +
        '<tr><td>A</td><td>B</td></tr>' +
        '<tr><td>C</td><td>D</td></tr>' +
        '</tbody></table>'
    });

    TinyAssertions.assertContent(editor,
      '<table><tbody>' +
      '<tr><td>A</td><td>A</td><td>B</td></tr>' +
      '<tr><td>C</td><td>C</td><td>D</td></tr>' +
      '</tbody></table>'
    );
  });

  it('TINY-7485: Pasting into a table with multiple cells selected should paste into the first cell', () => {
    const editor = hook.editor();
    editor.setContent(
      '<table><tbody>' +
      '<tr><td>A</td><td>B</td><td>&nbsp;</td></tr>' +
      '<tr><td>C</td><td>D</td><td>&nbsp;</td></tr>' +
      '<tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>' +
      '</tbody></table>'
    );

    selectRangeXY(editor, 'table tr:nth-child(2) td:nth-child(2)', 'table tr:nth-child(3) td:nth-child(3)');
    Clipboard.pasteItems(TinyDom.body(editor), {
      'text/html': '<table><tbody>' +
        '<tr><td>A</td><td>B</td></tr>' +
        '<tr><td>C</td><td>D</td></tr>' +
        '</tbody></table>'
    });

    TinyAssertions.assertContent(editor,
      '<table><tbody>' +
      '<tr><td>A</td><td>B</td><td>&nbsp;</td></tr>' +
      '<tr><td>C</td><td>A</td><td>B</td></tr>' +
      '<tr><td>&nbsp;</td><td>C</td><td>D</td></tr>' +
      '</tbody></table>'
    );
  });

  it('TINY-6939: Pasting into a table should fire TableModified event', () => {
    const editor = hook.editor();
    const events: TableEventData[] = [];

    const callback = (e: TableEventData) => {
      events.push({
        structure: e.structure,
        style: e.style,
      });
    };

    editor.on('TableModified', callback);
    editor.setContent(
      '<table><tbody>' +
      '<tr><td>A</td><td>B</td></tr>' +
      '</tbody></table>'
    );

    selectRangeXY(editor, 'table tr td:nth-child(1)', 'table tr td:nth-child(2)');
    Clipboard.pasteItems(TinyDom.body(editor), {
      'text/html': '<table><tbody>' +
        '<tr><td>1</td><td>2</td></tr>' +
        '</tbody></table>'
    });

    assert.deepEqual(events, [{ structure: true, style: true }]);

    editor.off('TableModified', callback);
  });

  it('TINY-8568: should correctly copy and paste colgroup table with complex selection', () => {
    const editor = hook.editor();

    const inputTable = '<table>' +
    '<colgroup><col data-col-id="0"><col data-col-id="1"><col data-col-id="2"><col data-col-id="3"><col data-col-id="4"></colgroup>' +
    '<tbody>' +
    '<tr><td>&nbsp;</td><td>&nbsp;</td><td>a</td><td>&nbsp;</td><td>&nbsp;</td></tr>' +
    '<tr><td>&nbsp;</td><td colspan="2">b</td><td>&nbsp;</td><td>&nbsp;</td></tr>' +
    '<tr><td>&nbsp;</td><td>&nbsp;</td><td colspan="2">c</td><td>&nbsp;</td></tr>' +
    '<tr><td>&nbsp;</td><td>&nbsp;</td><td>d</td><td>&nbsp;</td><td>&nbsp;</td></tr>' +
    '</tbody>' +
    '</table>';

    const expectedTable = '<table>' +
    '<colgroup><col data-col-id="1"><col data-col-id="2"><col data-col-id="3"></colgroup>' +
    '<tbody>' +
    '<tr><td>&nbsp;</td><td>a</td><td>&nbsp;</td></tr>' +
    '<tr><td colspan="2">b</td><td>&nbsp;</td></tr>' +
    '<tr><td>&nbsp;</td><td colspan="2">c</td></tr>' +
    '<tr><td>&nbsp;</td><td>d</td><td>&nbsp;</td></tr>' +
    '</tbody>' +
    '</table>';

    editor.setContent(
      inputTable +
      '<p>&nbsp;</p>'
    );
    selectRangeXY(editor, 'table tr:nth-child(1) td:nth-child(3)', 'table tr:nth-child(4) td:nth-child(3)');

    const dataTransfer = Clipboard.copy(TinyDom.body(editor));
    assert.equal(dataTransfer.getData('text/html'), '<!-- x-tinymce/html -->' + expectedTable);
    TinySelections.setCursor(editor, [ 1, 0 ], 0);
    Clipboard.pasteItems(TinyDom.body(editor), Arr.mapToObject(dataTransfer.types, (type) => dataTransfer.getData(type)));
    TinyAssertions.assertContent(editor, inputTable + expectedTable);
  });
});
