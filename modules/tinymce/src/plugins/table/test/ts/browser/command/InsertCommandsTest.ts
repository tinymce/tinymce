import { context, describe, it } from '@ephox/bedrock-client';
import { LegacyUnit, TinyHooks, TinySelections } from '@ephox/mcagar';
import { assert } from 'chai';
import Editor from 'tinymce/core/api/Editor';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';
import { TableModifiedEvent } from 'tinymce/plugins/table/api/Events';
import Plugin from 'tinymce/plugins/table/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.plugins.table.command.InsertCommandsTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'table',
    indent: false,
    valid_styles: {
      '*': 'height,vertical-align,text-align,float,border-color,background-color,border,padding,border-spacing,border-collapse'
    },
    base_url: '/project/tinymce/js/tinymce',
    setup: (editor: Editor) => {
      editor.on('tablemodified', logEvent);
    }
  }, [ Plugin, Theme ], true);

  const cleanTableHtml = (html: string) =>
    html.replace(/<p>(&nbsp;|<br[^>]+>)<\/p>$/, '');

  let events: Array<EditorEvent<TableModifiedEvent>> = [];
  const logEvent = (event: EditorEvent<TableModifiedEvent>) => {
    events.push(event);
  };

  const execCmdAndAssertEvent = (label: string, editor: Editor, cmdName: string, ui?: boolean, data?: boolean) => {
    assert.lengthOf(events, 0, label + ', events not zero');
    editor.execCommand(cmdName, ui, data);
    assert.lengthOf(events, 1, label + ', events not one');
    assert.equal(events[0].type, 'tablemodified', label + ', event not tablemodified');
    assert.isTrue(events[0].structure, label + ', structure is not true');
    assert.isFalse(events[0].style, label + ', style is not false');
    events = [];
  };

  it('TBA: mceTableInsertColAfter command', () => {
    const editor = hook.editor();
    editor.setContent('<table><tr><td>1</td></tr><tr><td>2</td></tr></table>');
    LegacyUnit.setSelection(editor, 'td', 0);
    execCmdAndAssertEvent('TBA: mceTableInsertColAfter command', editor, 'mceTableInsertColAfter');
    assert.equal(
      cleanTableHtml(editor.getContent()),
      '<table><tbody><tr><td>1</td><td>&nbsp;</td></tr><tr><td>2</td><td>&nbsp;</td></tr></tbody></table>'
    );
  });

  it('TBA: mceTableInsertColAfter command with two selected columns', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = (
      '<table><tr><td data-mce-selected="1">1</td><td data-mce-selected="1">2</td>' +
      '<td>3</td></tr><tr><td>4</td><td>5</td><td>6</td></tr></table>'
    );
    LegacyUnit.setSelection(editor, 'td', 0);
    execCmdAndAssertEvent('TBA: mceTableInsertColAfter command with two selected columns', editor, 'mceTableInsertColAfter');
    assert.equal(
      cleanTableHtml(editor.getContent()),
      '<table><tbody><tr><td>1</td><td>2</td><td>&nbsp;</td><td>&nbsp;</td><td>3</td></tr>' +
      '<tr><td>4</td><td>5</td><td>&nbsp;</td><td>&nbsp;</td><td>6</td></tr></tbody></table>'
    );
  });

  it('TBA: mceTableInsertColBefore command', () => {
    const editor = hook.editor();
    editor.setContent('<table><tr><td>1</td></tr><tr><td>2</td></tr></table>');
    LegacyUnit.setSelection(editor, 'td', 0);
    execCmdAndAssertEvent('TBA: mceTableInsertColBefore command', editor, 'mceTableInsertColBefore');
    assert.equal(
      cleanTableHtml(editor.getContent()),
      '<table><tbody><tr><td>&nbsp;</td><td>1</td></tr><tr><td>&nbsp;</td><td>2</td></tr></tbody></table>'
    );
  });

  it('TBA: mceTableInsertColBefore command with two selected columns', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = (
      '<table><tr><td>1</td><td data-mce-selected="1">2</td><td data-mce-selected="1">3</td>' +
      '</tr><tr><td>4</td><td>5</td><td>6</td></tr></table>'
    );
    LegacyUnit.setSelection(editor, 'td:nth-child(2)', 0);
    execCmdAndAssertEvent('TBA: mceTableInsertColBefore command with two selected columns', editor, 'mceTableInsertColBefore');
    assert.equal(
      cleanTableHtml(editor.getContent()),
      '<table><tbody><tr><td>1</td><td>&nbsp;</td><td>&nbsp;</td><td>2</td><td>3</td>' +
      '</tr><tr><td>4</td><td>&nbsp;</td><td>&nbsp;</td><td>5</td><td>6</td></tr></tbody></table>'
    );
  });

  it('TBA: mceTableInsertRowAfter command', () => {
    const editor = hook.editor();
    editor.setContent('<table><tr><td>1</td><td>2</td></tr></table>');
    LegacyUnit.setSelection(editor, 'td', 0);
    execCmdAndAssertEvent('TBA: mceTableInsertRowAfter command', editor, 'mceTableInsertRowAfter');
    assert.equal(
      cleanTableHtml(editor.getContent()),
      '<table><tbody><tr><td>1</td><td>2</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td></tr></tbody></table>'
    );
  });

  it('TBA: mceTableInsertRowAfter command with two selected rows', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = (
      '<table><tr><td data-mce-selected="1">1</td><td>2</td></tr><tr><td data-mce-selected="1">3</td><td>4</td></tr></table>'
    );
    LegacyUnit.setSelection(editor, 'tr', 0);
    execCmdAndAssertEvent('TBA: mceTableInsertRowAfter command with two selected rows', editor, 'mceTableInsertRowAfter');
    assert.equal(
      cleanTableHtml(editor.getContent()),
      '<table><tbody><tr><td>1</td><td>2</td></tr><tr><td>3</td><td>4</td></tr><tr>' +
      '<td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td></tr></tbody></table>'
    );
  });

  it('TBA: mceTableInsertRowAfter command on merged cells', () => {
    const editor = hook.editor();
    editor.setContent(
      '<table>' +
      '<tr><td>1</td><td>2</td><td>3</td></tr>' +
      '<tr><td>4</td><td colspan="2" rowspan="2">5</td></tr>' +
      '<tr><td>6</td></tr>' +
      '</table>'
    );

    LegacyUnit.setSelection(editor, 'tr:nth-child(2) td', 0);
    execCmdAndAssertEvent('TBA: mceTableInsertRowAfter command on merged cells', editor, 'mceTableInsertRowAfter');

    assert.equal(
      cleanTableHtml(editor.getContent()),

      '<table>' +
      '<tbody>' +
      '<tr><td>1</td><td>2</td><td>3</td></tr>' +
      '<tr><td>4</td><td colspan="2" rowspan="3">5</td></tr>' +
      '<tr><td>&nbsp;</td></tr>' +
      '<tr><td>6</td></tr>' +
      '</tbody>' +
      '</table>'
    );
  });

  it('TBA: mceTableInsertRowBefore command', () => {
    const editor = hook.editor();
    editor.setContent('<table><tr><td>1</td><td>2</td></tr></table>');
    LegacyUnit.setSelection(editor, 'td', 0);
    execCmdAndAssertEvent('TBA: mceTableInsertRowBefore command', editor, 'mceTableInsertRowBefore');
    assert.equal(
      cleanTableHtml(editor.getContent()),
      '<table><tbody><tr><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>1</td><td>2</td></tr></tbody></table>'
    );
  });

  it('TBA: mceTableInsertRowBefore command with two selected rows', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = (
      '<table><tr><td data-mce-selected="1">1</td><td>2</td></tr><tr><td data-mce-selected="1">3</td><td>4</td></tr></table>'
    );
    LegacyUnit.setSelection(editor, 'tr', 0);
    execCmdAndAssertEvent('TBA: mceTableInsertRowBefore command with two selected rows', editor, 'mceTableInsertRowBefore');
    assert.equal(
      cleanTableHtml(editor.getContent()),
      '<table><tbody><tr><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td></tr>' +
      '<tr><td>1</td><td>2</td></tr><tr><td>3</td><td>4</td></tr></tbody></table>'
    );
  });

  context('TINY-7163: Caption can be toggled on and off', () => {
    it('Can be toggled on', () => {
      const editor = hook.editor();
      editor.setContent('<table><tbody><tr><td>1</td><td>2</td></tr></tbody></table>');

      TinySelections.setSelection(editor, [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 1, true);

      execCmdAndAssertEvent('TINY-7163', editor, 'mceTableToggleCaption', false, true);
      assert.equal(
        cleanTableHtml(editor.getContent()),
        '<table><caption>Caption</caption><tbody><tr><td>1</td><td>2</td></tr></tbody></table>'
      );
    });

    it('Can be toggled off', () => {
      const editor = hook.editor();
      editor.setContent('<table><caption>Caption</caption><tbody><tr><td>1</td><td>2</td></tr></tbody></table>');

      TinySelections.setSelection(editor, [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 1, true);

      execCmdAndAssertEvent('TINY-7163', editor, 'mceTableToggleCaption', false, true);
      assert.equal(
        cleanTableHtml(editor.getContent()),
        '<table><tbody><tr><td>1</td><td>2</td></tr></tbody></table>'
      );
    });
  });
});
