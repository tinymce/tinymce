import { context, describe, it } from '@ephox/bedrock-client';
import { LegacyUnit, TinyAssertions, TinyHooks, TinySelections, TinyState } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { TableModifiedEvent } from 'tinymce/core/api/EventTypes';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';

describe('browser.tinymce.models.dom.table.command.InsertCommandsTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    indent: false,
    valid_styles: {
      '*': 'height,vertical-align,text-align,float,border-color,background-color,border,padding,border-spacing,border-collapse'
    },
    base_url: '/project/tinymce/js/tinymce',
    setup: (editor: Editor) => {
      editor.on('TableModified', logEvent);
    }
  }, [], true);

  const cleanTableHtml = (html: string) =>
    html.replace(/<p>(&nbsp;|<br[^>]+>)<\/p>$/, '');

  let events: Array<EditorEvent<TableModifiedEvent>> = [];
  const logEvent = (event: EditorEvent<TableModifiedEvent>) => {
    events.push(event);
  };

  const execCmdAndAssertEvent = (editor: Editor, cmdName: string) => {
    assert.lengthOf(events, 0);
    editor.execCommand(cmdName);
    assert.lengthOf(events, 1);
    assert.equal(events[0].type, 'tablemodified');
    assert.isTrue(events[0].structure);
    assert.isFalse(events[0].style);
    events = [];
  };

  it('TBA: mceTableInsertColAfter command', () => {
    const editor = hook.editor();
    editor.setContent('<table><tr><td>1</td></tr><tr><td>2</td></tr></table>');
    LegacyUnit.setSelection(editor, 'td', 0);
    execCmdAndAssertEvent(editor, 'mceTableInsertColAfter');
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
    execCmdAndAssertEvent(editor, 'mceTableInsertColAfter');
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
    execCmdAndAssertEvent(editor, 'mceTableInsertColBefore');
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
    execCmdAndAssertEvent(editor, 'mceTableInsertColBefore');
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
    execCmdAndAssertEvent(editor, 'mceTableInsertRowAfter');
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
    execCmdAndAssertEvent(editor, 'mceTableInsertRowAfter');
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
    execCmdAndAssertEvent(editor, 'mceTableInsertRowAfter');

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
    execCmdAndAssertEvent(editor, 'mceTableInsertRowBefore');
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
    execCmdAndAssertEvent(editor, 'mceTableInsertRowBefore');
    assert.equal(
      cleanTableHtml(editor.getContent()),
      '<table><tbody><tr><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td></tr>' +
      '<tr><td>1</td><td>2</td></tr><tr><td>3</td><td>4</td></tr></tbody></table>'
    );
  });

  context('Noneditable root', () => {
    const testNoopExecCommand = (cmd: string) => () => {
      TinyState.withNoneditableRootEditor(hook.editor(), (editor) => {
        const initalContent = '<table><tbody><tr><td>cell</td></tr></tbody></table>';
        editor.setContent(initalContent);
        TinySelections.setCursor(editor, [ 0, 0, 0, 0, 0 ], 0);
        editor.execCommand(cmd);
        TinyAssertions.assertContent(editor, initalContent);
      });
    };

    it('TINY-9459: Should not apply mceInsertColBefore command on table in noneditable root', testNoopExecCommand('mceInsertColBefore'));
    it('TINY-9459: Should not apply mceInsertColAfter command on table in noneditable root', testNoopExecCommand('mceInsertColAfter'));
    it('TINY-9459: Should not apply mceInsertRowBefore command on table in noneditable root', testNoopExecCommand('mceInsertRowBefore'));
    it('TINY-9459: Should not apply mceInsertRowAfter command on table in noneditable root', testNoopExecCommand('mceInsertRowAfter'));
  });
});
