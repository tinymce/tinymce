import { UiFinder } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { SugarBody } from '@ephox/sugar';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.themes.silver.throbber.ThrobberEditorTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
  }, []);

  const pToggleThrobber = async (editor: Editor, action: () => void = Fun.noop) => {
    editor.setProgressState(true);
    await UiFinder.pWaitForVisible('Wait for throbber to show', SugarBody.body(), '.tox-throbber');
    action();
    editor.setProgressState(false);
    await UiFinder.pWaitForHidden('Wait for throbber to hide', SugarBody.body(), '.tox-throbber');
  };

  it('TINY-7373: should not change the editor selection', async () => {
    const editor = hook.editor();
    editor.setContent('<p>abc</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 2);
    await pToggleThrobber(editor);
    TinyAssertions.assertSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 2);
  });

  context('Commands', () => {
    it('TINY-7373: should be able to use format commands when throbber is enabled', async () => {
      const editor = hook.editor();
      editor.setContent('<p>abc</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 1);
      await pToggleThrobber(editor, () => editor.execCommand('Bold'));
      TinyAssertions.assertContent(editor, '<p><strong>abc</strong></p>');
    });
  });

  context('Editor APIs', () => {
    it('TINY-7373: should be able to use insertContent when throbber is enabled', async () => {
      const editor = hook.editor();
      editor.setContent('<p>abc</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 1);
      await pToggleThrobber(editor, () => editor.insertContent('d'));
      TinyAssertions.assertContent(editor, '<p>adbc</p>');
    });

    it('TINY-7373: should be able to change selection when throbber is enabled', async () => {
      const editor = hook.editor();
      editor.setContent('<p>abc</p>');
      TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 0);
      await pToggleThrobber(editor, () => TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 2));
      TinyAssertions.assertSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 2);
    });
  });

  context('Editor TabIndex', () => {
    const assertTabIndex = (editor: Editor, tabIndex: string, dataTabIndex: string) => {
      const iframe = editor.iframeElement;
      assert.equal(editor.dom.getAttrib(iframe, 'tabindex'), tabIndex);
      assert.equal(editor.dom.getAttrib(iframe, 'data-mce-tabindex'), dataTabIndex);
    };

    it('TINY-7373: should have tabindex on iframe when the throbber is enabled', async () => {
      const editor = hook.editor();
      assertTabIndex(editor, '', '');
      await pToggleThrobber(editor, () => assertTabIndex(editor, '-1', ''));
      assertTabIndex(editor, '', '');
    });

    it('TINY-7373: should set correct tabindex on iframe when the throbber is disabled', async () => {
      const editor = hook.editor();
      const iframe = editor.iframeElement as HTMLIFrameElement;
      iframe.tabIndex = 1;
      assertTabIndex(editor, '1', '');
      await pToggleThrobber(editor, () => assertTabIndex(editor, '-1', '1'));
      assertTabIndex(editor, '1', '');
    });
  });
});
