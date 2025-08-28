import { afterEach, context, describe, it } from '@ephox/bedrock-client';
import { McEditor } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.dom.ContentCssCorsTest', () => {
  const settings = {
    base_url: '/project/tinymce/js/tinymce',
    menubar: false,
    toolbar: false
  };

  const inlineSettings = {
    ...settings,
    inline: true
  };

  const assertCorsLinkPresence = (editor: Editor, expected: number) => {
    // Classic mode has two stylesheets in the document head, content.css and content.min.css.
    // Inline mode shares stylesheets with the outer document, and should have two different stylesheets by default, skin.min.css and content.inline.min.css.
    const corsLinks = editor.getDoc().querySelectorAll('link[crossorigin="anonymous"]');
    assert.equal(corsLinks.length, expected, `should have ${expected} link(s) with crossorigin="anonymous"`);
  };

  afterEach(() => {
    // Clean up by resetting the globals contentCssCors
    DOMUtils.DOM.styleSheetLoader._setContentCssCors(false);
  });

  context('Classic mode: Editor StyleSheetLoader is separate from global (tinymce)', () => {
    it('assert crossorigin link presence with setting set', async () => {
      const editor = await McEditor.pFromSettings<Editor>({ ...settings, content_css_cors: true });
      assertCorsLinkPresence(editor, 2);
      McEditor.remove(editor);
    });

    it('assert crossorigin link presence with no setting set', async () => {
      const editor = await McEditor.pFromSettings<Editor>(settings);
      assertCorsLinkPresence(editor, 0);
      McEditor.remove(editor);
    });
  });

  context('Inline mode: Global (tinymce) StyleSheetLoader is shared amongst multiple inline editors', () => {
    it('TINY-6037: assert crossorigin link presence with no setting set in inline mode', async () => {
      const inlineEditor1 = await McEditor.pFromSettings<Editor>({ ...inlineSettings });
      const inlineEditor2 = await McEditor.pFromSettings<Editor>({ ...inlineSettings });

      assertCorsLinkPresence(inlineEditor1, 0);
      assertCorsLinkPresence(inlineEditor2, 0);

      McEditor.remove(inlineEditor1);
      McEditor.remove(inlineEditor2);
    });

    it('TINY-6037: assert crossorigin link presence with setting set in inline mode', async () => {
      const inlineEditor1 = await McEditor.pFromSettings<Editor>({ ...inlineSettings, content_css_cors: true });
      const inlineEditor2 = await McEditor.pFromSettings<Editor>({ ...inlineSettings, content_css_cors: false });

      assertCorsLinkPresence(inlineEditor1, 2);
      assertCorsLinkPresence(inlineEditor2, 2);

      McEditor.remove(inlineEditor1);
      McEditor.remove(inlineEditor2);
    });

    it('TINY-6037: assert crossorigin link presence with setting false in inline mode', async () => {
      const inlineEditor1 = await McEditor.pFromSettings<Editor>({ ...inlineSettings, content_css_cors: false });
      const inlineEditor2 = await McEditor.pFromSettings<Editor>({ ...inlineSettings, content_css_cors: true });

      assertCorsLinkPresence(inlineEditor1, 0);
      assertCorsLinkPresence(inlineEditor2, 0);

      McEditor.remove(inlineEditor1);
      McEditor.remove(inlineEditor2);
    });
  });

  context('Classic and inline editors: Global (tinymce) StyleSheetLoader is shared amongst multiple inline editors, but classic editor has separate stylesheetloader', () => {
    it('TINY-6037: assert crossorigin links with setting true in first classic editor, and false in second inline editor', async () => {
      const classicEditor = await McEditor.pFromSettings<Editor>({ ...settings, content_css_cors: true });
      const inlineEditor = await McEditor.pFromSettings<Editor>({ ...inlineSettings, content_css_cors: false });

      assertCorsLinkPresence(classicEditor, 2);
      // Oxide skin will have crossOrigin="anonymous" after being loaded by classicEditor
      assertCorsLinkPresence(inlineEditor, 1);

      McEditor.remove(classicEditor);
      McEditor.remove(inlineEditor);
    });

    it('TINY-6037: assert crossorigin links with setting set only in first classic editor', async () => {
      const classicEditor = await McEditor.pFromSettings<Editor>({ ...settings, content_css_cors: true });
      const inlineEditor = await McEditor.pFromSettings<Editor>({ ...inlineSettings });

      assertCorsLinkPresence(classicEditor, 2);
      // Oxide skin will have crossOrigin="anonymous" after being loaded by classicEditor
      assertCorsLinkPresence(inlineEditor, 1);

      McEditor.remove(classicEditor);
      McEditor.remove(inlineEditor);
    });

    it('TINY-6037: assert crossorigin links with setting true in first inline editor, and false in second classic editor', async () => {
      const inlineEditor = await McEditor.pFromSettings<Editor>({ ...inlineSettings, content_css_cors: true });
      const classicEditor = await McEditor.pFromSettings<Editor>({ ...settings, content_css_cors: false });

      assertCorsLinkPresence(inlineEditor, 2);
      // Global styleSheetLoader shouldn't affect classic editor styleSheetLoader
      assertCorsLinkPresence(classicEditor, 0);

      McEditor.remove(classicEditor);
      McEditor.remove(inlineEditor);
    });

    it('TINY-6037: assert crossorigin links with no setting in first classic and second inline editors', async () => {
      const classicEditor = await McEditor.pFromSettings<Editor>({ ...settings });
      const inlineEditor = await McEditor.pFromSettings<Editor>({ ...inlineSettings });

      assertCorsLinkPresence(classicEditor, 0);
      assertCorsLinkPresence(inlineEditor, 0);

      McEditor.remove(classicEditor);
      McEditor.remove(inlineEditor);
    });
  });
});
