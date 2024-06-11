import { context, describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.html.NonEditableFilterTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    add_unload_trigger: false,
    indent: false,
    noneditable_regexp: [ /\{[^\}]+\}/g ],
    entities: 'raw',
    base_url: '/project/tinymce/js/tinymce'
  }, []);

  it('TBA: noneditable class', () => {
    const editor = hook.editor();
    editor.setContent('<p><span class="mceNonEditable">abc</span></p>');
    assert.equal(editor.dom.select('span')[0].contentEditable, 'false');
  });

  it('TBA: editable class', () => {
    const editor = hook.editor();
    editor.setContent('<p><span class="mceEditable">abc</span></p>');
    assert.equal(editor.dom.select('span')[0].contentEditable, 'true');
  });

  it('TBA: noneditable regexp', () => {
    const editor = hook.editor();
    editor.setContent('<p>{test1}{test2}</p>');
    assert.equal(editor.dom.select('span').length, 2);
    assert.equal(editor.dom.select('span')[0].contentEditable, 'false');
    assert.equal(editor.dom.select('span')[1].contentEditable, 'false');
    TinyAssertions.assertContent(editor, '<p>{test1}{test2}</p>');
  });

  it('TBA: noneditable regexp inside cE=false', () => {
    const editor = hook.editor();
    editor.setContent('<span contenteditable="false">{test1}</span>');
    assert.lengthOf(editor.dom.select('span'), 1);
  });

  context('Noneditable content injection', () => {
    const testNoneditableContentInjection = (testCase: { input: string; expected: string }) => {
      const editor = hook.editor();
      editor.setContent(testCase.input);
      TinyAssertions.assertContent(editor, testCase.expected);
    };

    it('TINY-11022: noneditable elements should not be allowed to include content that does not match the pattern', () => testNoneditableContentInjection({
      input: '<p>foo<span class="mceNonEditable" data-mce-content="<b>baz</b>" contenteditable="false">something</span>bar</p>',
      expected: '<p>foobar</p>'
    }));

    it('TINY-11022: noneditable elements should not be allowed to include content that just partially matches the pattern', () => testNoneditableContentInjection({
      input: '<p>foo<span class="mceNonEditable" data-mce-content="{test1}<b>baz</b>" contenteditable="false">something</span>bar</p>',
      expected: '<p>foobar</p>'
    }));
  });
});
