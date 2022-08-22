import { RealKeys } from '@ephox/agar';
import { beforeEach, context, describe, it } from '@ephox/bedrock-client';
import { PlatformDetection } from '@ephox/sand';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('webdriver.tinymce.core.keyboard.SpaceKeyTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, []);

  const detect = PlatformDetection.detect().browser;
  const isSafari = detect.isSafari();
  const isFirefox = detect.isFirefox();

  beforeEach(() => {
    hook.editor().focus();
  });

  context('Space key around inline boundary elements', () => {
    it('TINY-8588: Add one space just before a block', async () => {
      const editor = hook.editor();
      editor.setContent('<p>s<span style="display: block;" contenteditable="false">a</span></p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 1);
      await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.text(' ') ]);
      TinyAssertions.assertContent(editor, '<p>s&nbsp;<span style="display: block;" contenteditable="false">a</span></p>');
    });

    it('TINY-8588: Add two spaces just before a block', async () => {
      const editor = hook.editor();
      editor.setContent('<p>s<span style="display: block;" contenteditable="false">a</span></p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 1);
      await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.text(' ') ]);
      await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.text(' ') ]);
      if (isSafari) { // Split due to normalization issue. See TINY-8833
        TinyAssertions.assertContent(editor, '<p>s &nbsp;<span style="display: block;" contenteditable="false">a</span></p>');
      } else if (isFirefox) { // Split due to normalization issue. See TINY-8833
        TinyAssertions.assertContent(editor, '<p>s&nbsp; <span style="display: block;" contenteditable="false">a</span></p>');
      } else {
        TinyAssertions.assertContent(editor, '<p>s&nbsp;&nbsp;<span style="display: block;" contenteditable="false">a</span></p>');
      }
    });

    it('TINY-8588: Add one space before a block while in a span', async () => {
      const editor = hook.editor();
      editor.setContent('<p><span class="filler">s</span><span style="display: block;" contenteditable="false">a</span></p>');
      TinySelections.setCursor(editor, [ 0, 0, 0 ], 1);
      await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.text(' ') ]);
      TinyAssertions.assertContent(editor, '<p><span class="filler">s&nbsp;</span><span style="display: block;" contenteditable="false">a</span></p>');
    });

    it('TINY-8588: Add one space before a block inside a strong', async () => {
      const editor = hook.editor();
      editor.setContent('<p>s<strong><span contenteditable="false" style="display: block;">a</span></strong></p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 1);
      await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.text(' ') ]);
      TinyAssertions.assertContent(editor, '<p>s&nbsp;<strong><span style="display: block;" contenteditable="false">a</span></strong></p>');
    });

    it('TINY-8814: Add one space just after a block', async () => {
      const editor = hook.editor();
      editor.setContent('<p><span style="display: block;" contenteditable="false">a</span>s</p>');
      TinySelections.setCursor(editor, [ 0, 2 ], 0);
      await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.text(' ') ]);
      TinyAssertions.assertContent(editor, '<p><span style="display: block;" contenteditable="false">a</span>&nbsp;s</p>');
    });

    it('TINY-8814: Add two spaces just after a block', async () => {
      const editor = hook.editor();
      editor.setContent('<p><span style="display: block;" contenteditable="false">a</span>s</p>');
      TinySelections.setCursor(editor, [ 0, 2 ], 0);
      await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.text(' ') ]);
      await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.text(' ') ]);
      TinyAssertions.assertContent(editor, '<p><span style="display: block;" contenteditable="false">a</span>&nbsp; s</p>');
    });

    it('TINY-8814: Add one space after a block while in a span', async () => {
      const editor = hook.editor();
      editor.setContent('<p><span style="display: block;" contenteditable="false">a</span><span class="filler">s</span></p>');
      TinySelections.setCursor(editor, [ 0, 2, 0 ], 0);
      await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.text(' ') ]);
      TinyAssertions.assertContent(editor, '<p><span style="display: block;" contenteditable="false">a</span><span class="filler">&nbsp;s</span></p>');
    });

    it('TINY-8814: Add one space after a block inside a strong', async () => {
      const editor = hook.editor();
      editor.setContent('<p><strong><span contenteditable="false" style="display: block;">a</span></strong>s</p>');
      TinySelections.setCursor(editor, [ 0, 1 ], 0);
      await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.text(' ') ]);
      TinyAssertions.assertContent(editor, '<p><strong><span style="display: block;" contenteditable="false">a</span></strong>&nbsp;s</p>');
    });
  });
});
