import { Keys, RealKeys } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyContentActions, TinyHooks, TinySelections } from '@ephox/mcagar';
import { PlatformDetection } from '@ephox/sand';

import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';

describe('webdriver.tinymce.core.keyboard.PageUpDownKeyTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    add_unload_trigger: false,
    base_url: '/project/tinymce/js/tinymce',
    indent: false
  }, [ Theme ], true);
  const platform = PlatformDetection.detect();

  context('Page Up', () => {
    it('TINY-4612: caret should be placed at the start of the line if the first child is an inline element', async () => {
      const editor = hook.editor();
      editor.setContent('<p><a href="google.com">link</a>text</p>');
      TinySelections.setCursor(editor, [ 0, 1 ], 2);
      await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.combo({}, 'PageUp') ]);
      TinyContentActions.keystroke(editor, Keys.pageUp());

      TinyAssertions.assertCursor(editor, [ 0 ], 0);
    });

    it('TINY-4612: macOS wont move the caret if it is not at inline element at the start of the line, whereas other OSs do', async () => {
      const editor = hook.editor();
      editor.setContent('<p>text<a href="google.com">link2</a>text</p>');
      TinySelections.setCursor(editor, [ 0, 2 ], 0);
      await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.combo({}, 'PageUp') ]);
      TinyContentActions.keystroke(editor, Keys.pageUp());

      if (platform.os.isOSX() || platform.browser.isFirefox()) {
        TinyAssertions.assertCursor(editor, [ 0, 2 ], 0);
      } else {
        TinyAssertions.assertCursor(editor, [ 0, 0 ], 0);
      }
    });

    it('TINY-4612: inline_boundaries: false macOS doesnt move, whereas other OSs do', async () => {
      const editor = hook.editor();
      editor.settings.inline_boundaries = false;
      editor.setContent('<p>test<a href="google.com">link</a>text</p>');
      TinySelections.setCursor(editor, [ 0, 2 ], 2);
      await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.combo({}, 'PageUp') ]);
      TinyContentActions.keystroke(editor, Keys.pageUp());

      if (platform.os.isOSX() || platform.browser.isFirefox()) {
        TinyAssertions.assertCursor(editor, [ 0, 2 ], 2);
      } else {
        TinyAssertions.assertCursor(editor, [ 0, 0 ], 0);
      }
      delete editor.settings.inline_boundaries;
    });
  });

  context('Page Down', () => {
    it('TINY-4612: caret should be placed at the end of the line if the last child is an inline element', async () => {
      const editor = hook.editor();
      editor.setContent('<p>text<a href="google.com">link</a></p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 0);
      await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.combo({}, 'PageDown') ]);
      TinyContentActions.keystroke(editor, Keys.pageDown());

      TinyAssertions.assertCursor(editor, [ 0 ], 2);
    });

    it('TINY-4612: macOS wont move the caret if it is not at inline element at the end of the line, whereas other OSs do', async () => {
      const editor = hook.editor();
      editor.setContent('<p>test<a href="google.com">link</a>text</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 0);
      await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.combo({}, 'PageDown') ]);
      TinyContentActions.keystroke(editor, Keys.pageDown());

      if (platform.os.isOSX() || platform.browser.isFirefox()) {
        TinyAssertions.assertCursor(editor, [ 0, 0 ], 0);
      } else {
        TinyAssertions.assertCursor(editor, [ 0, 2 ], 4);
      }
    });

    it('TINY-4612: inline_boundaries: false macOS doesnt move, whereas other OSs do', async () => {
      const editor = hook.editor();
      editor.settings.inline_boundaries = false;
      editor.setContent('<p>test<a href="google.com">link</a>text</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 0);
      await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.combo({}, 'PageDown') ]);
      TinyContentActions.keystroke(editor, Keys.pageDown());

      if (platform.os.isOSX() || platform.browser.isFirefox()) {
        TinyAssertions.assertCursor(editor, [ 0, 0 ], 0);
      } else {
        TinyAssertions.assertCursor(editor, [ 0, 2 ], 4);
      }
      delete editor.settings.inline_boundaries;
    });
  });
});
