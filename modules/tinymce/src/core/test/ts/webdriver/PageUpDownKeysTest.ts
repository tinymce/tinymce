import { RealKeys } from '@ephox/agar';
import { before, context, describe, it } from '@ephox/bedrock-client';
import { PlatformDetection } from '@ephox/sand';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';

describe('webdriver.tinymce.core.keyboard.PageUpDownKeyTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    add_unload_trigger: false,
    base_url: '/project/tinymce/js/tinymce',
    indent: false
  }, [ Theme ], true);
  const platform = PlatformDetection.detect();
  const supportsPageUpDown = !(platform.os.isOSX() || platform.os.isWindows() && platform.browser.isFirefox());

  // It's necessary to skip tests for Mac and Windows Firefox as they don't move the selection when pressing page up/down
  before(function () {
    if (!supportsPageUpDown) {
      this.skip();
    }
  });

  context('Page Up', () => {
    it('TINY-4612: caret should be placed at the start of the line', async () => {
      const editor = hook.editor();
      editor.setContent('<p><code><a href="google.com">link</a></code>text</p>');
      TinySelections.setCursor(editor, [ 0, 1 ], 2);
      await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.combo({}, 'PageUp') ]);

      // The caret should be on a ZWSP/fake caret position since we're outside the anchor
      TinyAssertions.assertCursor(editor, [ 0, 0 ], 0);
    });

    it('TINY-4612: caret should be placed out of the line element', async () => {
      const editor = hook.editor();
      editor.setContent('<p><a href="google.com">link</a></p>');
      TinySelections.setCursor(editor, [ 0, 0, 0 ], 2);
      await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.combo({}, 'PageUp') ]);

      // The caret should be on a ZWSP/fake caret position since we're outside the anchor
      TinyAssertions.assertCursor(editor, [ 0, 0 ], 0);
    });

    it('TINY-4612: "inline_boundaries: false" cursor does not move outside anchor', async () => {
      const editor = hook.editor();
      editor.settings.inline_boundaries = false;
      editor.setContent('<p><a href="google.com">link</a>text</p>');
      TinySelections.setCursor(editor, [ 0, 1 ], 4);
      await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.combo({}, 'PageUp') ]);

      if (platform.browser.isIE()) {
        TinyAssertions.assertCursor(editor, [ 0 ], 0);
      } else {
        TinyAssertions.assertCursor(editor, [ 0, 0, 0 ], 0);
      }

      delete editor.settings.inline_boundaries;
    });
  });

  context('Page Down', () => {
    it('TINY-4612: caret should be placed at the end of the line', async () => {
      const editor = hook.editor();
      editor.setContent('<p>text<code><a href="google.com">link</a></code></p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 0);
      await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.combo({}, 'PageDown') ]);

      // The caret should be on a ZWSP/fake caret position since we're outside the anchor
      TinyAssertions.assertCursor(editor, [ 0, 2 ], 1);
    });

    it('TINY-4612: caret should be placed out of the line element', async () => {
      const editor = hook.editor();
      editor.setContent('<p><a href="google.com">link</a></p>');
      TinySelections.setCursor(editor, [ 0, 0, 0 ], 2);
      await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.combo({}, 'PageDown') ]);

      // The caret should be on a ZWSP/fake caret position since we're outside the anchor
      TinyAssertions.assertCursor(editor, [ 0, 1 ], 1);
    });

    it('TINY-4612: "inline_boundaries: false" cursor does not move outside anchor', async () => {
      const editor = hook.editor();
      editor.settings.inline_boundaries = false;
      editor.setContent('<p>test<a href="google.com">link</a></p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 0);
      await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.combo({}, 'PageDown') ]);

      if (platform.browser.isIE()) {
        TinyAssertions.assertCursor(editor, [ 0 ], 2);
      } else {
        TinyAssertions.assertCursor(editor, [ 0, 1, 0 ], 4);
      }

      delete editor.settings.inline_boundaries;
    });
  });
});
