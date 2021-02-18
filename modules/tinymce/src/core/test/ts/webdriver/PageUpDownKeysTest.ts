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
    it('TINY-4612: caret should be placed before the inline element if it is at the start of it', async () => {
      const editor = hook.editor();
      editor.setContent('<p><a href="google.com">link</a>text</p>');
      TinySelections.setCursor(editor, [ 0, 0, 0 ], 0);
      TinyContentActions.keyup(editor, Keys.pageUp());
      await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.combo({}, 'PageUp') ]);

      TinyAssertions.assertCursor(editor, [ 0 ], 0);
    });

    it('TINY-4612: caret should be placed before the inline element if it is at the end of it', async () => {
      const editor = hook.editor();
      editor.setContent('<p><a href="google.com">link</a>text</p>');
      TinySelections.setCursor(editor, [ 0, 0, 0 ], 4);
      await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.combo({}, 'PageUp') ]);

      TinyAssertions.assertCursor(editor, [ 0 ], 0);
    });

    it('TINY-4612: caret wont move if it is not at the beginning/end of the inline element', async function () {
      // Windows os default behavior (no matter the browser) is moving the caret at the beginning of the line
      if (platform.os.isWindows()) {
        this.skip();
      }

      const editor = hook.editor();
      editor.setContent('<p>text<a href="google.com">link</a>link</p>');
      TinySelections.setCursor(editor, [ 0, 1, 0 ], 2);
      await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.combo({}, 'PageUp') ]);

      TinyAssertions.assertCursor(editor, [ 0, 1, 0 ], 2);
    });

    it('TINY-4612: caret wont move inline_boundaries: false', async function () {
      if (platform.os.isWindows()) {
        this.skip();
      }

      const editor = hook.editor();
      editor.settings.inline_boundaries = false;
      editor.setContent('<p>text<a href="google.com">link</a>link</p>');
      TinySelections.setCursor(editor, [ 0, 1, 0 ], 0);
      await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.combo({}, 'PageUp') ]);

      TinyAssertions.assertCursor(editor, [ 0, 0 ], 4);
      delete editor.settings.inline_boundaries;
    });
  });

  context('Page Down', () => {
    it('TINY-4612: caret should be placed after the inline element if it is at the start of it', async () => {
      const editor = hook.editor();
      editor.setContent('<p>text<a href="google.com">link</a></p>');
      TinySelections.setCursor(editor, [ 0, 1, 0 ], 0);
      await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.combo({}, 'PageDown') ]);

      TinyAssertions.assertCursor(editor, [ 0 ], 2);
    });

    it('TINY-4612: caret should be placed after the inline element if it is at the end of it', async () => {
      const editor = hook.editor();
      editor.setContent('<p><a href="google.com">link</a>text</p>');
      TinySelections.setCursor(editor, [ 0, 0, 0 ], 4);
      await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.combo({}, 'PageDown') ]);

      TinyAssertions.assertCursor(editor, [ 0 ], 1);
    });

    it('TINY-4612: caret wont move if it is not at the beginning/end of the inline element', async function () {
      // Windows os default behavior (regardless the browser) is moving the caret at the end of the line
      if (platform.os.isWindows()) {
        this.skip();
      }

      const editor = hook.editor();
      editor.setContent('<p><a href="google.com">link</a>text</p>');
      TinySelections.setCursor(editor, [ 0, 0, 0 ], 2);
      await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.combo({}, 'PageDown') ]);

      TinyAssertions.assertCursor(editor, [ 0, 0, 0 ], 2);
    });

    it('TINY-4612: caret wont move inline_boundaries: false', async function () {
      if (platform.os.isWindows()) {
        this.skip();
      }

      const editor = hook.editor();
      editor.settings.inline_boundaries = false;
      editor.setContent('<p><a href="google.com">link</a>text</p>');
      TinySelections.setCursor(editor, [ 0, 0, 0 ], 0);
      await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.combo({}, 'PageDown') ]);

      TinyAssertions.assertCursor(editor, [ 0, 0, 0 ], 0);
      delete editor.settings.inline_boundaries;
    });
  });
});
