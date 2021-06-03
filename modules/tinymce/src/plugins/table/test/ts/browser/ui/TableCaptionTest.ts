import { afterEach, context, describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/mcagar';
import { assert } from 'chai';
import Editor from 'tinymce/core/api/Editor';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';
import { TableModifiedEvent } from 'tinymce/plugins/table/api/Events';
import Plugin from 'tinymce/plugins/table/Plugin';
import Theme from 'tinymce/themes/silver/Theme';
import { assertStructureIsRestoredToDefault, clickOnToolbarButton, setEditorContentTableAndSelection } from '../../module/test/TableModifiersTestUtils';

describe('browser.tinymce.plugins.table.ui.TableClassListButtonsTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'table',
    indent: false,
    toolbar: 'tablecaption',
    base_url: '/project/tinymce/js/tinymce',
    setup: (editor: Editor) => {
      editor.on('tablemodified', logEvent);
    }
  }, [ Plugin, Theme ], true);

  let events: Array<EditorEvent<TableModifiedEvent>> = [];
  const logEvent = (event: EditorEvent<TableModifiedEvent>) => {
    events.push(event);
  };

  afterEach(() => {
    events = [];
  });

  const tableCaptionStructure = (
    '<table>' +
      '<caption>Caption</caption>' +
      '<tbody>' +
        '<tr>' +
          '<td>Filler</td>' +
        '</tr>' +
      '</tbody>' +
    '</table>'
  );

  const toggleCaption = (editor: Editor) => {
    editor.execCommand('mceTableToggleCaption');

    assert.lengthOf(events, 1, 'Command executed successfully.');
  };

  const assertTableContainsCaption = (editor: Editor) => {
    TinyAssertions.assertContent(editor, tableCaptionStructure);
  };

  const setTableCaptionStructureAndSelection = (editor: Editor) => {
    editor.setContent(tableCaptionStructure);

    TinySelections.setSelection(editor, [ 0, 1, 0, 0 ], 0, [ 0, 1, 0, 0 ], 1);
  };

  context('Test when using the command directly', () => {
    it('TINY-7476: The caption should appear', () => {
      const editor = hook.editor();

      setEditorContentTableAndSelection(editor, 1, 1);
      toggleCaption(editor);

      assertTableContainsCaption(editor);
    });

    it('TINY-7476: The caption should be removed', () => {
      const editor = hook.editor();

      setTableCaptionStructureAndSelection(editor);
      toggleCaption(editor);

      assertStructureIsRestoredToDefault(editor, 1, 1);
    });
  });

  context('Test when using the button', () => {
    it('TINY-7476: The caption should appear', () => {
      const editor = hook.editor();

      setEditorContentTableAndSelection(editor, 1, 1);
      clickOnToolbarButton(editor, 'Table caption');

      assertTableContainsCaption(editor);
    });

    it('TINY-7476: The caption should be removed', () => {
      const editor = hook.editor();

      setTableCaptionStructureAndSelection(editor);
      clickOnToolbarButton(editor, 'Table caption');

      assertStructureIsRestoredToDefault(editor, 1, 1);
    });
  });
});
