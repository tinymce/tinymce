import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks } from '@ephox/wrap-mcagar';

import type Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.content.EditorContentRetailAttributesTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce'
  }, []);

  const testContentRetainAttributes = (testCase: { input: string; expected: string }) => {
    const editor = hook.editor();

    editor.setContent(testCase.input);
    TinyAssertions.assertContent(editor, testCase.expected);

    editor.setContent('');
    editor.insertContent(testCase.input);
    TinyAssertions.assertContent(editor, testCase.expected);
  };

  it('TINY-14333: Should support valid style, src and href', () => testContentRetainAttributes({
    input: '<p><span style="color: red;">Red</span> <a href="#">link</a> <img src="about:blank"></p>',
    expected: '<p><span style="color: red;">Red</span> <a href="#">link</a> <img src="about:blank"></p>'
  }));

  it('TINY-14333: data-mce-style attribute in input should be ignored', () => testContentRetainAttributes({
    input: `<p><span data-mce-style="color: url('javascript:alert(1)');" style="color: red;">Red</span></p>`,
    expected: '<p><span style="color: red;">Red</span></p>'
  }));

  it('TINY-14333: data-mce-src attribute in input should be ignored', () => testContentRetainAttributes({
    input: '<p><img data-mce-src="javascript:alert(1)" src="about:blank"></p>',
    expected: '<p><img src="about:blank"></p>'
  }));

  it('TINY-14333: data-mce-href attribute in input should be ignored', () => testContentRetainAttributes({
    input: '<p><a data-mce-href="javascript:alert(1)" href="about:blank">link</a></p>',
    expected: '<p><a href="about:blank">link</a></p>'
  }));
});
