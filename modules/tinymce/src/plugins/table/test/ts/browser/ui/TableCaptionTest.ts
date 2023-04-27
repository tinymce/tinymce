import { afterEach, context, describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections, TinyState } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { TableModifiedEvent } from 'tinymce/core/api/EventTypes';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';
import Plugin from 'tinymce/plugins/table/Plugin';

import { assertStructureIsRestoredToDefault, clickOnButton, pClickOnMenuItem, setEditorContentTableAndSelection } from '../../module/test/TableModifiersTestUtils';

describe('browser.tinymce.plugins.table.ui.TableCaptionTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'table',
    indent: false,
    toolbar: 'tablecaption',
    base_url: '/project/tinymce/js/tinymce',
    setup: (editor: Editor) => {
      editor.on('TableModified', logEvent);
    },
    menu: {
      table: { title: 'Table', items: 'tablecaption' },
    },
    menubar: 'table',
  }, [ Plugin ], true);

  let events: Array<EditorEvent<TableModifiedEvent>> = [];
  const logEvent = (event: EditorEvent<TableModifiedEvent>) => {
    events.push(event);
  };

  afterEach(() => {
    events = [];
  });

  const tableCaptionStructureWithCaption = (
    '<table>' +
      '<caption>Caption</caption>' +
      '<tbody>' +
        '<tr>' +
          '<td>Filler</td>' +
        '</tr>' +
      '</tbody>' +
    '</table>'
  );

  const nestedTableCaptionWithCaptionsStructure = (
    '<table>' +
      '<caption>Caption</caption>' +
      '<tbody>' +
        '<tr>' +
          '<td>' +
            '<table>' +
              '<caption>Caption</caption>' +
              '<tbody>' +
                '<tr>' +
                  '<td>Filler</td>' +
                '</tr>' +
              '</tbody>' +
            '</table>' +
          '</td>' +
        '</tr>' +
      '</tbody>' +
    '</table>'
  );

  const nestedTableCaptionStructure = (
    '<table>' +
      '<tbody>' +
        '<tr>' +
          '<td>' +
            '<table>' +
              '<caption>Caption</caption>' +
              '<tbody>' +
                '<tr>' +
                  '<td>Filler</td>' +
                '</tr>' +
              '</tbody>' +
            '</table>' +
          '</td>' +
        '</tr>' +
      '</tbody>' +
    '</table>'
  );

  const toggleCaption = (editor: Editor) => {
    editor.execCommand('mceTableToggleCaption');

    assert.lengthOf(events, 1, 'Command executed successfully');
  };

  const assertTableStructureIsCorrect = (editor: Editor, tableStructure: string) => {
    TinyAssertions.assertContent(editor, tableStructure);
  };

  const setTableCaptionStructureAndSelection = (editor: Editor, structure: string, indexOftbody: number) => {
    editor.setContent(structure);

    TinySelections.setSelection(editor, [ 0, indexOftbody, 0 ], 0, [ 0, indexOftbody, 0 ], 1);
  };

  const pAssertTableCaption = async (toolbar: boolean, addCaption: boolean) => {
    const editor = hook.editor();
    if (addCaption) {
      setEditorContentTableAndSelection(editor, 1, 1);
    } else {
      setTableCaptionStructureAndSelection(editor, tableCaptionStructureWithCaption, 1);
    }

    if (toolbar) {
      clickOnButton(editor, 'Table caption');
    } else {
      await pClickOnMenuItem(editor, 'Table caption');
    }

    if (addCaption) {
      assertTableStructureIsCorrect(editor, tableCaptionStructureWithCaption);
    } else {
      assertStructureIsRestoredToDefault(editor, 1, 1);
    }
  };

  context('Using the command directly', () => {
    it('TINY-7479: The caption should appear', () => {
      const editor = hook.editor();
      setEditorContentTableAndSelection(editor, 1, 1);

      toggleCaption(editor);
      assertTableStructureIsCorrect(editor, tableCaptionStructureWithCaption);
    });

    it('TINY-7479: The caption should be removed', () => {
      const editor = hook.editor();
      setTableCaptionStructureAndSelection(editor, tableCaptionStructureWithCaption, 1);

      toggleCaption(editor);
      assertStructureIsRestoredToDefault(editor, 1, 1);
    });
  });

  context('Using the toolbar button', () => {
    it('TINY-7479: The caption should appear', async () => {
      await pAssertTableCaption(true, true);
    });

    it('TINY-7479: The caption should be removed', async () => {
      await pAssertTableCaption(true, false);
    });
  });

  context('Using the menuitem', () => {
    it('TINY-7479: The caption should appear with the menu', async () => {
      await pAssertTableCaption(false, true);
    });

    it('TINY-7479: The caption should be removed with the menu', async () => {
      await pAssertTableCaption(false, false);
    });
  });

  context('Nested table', () => {
    it('TINY-7479: Add caption to the table', () => {
      const editor = hook.editor();
      setTableCaptionStructureAndSelection(editor, nestedTableCaptionStructure, 0);

      toggleCaption(editor);
      assertTableStructureIsCorrect(editor, nestedTableCaptionWithCaptionsStructure);
    });

    it('TINY-7479: Remove caption from the table', () => {
      const editor = hook.editor();
      setTableCaptionStructureAndSelection(editor, nestedTableCaptionWithCaptionsStructure, 1);

      toggleCaption(editor);
      assertTableStructureIsCorrect(editor, nestedTableCaptionStructure);
    });
  });

  context('noneditable', () => {
    it('TINY-9459: Should not apply mceToggleCaption command on table inside a noneditable div', () => {
      const editor = hook.editor();
      const initalContent = '<div contenteditable="false"><table><tbody><tr><td>cell</td></tr></tbody></table></div>';
      editor.setContent(initalContent);
      TinySelections.setCursor(editor, [ 1, 0, 0, 0, 0, 0 ], 0); // Index off by one due to cef fake caret
      editor.execCommand('mceTableToggleCaption');
      TinyAssertions.assertContent(editor, initalContent);
    });

    it('TINY-9459: Should not apply mceToggleCaption command on table inside a noneditable root', () => {
      TinyState.withNoneditableRootEditor(hook.editor(), (editor) => {
        const initalContent = '<table><tbody><tr><td>cell</td></tr></tbody></table>';
        editor.setContent(initalContent);
        TinySelections.setCursor(editor, [ 0, 0, 0, 0, 0 ], 0);
        editor.execCommand('mceTableToggleCaption');
        TinyAssertions.assertContent(editor, initalContent);
      });
    });
  });
});
