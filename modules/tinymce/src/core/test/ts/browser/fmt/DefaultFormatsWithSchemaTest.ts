import { context, describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.fmt.DefaultFormatsWithSchemaTest', () => {
  const defaultOptions = {
    toolbar: 'forecolor backcolor | bold italic underline strikethrough | alignleft',
    base_url: '/project/tinymce/js/tinymce'
  };

  const toggleInlineStyle = (editor: Editor, style: string) => {
    TinyUiActions.clickOnToolbar(editor, `[aria-label="${style}"]`);
  };

  context(`schema version: html5`, () => {
    const hook = TinyHooks.bddSetupLight<Editor>({
      ...defaultOptions,
      schema: 'html5'
    }, []);

    it('TINY-8262: should apply strikethrough using an "s" tag', () => {
      const editor = hook.editor();
      editor.setContent('<p>Test</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 2);
      toggleInlineStyle(editor, 'Strikethrough');
      TinyAssertions.assertContent(editor, '<p><s>Test</s></p>');
      toggleInlineStyle(editor, 'Strikethrough');
      editor.setContent('<p>Test</p>');
    });

    // Note: This test does not apply to html5-strict as "strike" is not valid in the schema
    it('TINY-8262: should convert "strike" tag to an "s" tag', () => {
      const editor = hook.editor();
      editor.setContent('<p><strike>Test</strike></p>');
      TinyAssertions.assertContent(editor, '<p><s>Test</s></p>');
    });

    it('TINY-11390: should only wrap selected text in <samp> tags when applying "Sample" format', () => {
      const editor = hook.editor();
      editor.setContent('<p>one two three</p>');
      TinySelections.setSelection(editor, [ 0, 0 ], 4, [ 0, 0 ], 7);
      editor.formatter.apply('samp');
      TinyAssertions.assertContent(editor, '<p>one <samp>two</samp> three</p>');
    });
  });

  context(`schema version: html5-strict`, () => {
    const hook = TinyHooks.bddSetupLight<Editor>({
      ...defaultOptions,
      schema: 'html5-strict'
    }, []);

    it('TINY-8262: should apply strikethrough using an "s" tag', () => {
      const editor = hook.editor();
      editor.setContent('<p>Test</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 2);
      toggleInlineStyle(editor, 'Strikethrough');
      TinyAssertions.assertContent(editor, '<p><s>Test</s></p>');
      toggleInlineStyle(editor, 'Strikethrough');
      editor.setContent('<p>Test</p>');
    });

    it('TINY-11390: should only wrap selected text in <samp> tags when applying "Sample" format', () => {
      const editor = hook.editor();
      editor.setContent('<p>one two three</p>');
      TinySelections.setSelection(editor, [ 0, 0 ], 4, [ 0, 0 ], 7);
      editor.formatter.apply('samp');
      TinyAssertions.assertContent(editor, '<p>one <samp>two</samp> three</p>');
    });
  });

  context('schema version: html4', () => {
    const hook = TinyHooks.bddSetupLight<Editor>({
      ...defaultOptions,
      schema: 'html4'
    }, []);

    it('TINY-8262: should apply strikethrough using a "span" tag', () => {
      const editor = hook.editor();
      editor.setContent('<p>Test</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 2);
      toggleInlineStyle(editor, 'Strikethrough');
      TinyAssertions.assertContent(editor, '<p><span style="text-decoration: line-through;">Test</span></p>');
      toggleInlineStyle(editor, 'Strikethrough');
      editor.setContent('<p>Test</p>');
    });

    it('TINY-8262: should convert "strike" tag to a "span" tag', () => {
      const editor = hook.editor();
      editor.setContent('<p><strike>Test</strike></p>');
      TinyAssertions.assertContent(editor, '<p><span style="text-decoration: line-through;">Test</span></p>');
    });

    it('TINY-11390: should only wrap the selected text in <samp> tags when applying "Sample" format', () => {
      const editor = hook.editor();
      editor.setContent('<p>one two three</p>');
      TinySelections.setSelection(editor, [ 0, 0 ], 4, [ 0, 0 ], 7);
      editor.formatter.apply('samp');
      TinyAssertions.assertContent(editor, '<p>one <samp>two</samp> three</p>');
    });
  });
});
