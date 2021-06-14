import { afterEach, context, describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';
import { TableModifiedEvent } from 'tinymce/plugins/table/api/Events';
import Plugin from 'tinymce/plugins/table/Plugin';
import Theme from 'tinymce/themes/silver/Theme';
import { assertStructureIsRestoredToDefault, clickOnButton, clickOnMenuItem, setEditorContentTableAndSelection } from '../../module/test/TableModifiersTestUtils';

describe('browser.tinymce.plugins.table.ui.TableCaptionTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'table',
    indent: false,
    toolbar: 'tablecaption',
    base_url: '/project/tinymce/js/tinymce',
    setup: (editor: Editor) => {
      editor.on('tablemodified', logEvent);
    },
    menu: {
      table: { title: 'Table', items: 'tablecaption' },
    },
    menubar: 'table',
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

    assert.lengthOf(events, 1, 'Command executed successfully');
  };

  const assertTableContainsCaption = (editor: Editor) => {
    TinyAssertions.assertContent(editor, tableCaptionStructure);
  };

  const setTableCaptionStructureAndSelection = (editor: Editor) => {
    editor.setContent(tableCaptionStructure);

    TinySelections.setSelection(editor, [ 0, 1, 0, 0 ], 0, [ 0, 1, 0, 0 ], 1);
  };

  const pAssertTableCaption = async (toolbar: boolean, addCaption: boolean) => {
    const editor = hook.editor();
    if (addCaption) {
      setEditorContentTableAndSelection(editor, 1, 1);
    } else {
      setTableCaptionStructureAndSelection(editor);
    }

    if (toolbar) {
      clickOnButton(editor, 'Table caption');
    } else {
      await clickOnMenuItem(editor, 'Table caption');
    }

    if (addCaption) {
      assertTableContainsCaption(editor);
    } else {
      assertStructureIsRestoredToDefault(editor, 1, 1);
    }
  };

  context('Using the command directly', () => {
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

  context('Using the toolbar button', () => {
    it('TINY-7476: The caption should appear', async () => {
      await pAssertTableCaption(true, true);
    });

    it('TINY-7476: The caption should be removed', async () => {
      await pAssertTableCaption(true, false);
    });
  });

  context('Using the menuitem', () => {
    it('TINY-7476: The caption should appear with the menu', async () => {
      await pAssertTableCaption(false, true);
    });

    it('TINY-7476: The caption should be removed with the menu', async () => {
      await pAssertTableCaption(false, false);
    });
  });
});
