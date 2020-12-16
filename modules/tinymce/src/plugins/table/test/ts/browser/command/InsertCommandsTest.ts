import { Log, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { LegacyUnit, TinyLoader } from '@ephox/mcagar';
import Editor from 'tinymce/core/api/Editor';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';

import Plugin from 'tinymce/plugins/table/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.plugins.table.command.InsertCommandsTest', (success, failure) => {
  const suite = LegacyUnit.createSuite<Editor>();

  Plugin();
  SilverTheme();

  const cleanTableHtml = (html: string) => {
    return html.replace(/<p>(&nbsp;|<br[^>]+>)<\/p>$/, '');
  };

  let events = [];
  const logEvent = (event: EditorEvent<{}>) => {
    events.push(event);
  };

  const clearEvents = () => events = [];

  const execCmdAndAssertEvent = (editor: Editor, cmdName: string) => {
    LegacyUnit.equal(events.length, 0);
    editor.execCommand(cmdName);
    LegacyUnit.equal(events.length, 1);
    LegacyUnit.equal(events[0].type, 'tablemodified');
    LegacyUnit.equal(events[0].structure, true);
    LegacyUnit.equal(events[0].style, false);
    clearEvents();
  };

  suite.test('TestCase-TBA: Table: mceTableInsertColAfter command', (editor) => {
    editor.focus();
    editor.setContent('<table><tr><td>1</td></tr><tr><td>2</td></tr></table>');
    LegacyUnit.setSelection(editor, 'td', 0);
    execCmdAndAssertEvent(editor, 'mceTableInsertColAfter');
    LegacyUnit.equal(
      cleanTableHtml(editor.getContent()),
      '<table><tbody><tr><td>1</td><td>&nbsp;</td></tr><tr><td>2</td><td>&nbsp;</td></tr></tbody></table>'
    );
  });

  suite.test('TestCase-TBA: Table: mceTableInsertColAfter command with two selected columns', (editor) => {
    editor.getBody().innerHTML = (
      '<table><tr><td data-mce-selected="1">1</td><td data-mce-selected="1">2</td>' +
      '<td>3</td></tr><tr><td>4</td><td>5</td><td>6</td></tr></table>'
    );
    LegacyUnit.setSelection(editor, 'td', 0);
    execCmdAndAssertEvent(editor, 'mceTableInsertColAfter');
    LegacyUnit.equal(
      cleanTableHtml(editor.getContent()),
      '<table><tbody><tr><td>1</td><td>2</td><td>&nbsp;</td><td>&nbsp;</td><td>3</td></tr>' +
      '<tr><td>4</td><td>5</td><td>&nbsp;</td><td>&nbsp;</td><td>6</td></tr></tbody></table>'
    );
  });

  suite.test('TestCase-TBA: Table: mceTableInsertColBefore command', (editor) => {
    editor.setContent('<table><tr><td>1</td></tr><tr><td>2</td></tr></table>');
    LegacyUnit.setSelection(editor, 'td', 0);
    execCmdAndAssertEvent(editor, 'mceTableInsertColBefore');
    LegacyUnit.equal(
      cleanTableHtml(editor.getContent()),
      '<table><tbody><tr><td>&nbsp;</td><td>1</td></tr><tr><td>&nbsp;</td><td>2</td></tr></tbody></table>'
    );
  });

  suite.test('TestCase-TBA: Table: mceTableInsertColBefore command with two selected columns', (editor) => {
    editor.getBody().innerHTML = (
      '<table><tr><td>1</td><td data-mce-selected="1">2</td><td data-mce-selected="1">3</td>' +
      '</tr><tr><td>4</td><td>5</td><td>6</td></tr></table>'
    );
    LegacyUnit.setSelection(editor, 'td:nth-child(2)', 0);
    execCmdAndAssertEvent(editor, 'mceTableInsertColBefore');
    LegacyUnit.equal(
      cleanTableHtml(editor.getContent()),
      '<table><tbody><tr><td>1</td><td>&nbsp;</td><td>&nbsp;</td><td>2</td><td>3</td>' +
      '</tr><tr><td>4</td><td>&nbsp;</td><td>&nbsp;</td><td>5</td><td>6</td></tr></tbody></table>'
    );
  });

  suite.test('TestCase-TBA: Table: mceTableInsertRowAfter command', (editor) => {
    editor.setContent('<table><tr><td>1</td><td>2</td></tr></table>');
    LegacyUnit.setSelection(editor, 'td', 0);
    execCmdAndAssertEvent(editor, 'mceTableInsertRowAfter');
    LegacyUnit.equal(
      cleanTableHtml(editor.getContent()),
      '<table><tbody><tr><td>1</td><td>2</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td></tr></tbody></table>'
    );
  });

  suite.test('TestCase-TBA: Table: mceTableInsertRowAfter command with two selected rows', (editor) => {
    editor.getBody().innerHTML = (
      '<table><tr><td data-mce-selected="1">1</td><td>2</td></tr><tr><td data-mce-selected="1">3</td><td>4</td></tr></table>'
    );
    LegacyUnit.setSelection(editor, 'tr', 0);
    execCmdAndAssertEvent(editor, 'mceTableInsertRowAfter');
    LegacyUnit.equal(
      cleanTableHtml(editor.getContent()),
      '<table><tbody><tr><td>1</td><td>2</td></tr><tr><td>3</td><td>4</td></tr><tr>' +
      '<td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td></tr></tbody></table>'
    );
  });

  suite.test('TestCase-TBA: Table: mceTableInsertRowAfter command on merged cells', (editor) => {
    editor.setContent(
      '<table>' +
      '<tr><td>1</td><td>2</td><td>3</td></tr>' +
      '<tr><td>4</td><td colspan="2" rowspan="2">5</td></tr>' +
      '<tr><td>6</td></tr>' +
      '</table>'
    );

    LegacyUnit.setSelection(editor, 'tr:nth-child(2) td', 0);
    execCmdAndAssertEvent(editor, 'mceTableInsertRowAfter');

    LegacyUnit.equal(
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

  suite.test('TestCase-TBA: Table: mceTableInsertRowBefore command', (editor) => {
    editor.setContent('<table><tr><td>1</td><td>2</td></tr></table>');
    LegacyUnit.setSelection(editor, 'td', 0);
    execCmdAndAssertEvent(editor, 'mceTableInsertRowBefore');
    LegacyUnit.equal(
      cleanTableHtml(editor.getContent()),
      '<table><tbody><tr><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>1</td><td>2</td></tr></tbody></table>'
    );
  });

  suite.test('TestCase-TBA: Table: mceTableInsertRowBefore command with two selected rows', (editor) => {
    editor.getBody().innerHTML = (
      '<table><tr><td data-mce-selected="1">1</td><td>2</td></tr><tr><td data-mce-selected="1">3</td><td>4</td></tr></table>'
    );
    LegacyUnit.setSelection(editor, 'tr', 0);
    execCmdAndAssertEvent(editor, 'mceTableInsertRowBefore');
    LegacyUnit.equal(
      cleanTableHtml(editor.getContent()),
      '<table><tbody><tr><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td></tr>' +
      '<tr><td>1</td><td>2</td></tr><tr><td>3</td><td>4</td></tr></tbody></table>'
    );
  });

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    Pipeline.async({}, Log.steps('TBA', 'Table: Test insert commands', suite.toSteps(editor)), onSuccess, onFailure);
  }, {
    plugins: 'table',
    indent: false,
    valid_styles: {
      '*': 'height,vertical-align,text-align,float,border-color,background-color,border,padding,border-spacing,border-collapse'
    },
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce',
    setup: (editor: Editor) => {
      editor.on('tablemodified', logEvent);
    }
  }, success, failure);
});
