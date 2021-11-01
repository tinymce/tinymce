import { beforeEach, context, describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.fmt.ContentLangTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce'
  }, []);

  context('lang format plays nicely with other formats', () => {
    beforeEach(() => {
      const editor = hook.editor();
      editor.setContent('<p>Hello world</p>');
      TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 'Hello world'.length);
    });

    it('TINY-6149: supports setting color then setting language', () => {
      const editor = hook.editor();
      editor.formatter.toggle('forecolor', { value: 'red' });
      editor.execCommand('lang', false, { code: 'fr' });
      TinyAssertions.assertContent(editor, '<p><span lang="fr" style="color: red;">Hello world</span></p>');
      editor.execCommand('lang', false, { code: 'fr' });
      editor.formatter.toggle('forecolor', { value: 'red' });
      TinyAssertions.assertContent(editor, '<p>Hello world</p>');
    });

    it('TINY-6149: supports setting language then setting color', () => {
      const editor = hook.editor();
      editor.execCommand('lang', false, { code: 'fr' });
      editor.formatter.toggle('forecolor', { value: 'red' });
      TinyAssertions.assertContent(editor, '<p><span lang="fr" style="color: red;">Hello world</span></p>');
      editor.formatter.toggle('forecolor', { value: 'red' });
      editor.execCommand('lang', false, { code: 'fr' });
      TinyAssertions.assertContent(editor, '<p>Hello world</p>');
    });

    it('TINY-6149: supports setting color then setting language - with complex language', () => {
      const editor = hook.editor();
      editor.formatter.toggle('forecolor', { value: 'red' });
      editor.execCommand('lang', false, { code: 'en_US', customCode: 'en-us-medical' });
      TinyAssertions.assertContent(editor, '<p><span lang="en_US" style="color: red;" data-mce-lang="en-us-medical">Hello world</span></p>');
      editor.execCommand('lang', false, { code: 'en_US', customCode: 'en-us-medical' });
      editor.formatter.toggle('forecolor', { value: 'red' });
      TinyAssertions.assertContent(editor, '<p>Hello world</p>');
    });

    it('TINY-6149: supports setting language then setting color - with complex language', () => {
      const editor = hook.editor();
      editor.execCommand('lang', false, { code: 'en_US', customCode: 'en-us-medical' });
      editor.formatter.toggle('forecolor', { value: 'red' });
      TinyAssertions.assertContent(editor, '<p><span lang="en_US" style="color: red;" data-mce-lang="en-us-medical">Hello world</span></p>');
      editor.formatter.toggle('forecolor', { value: 'red' });
      editor.execCommand('lang', false, { code: 'en_US', customCode: 'en-us-medical' });
      TinyAssertions.assertContent(editor, '<p>Hello world</p>');
    });
  });

  context('nested lang formats', () => {
    beforeEach(() => {
      const editor = hook.editor();
      editor.setContent('<p>Hello world</p>');
    });

    it('TINY-6149: clears unnecessary nested styles', () => {
      const editor = hook.editor();
      TinySelections.setSelection(editor, [ 0, 0 ], 'Hello '.length, [ 0, 0 ], 'Hello world'.length);
      editor.execCommand('lang', false, { code: 'de' });
      TinySelections.setSelection(editor, [ 0 ], 0, [ 0 ], 2);
      editor.execCommand('lang', false, { code: 'pt' });
      TinyAssertions.assertContent(editor, '<p><span lang="pt">Hello world</span></p>');
    });

    it('TINY-6149: allows deliberately nesting styles', () => {
      const editor = hook.editor();
      TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 'Hello world'.length);
      editor.execCommand('lang', false, { code: 'pt' });
      TinySelections.setSelection(editor, [ 0, 0, 0 ], 'Hello '.length, [ 0, 0, 0 ], 'Hello world'.length);
      editor.execCommand('lang', false, { code: 'de' });
      TinyAssertions.assertContent(editor, '<p><span lang="pt">Hello <span lang="de">world</span></span></p>');
    });
  });
});
