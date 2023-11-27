import { describe, it } from '@ephox/bedrock-client';
import { Unicode } from '@ephox/katamari';
import { TinyApis, TinyAssertions, TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/searchreplace/Plugin';

describe('browser.tinymce.plugins.searchreplace.SearchReplacePluginTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'searchreplace',
    valid_elements: 'p,b,i,br,span[contenteditable]',
    indent: false,
    base_url: '/project/tinymce/js/tinymce',
  }, [ Plugin ], true);

  it('TBA: SearchReplace: Find no match', () => {
    const editor = hook.editor();
    editor.setContent('a');
    assert.equal(editor.plugins.searchreplace.find('x'), 0);
  });

  it('TBA: SearchReplace: Find single match', () => {
    const editor = hook.editor();
    editor.setContent('a');
    assert.equal(editor.plugins.searchreplace.find('a'), 1);
  });

  it('TBA: SearchReplace: Find single match in multiple elements', () => {
    const editor = hook.editor();
    editor.setContent('t<b>e</b><i>xt</i>');
    assert.equal(editor.plugins.searchreplace.find('text'), 1);
  });

  it('TBA: SearchReplace: Find single match, match case: true', () => {
    const editor = hook.editor();
    editor.setContent('a A');
    assert.equal(editor.plugins.searchreplace.find('A', true), 1);
  });

  it('TBA: SearchReplace: Find single match, whole words: true', () => {
    const editor = hook.editor();
    editor.setContent('a Ax');
    assert.equal(editor.plugins.searchreplace.find('a', false, true), 1);
  });

  it('TINY-4522: SearchReplace: Find special characters match', () => {
    const editor = hook.editor();
    editor.setContent('^^ ^^ ^^^^');
    assert.equal(editor.plugins.searchreplace.find('^^'), 4);
    editor.setContent('50$ 50$50$');
    assert.equal(editor.plugins.searchreplace.find('50$'), 3);
  });

  it('TINY-4522: SearchReplace: Find special characters match, whole words: true', () => {
    const editor = hook.editor();
    editor.setContent('^^ ^^ ^^^^');
    assert.equal(editor.plugins.searchreplace.find('^^', false, true), 3);
    editor.setContent('50$ 50$50$');
    assert.equal(editor.plugins.searchreplace.find('50$', false, true), 2);
  });

  it('TINY-4522: SearchReplace: Find word with punctuation, whole words: true', () => {
    const editor = hook.editor();
    editor.setContent(`'test' "test" \u2018test\u2019 test: test; test! test. test? test,`);
    assert.equal(editor.plugins.searchreplace.find('test', false, true), 9);
    assert.equal(editor.plugins.searchreplace.find('test!', false, true), 1);
  });

  it('TBA: SearchReplace: Find multiple matches', () => {
    const editor = hook.editor();
    editor.setContent('a b A');
    assert.equal(editor.plugins.searchreplace.find('a'), 2);
  });

  it('TBA: SearchReplace: Find and replace single match', () => {
    const editor = hook.editor();
    editor.setContent('a');
    editor.plugins.searchreplace.find('a');
    assert.isFalse(editor.plugins.searchreplace.replace('x'));
    TinyAssertions.assertContent(editor, '<p>x</p>');
  });

  it('TBA: SearchReplace: Find and replace first in multiple matches', () => {
    const editor = hook.editor();
    editor.setContent('a b a');
    editor.plugins.searchreplace.find('a');
    assert.isTrue(editor.plugins.searchreplace.replace('x'));
    TinyAssertions.assertContent(editor, '<p>x b a</p>');
  });

  it('TBA: SearchReplace: Find and replace two consecutive spaces', () => {
    const editor = hook.editor();
    editor.setContent('a&nbsp; b');
    editor.plugins.searchreplace.find('a  ');
    assert.isFalse(editor.plugins.searchreplace.replace('x'));
    TinyAssertions.assertContent(editor, '<p>xb</p>');
  });

  it('TBA: SearchReplace: Find and replace consecutive spaces', () => {
    const editor = hook.editor();
    editor.setContent('a&nbsp; &nbsp;b');
    editor.plugins.searchreplace.find('a   ');
    assert.isFalse(editor.plugins.searchreplace.replace('x'));
    TinyAssertions.assertContent(editor, '<p>xb</p>');
  });

  it('TBA: SearchReplace: Find and replace all in multiple matches', () => {
    const editor = hook.editor();
    editor.setContent('a b a');
    editor.plugins.searchreplace.find('a');
    assert.isFalse(editor.plugins.searchreplace.replace('x', true, true));
    TinyAssertions.assertContent(editor, '<p>x b x</p>');
  });

  it('TBA: SearchReplace: Find and replace all spaces with new lines', () => {
    const editor = hook.editor();
    editor.setContent('a&nbsp; &nbsp;b<br/><br/>ab&nbsp;c');
    editor.plugins.searchreplace.find(' ');
    assert.isFalse(editor.plugins.searchreplace.replace('x', true, true));
    TinyAssertions.assertContent(editor, '<p>axxxb<br><br>abxc</p>');
  });

  it('TBA: SearchReplace: Find multiple matches, move to next and replace', () => {
    const editor = hook.editor();
    editor.setContent('a a');
    assert.equal(editor.plugins.searchreplace.find('a'), 2);
    editor.plugins.searchreplace.next();
    assert.isTrue(editor.plugins.searchreplace.replace('x'));
    TinyAssertions.assertContent(editor, '<p>a x</p>');
  });

  it('TBA: SearchReplace: Find and replace fragmented match', () => {
    const editor = hook.editor();
    editor.setContent('<b>te<i>s</i>t</b><b>te<i>s</i>t</b>');
    editor.plugins.searchreplace.find('test');
    assert.isTrue(editor.plugins.searchreplace.replace('abc'));
    TinyAssertions.assertContent(editor, '<p><b>abc</b><b>te<i>s</i>t</b></p>');
  });

  it('TBA: SearchReplace: Find and replace all fragmented matches', () => {
    const editor = hook.editor();
    editor.setContent('<b>te<i>s</i>t</b><b>te<i>s</i>t</b>');
    editor.plugins.searchreplace.find('test');
    assert.isFalse(editor.plugins.searchreplace.replace('abc', true, true));
    TinyAssertions.assertContent(editor, '<p><b>abc</b><b>abc</b></p>');
  });

  it('TBA: SearchReplace: Find multiple matches, move to next and replace backwards', () => {
    const editor = hook.editor();
    editor.setContent('a a');
    assert.equal(editor.plugins.searchreplace.find('a'), 2);
    editor.plugins.searchreplace.next();
    assert.isTrue(editor.plugins.searchreplace.replace('x', false));
    assert.isFalse(editor.plugins.searchreplace.replace('y', false));
    TinyAssertions.assertContent(editor, '<p>y x</p>');
  });

  it('TBA: SearchReplace: Find multiple matches and unmark them', () => {
    const editor = hook.editor();
    editor.setContent('a b a');
    assert.equal(editor.plugins.searchreplace.find('a'), 2);
    editor.plugins.searchreplace.done();
    assert.equal(editor.selection.getContent(), 'a');
    assert.lengthOf(editor.getBody().getElementsByTagName('span'), 0);
  });

  it('TBA: SearchReplace: Find multiple matches with pre blocks', () => {
    const editor = hook.editor();
    editor.getBody().innerHTML = 'abc<pre>  abc  </pre>abc';
    assert.equal(editor.plugins.searchreplace.find('b'), 3);
    TinyAssertions.assertRawContent(editor,
      'a<span data-mce-bogus="1" class="mce-match-marker mce-match-marker-selected" data-mce-index="0">b</span>c' +
        '<pre>  a<span data-mce-bogus="1" class="mce-match-marker" data-mce-index="1">b</span>c  </pre>' +
        'a<span data-mce-bogus="1" class="mce-match-marker" data-mce-index="2">b</span>c'
    );
  });

  it('TINY-5967: SearchReplace: Find and replace all in nested contenteditable elements', () => {
    const editor = hook.editor();
    editor.setContent('<p>Editable ' +
      '<span contenteditable="false">NonEditable <span contenteditable="true">Editable ' +
      '<span contenteditable="false">NonEditable <span contenteditable="true">Editable </span>NonEditable </span>' +
      'Editable </span>NonEditable </span>' +
      'Editable</p>');
    assert.equal(editor.plugins.searchreplace.find('Editable', true, true), 5);
    TinyAssertions.assertRawContent(editor,
      '<p><span data-mce-bogus="1" class="mce-match-marker mce-match-marker-selected" data-mce-index="0">Editable</span> ' +
      '<span contenteditable="false">NonEditable <span contenteditable="true"><span data-mce-bogus="1" class="mce-match-marker" data-mce-index="1">Editable</span> ' +
      '<span contenteditable="false">NonEditable <span contenteditable="true"><span data-mce-bogus="1" class="mce-match-marker" data-mce-index="2">Editable</span> </span>NonEditable </span>' +
      '<span data-mce-bogus="1" class="mce-match-marker" data-mce-index="3">Editable</span> </span>NonEditable </span>' +
      '<span data-mce-bogus="1" class="mce-match-marker" data-mce-index="4">Editable</span></p>'
    );
    assert.isFalse(editor.plugins.searchreplace.replace('x', true, true));
    TinyAssertions.assertContent(editor, '<p>x ' +
      '<span contenteditable="false">NonEditable <span contenteditable="true">x ' +
      '<span contenteditable="false">NonEditable <span contenteditable="true">x </span>NonEditable </span>' +
      'x </span>NonEditable </span>' +
      'x</p>');
  });

  it('TINY-4599: SearchReplace: Excludes zwsp characters', () => {
    const content = `<p>a${Unicode.zeroWidth} b${Unicode.zeroWidth} a</p>`;
    const editor = hook.editor();
    TinyApis(editor).setRawContent(content);
    assert.equal(editor.plugins.searchreplace.find(' '), 2);
    assert.lengthOf(editor.getBody().getElementsByTagName('span'), 2);
    editor.plugins.searchreplace.done();
    assert.lengthOf(editor.getBody().getElementsByTagName('span'), 0);
    TinyAssertions.assertRawContent(editor, content);
  });
});
