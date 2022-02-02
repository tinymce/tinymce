import { Clipboard } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { LegacyUnit, TinyAssertions, TinyDom, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Tools from 'tinymce/core/api/util/Tools';
import PastePlugin from 'tinymce/plugins/paste/Plugin';
import { TableEventData } from 'tinymce/plugins/table/api/Events';
import TablePlugin from 'tinymce/plugins/table/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.plugins.table.ClipboardTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'paste table',
    indent: false,
    valid_styles: {
      '*': 'width,height,vertical-align,text-align,float,border-color,background-color,border,padding,border-spacing,border-collapse'
    },
    base_url: '/project/tinymce/js/tinymce'
  }, [ PastePlugin, TablePlugin, Theme ], true);

  const cleanTableHtml = (html: string) => html.replace(/<p>(&nbsp;|<br[^>]+>)<\/p>$/, '');

  const selectOne = (editor: Editor, start: string) => {
    const startElm = editor.$(start)[0];

    editor.fire('mousedown', { target: startElm, button: 0 } as unknown as MouseEvent);
    editor.fire('mouseup', { target: startElm, button: 0 } as unknown as MouseEvent);

    LegacyUnit.setSelection(editor, startElm, 0);
  };

  const selectRangeXY = (editor: Editor, start: string, end: string) => {
    const startElm = editor.$(start)[0];
    const endElm = editor.$(end)[0];

    editor.fire('mousedown', { target: startElm, button: 0 } as unknown as MouseEvent);
    editor.fire('mouseover', { target: endElm, button: 0 } as unknown as MouseEvent);
    editor.fire('mouseup', { target: endElm, button: 0 } as unknown as MouseEvent);

    LegacyUnit.setSelection(editor, endElm, 0);
  };

  const createRow = (editor: Editor, cellContents: string[]) => {
    const tr = editor.dom.create('tr');

    Tools.each(cellContents, (html) => {
      tr.appendChild(editor.dom.create('td', null, html));
    });

    return tr;
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

    const clipboardRows = editor.plugins.table.getClipboardRows();

    assert.equal(clipboardRows.length, 1);
    assert.equal(clipboardRows[0].tagName, 'TR');

    editor.plugins.table.setClipboardRows(clipboardRows.concat([
      createRow(editor, [ 'a', 'b' ]),
      createRow(editor, [ 'c', 'd' ])
    ]));

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

    const clipboardCols = editor.plugins.table.getClipboardCols();

    assert.equal(clipboardCols.length, 2);
    assert.equal(clipboardCols[0].tagName, 'TR');
    const cells = clipboardCols[0].childNodes;
    assert.equal(cells.length, 1);
    assert.equal(cells[0].nodeName, 'TD');

    editor.plugins.table.setClipboardCols([
      createRow(editor, [ 'a', 'b' ]),
      createRow(editor, [ 'c', 'd' ])
    ]);

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
      '<colgroup><col /><col /><col /></colgroup>' +
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
      '<colgroup><col /><col /><col /><col /></colgroup>' +
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
      '<colgroup><col /><col /><col /></colgroup>' +
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
      '<colgroup><col /><col /><col /></colgroup>' +
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
});
