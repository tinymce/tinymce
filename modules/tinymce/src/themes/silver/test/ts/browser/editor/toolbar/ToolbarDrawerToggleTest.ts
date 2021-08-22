import { before, context, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { McEditor } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { RawEditorSettings, ToolbarMode } from 'tinymce/core/api/SettingsTypes';
import Theme from 'tinymce/themes/silver/Theme';

import * as UiUtils from '../../../module/UiUtils';

describe('browser.tinymce.themes.silver.editor.toolbar.ToolbarDrawerToggleTest', () => {
  before(() => {
    Theme();
  });

  const assertToolbarToggleState = (editor: Editor, expected: boolean) => {
    const state = editor.queryCommandState('ToggleToolbarDrawer');
    assert.equal(state, expected, 'Expected toolbar toggle state to be ' + expected);
  };

  const pTestToggle = async (settings: RawEditorSettings, shouldToggle: boolean) => {
    const editor = await McEditor.pFromSettings<Editor>({
      toolbar: 'undo redo | bold italic',
      menubar: false,
      statusbar: false,
      width: 200,
      ...settings,
      base_url: '/project/tinymce/js/tinymce'
    });
    editor.focus();
    await UiUtils.pWaitForEditorToRender();
    assertToolbarToggleState(editor, false);
    editor.execCommand('ToggleToolbarDrawer');
    assertToolbarToggleState(editor, shouldToggle);
    editor.execCommand('ToggleToolbarDrawer');
    assertToolbarToggleState(editor, false);
    McEditor.remove(editor);
  };

  context(`Using the 'ToggleToolbarDrawer' command should toggle the toolbar if applicable`, () => {
    Arr.each<{ mode: ToolbarMode; shouldToggle: boolean }>([
      { mode: 'floating', shouldToggle: true },
      { mode: 'sliding', shouldToggle: true },
      { mode: 'wrap', shouldToggle: false },
      { mode: 'scrolling', shouldToggle: false }
    ], (test) => {
      // Test iframe
      it(`TINY-6032: ${test.mode} toolbar`, () =>
        pTestToggle({ toolbar_mode: test.mode }, false)
      );

      it(`TINY-6032: ${test.mode} toolbar - small width`, () =>
        pTestToggle({ toolbar_mode: test.mode, width: 50 }, test.shouldToggle)
      );

      // Test inline
      it(`TINY-6032: ${test.mode} toolbar (inline)`, () =>
        pTestToggle({ toolbar_mode: test.mode, inline: true }, false)
      );

      it(`TINY-6032: ${test.mode} toolbar - small width (inline)`, () =>
        pTestToggle({ toolbar_mode: test.mode, width: 50, inline: true }, test.shouldToggle)
      );
    });

    it('TINY-6032: Multiple toolbars', () =>
      pTestToggle({ toolbar: [ 'undo redo', 'bold italic' ] }, false)
    );

    it('TINY-6032: Multiple toolbars (inline)', () =>
      pTestToggle({ toolbar: [ 'undo redo', 'bold italic' ], inline: true }, false)
    );
  });
});
