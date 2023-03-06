import { context, describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.content.InsertUnsanitizedContentTest', () => {
  const unsanitizedHtml = '<p id="action">XSS</p>';
  const sanitizedHtml = '<p>XSS</p>';
  const testInsertContent = (editor: Editor, content: string, expected: string) => {
    const initialContent = '<p>initial</p>';
    editor.setContent(initialContent);
    TinySelections.setCursor(editor, [ 0, 0 ], 0);
    editor.insertContent(content);
    TinyAssertions.assertContent(editor, `${expected}\n${initialContent}`);
  };

  context('TINY-9600: Inserting unsanitized html with xss_sanitization: true', () => {
    const hook = TinyHooks.bddSetupLight<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      xss_sanitization: true
    }, []);

    it('insertContent should sanitize inserted html', () => {
      const editor = hook.editor();
      testInsertContent(editor, unsanitizedHtml, sanitizedHtml);
    });
  });

  context('TINY-9600: Inserting unsanitized html with xss_sanitization: false', () => {
    const hook = TinyHooks.bddSetupLight<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      xss_sanitization: false
    }, []);

    it('insertContent should not alter inserted unsanitized html', () => {
      const editor = hook.editor();
      testInsertContent(editor, unsanitizedHtml, unsanitizedHtml);
    });
  });
});
