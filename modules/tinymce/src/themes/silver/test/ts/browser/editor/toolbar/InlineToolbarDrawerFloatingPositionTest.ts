import { Keys, UiFinder, Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Arr, Cell } from '@ephox/katamari';
import { Css, SugarBody, SugarLocation } from '@ephox/sugar';
import { McEditor, TinyContentActions, TinyDom, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { RawEditorOptions } from 'tinymce/core/api/OptionTypes';

import { pAssertFloatingToolbarPosition, pOpenFloatingToolbarAndAssertPosition } from '../../../module/ToolbarUtils';

describe('browser.tinymce.themes.silver.editor.toolbar.InlineToolbarDrawerFloatingPositionTest', () => {
  const toolbarHeight = 39;
  const lineHeight = 30;

  const getUiContainerTop = (editor: Editor) => {
    const uiContainer = TinyDom.container(editor);
    return SugarLocation.absolute(uiContainer).top;
  };

  const pressEnterNTimes = (editor: Editor, times: number) => {
    editor.focus();
    Arr.range(times, () => {
      TinyContentActions.keydown(editor, Keys.enter());
    });
  };

  const pWithEditor = async (options: RawEditorOptions, pRunTests: (editor: Editor) => Promise<void>) => {
    const editor = await McEditor.pFromSettings<Editor>({
      theme: 'silver',
      inline: true,
      menubar: false,
      width: 450,
      base_url: '/project/tinymce/js/tinymce',
      toolbar: 'undo redo | styles | bold italic underline | strikethrough superscript subscript | alignleft aligncenter alignright aligncenter | outdent indent | cut copy paste | selectall remove',
      toolbar_mode: 'floating',
      ...options
    });
    const uiContainer = TinyDom.container(editor);
    Css.set(uiContainer, 'margin-left', '100px');
    editor.setContent('<p>Line 1</p><p>Line 2</p><p>Line 3</p>');
    editor.focus();
    TinySelections.setCursor(editor, [ 2, 0 ], 'Line 3'.length);
    await UiFinder.pWaitForVisible('Wait for editor to be visible', SugarBody.body(), '.tox-editor-header button[title="Reveal or hide additional toolbar items"]');
    await pRunTests(editor);
    McEditor.remove(editor);
  };

  it('TINY-4725: Test toolbar top positioning', () => pWithEditor({ }, async (editor) => {
    const initialContainerTop = getUiContainerTop(editor);
    const getExpectedToolbarPos = () => initialContainerTop + toolbarHeight; // top of ui container + toolbar height

    await pOpenFloatingToolbarAndAssertPosition(editor, getExpectedToolbarPos);
    await pOpenFloatingToolbarAndAssertPosition(editor, getExpectedToolbarPos, async () => {
      // Press enter a few times to change the height of the editor
      pressEnterNTimes(editor, 3);
      await pAssertFloatingToolbarPosition(editor, getExpectedToolbarPos, 105, 531);
    });
  }));

  it('TINY-4725: Test toolbar bottom positioning', () => pWithEditor({ toolbar_location: 'bottom' }, async (editor) => {
    const initialContainerTop = Cell(getUiContainerTop(editor));
    const getExpectedToolbarPos = () => initialContainerTop.get() - toolbarHeight * 2; // top of ui container - two toolbar heights

    await pOpenFloatingToolbarAndAssertPosition(editor, getExpectedToolbarPos);
    await pOpenFloatingToolbarAndAssertPosition(editor, getExpectedToolbarPos, async () => {
      // Press enter a few times to change the height of the editor
      pressEnterNTimes(editor, 3);
      await Waiter.pTryUntil('Wait for toolbar to move', () => {
        assert.isAtLeast(getUiContainerTop(editor), initialContainerTop.get() + lineHeight * 3, 'Toolbar top position'); // Wait for the toolbar to move three lines
      });
      initialContainerTop.set(getUiContainerTop(editor)); // reset the toolbar position
      await pAssertFloatingToolbarPosition(editor, getExpectedToolbarPos, 105, 531); // top of ui container - two toolbar heights
    });
  }));
});
