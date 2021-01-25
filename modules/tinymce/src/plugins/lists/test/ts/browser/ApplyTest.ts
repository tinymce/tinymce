import { describe, it } from '@ephox/bedrock-client';
import { LegacyUnit, TinyAssertions, TinyHooks } from '@ephox/mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Env from 'tinymce/core/api/Env';
import Plugin from 'tinymce/plugins/lists/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.plugins.lists.ApplyTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'lists',
    add_unload_trigger: false,
    disable_nodechange: true,
    indent: false,
    entities: 'raw',
    valid_elements:
      'li[style|class|data-custom|data-custom1|data-custom2],ol[style|class|data-custom|data-custom1|data-custom2],' +
      'ul[style|class|data-custom|data-custom1|data-custom2],dl,dt,dd,em,strong,span,#p,div,br',
    valid_styles: {
      '*': 'color,font-size,font-family,background-color,font-weight,' +
        'font-style,text-decoration,float,margin,margin-top,margin-right,' +
        'margin-bottom,margin-left,display,position,top,left,list-style-type'
    },
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin, Theme ]);

  it('TBA: Apply UL list to single P', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p>');

    LegacyUnit.setSelection(editor, 'p', 0);
    editor.execCommand('InsertUnorderedList');

    TinyAssertions.assertContent(editor, '<ul><li>a</li></ul>');
    assert.equal(editor.selection.getNode().nodeName, 'LI');
  });

  it('TBA: Apply UL list to single empty P', () => {
    const editor = hook.editor();
    editor.setContent(LegacyUnit.trimBrs('<p><br></p>'), { format: 'raw' });

    LegacyUnit.setSelection(editor, 'p', 0);
    editor.execCommand('InsertUnorderedList');

    assert.equal(LegacyUnit.trimBrs(editor.getContent({ format: 'raw' })), '<ul><li></li></ul>');
    assert.equal(editor.selection.getNode().nodeName, 'LI');
  });

  it('TBA: Apply UL list to multiple Ps', () => {
    const editor = hook.editor();
    editor.setContent(
      '<p>a</p>' +
      '<p>b</p>' +
      '<p>c</p>'
    );

    LegacyUnit.setSelection(editor, 'p', 0, 'p:last', 0);
    editor.execCommand('InsertUnorderedList');

    TinyAssertions.assertContent(editor,
      '<ul>' +
      '<li>a</li>' +
      '<li>b</li>' +
      '<li>c</li>' +
      '</ul>'
    );
    assert.equal(editor.selection.getStart().nodeName, 'LI');
  });

  it('TBA: Apply OL list to single P', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p>');

    LegacyUnit.setSelection(editor, 'p', 0);
    editor.execCommand('InsertOrderedList');

    TinyAssertions.assertContent(editor, '<ol><li>a</li></ol>');
    LegacyUnit.equal(editor.selection.getNode().nodeName, 'LI');
  });

  it('TBA: Apply OL list to single empty P', () => {
    const editor = hook.editor();
    editor.setContent(LegacyUnit.trimBrs('<p><br></p>'), { format: 'raw' });

    LegacyUnit.setSelection(editor, 'p', 0);
    editor.execCommand('InsertOrderedList');

    TinyAssertions.assertContent(editor, '<ol><li></li></ol>');
    assert.equal(editor.selection.getNode().nodeName, 'LI');
  });

  it('TBA: Apply OL list to multiple Ps', () => {
    const editor = hook.editor();
    editor.setContent(
      '<p>a</p>' +
      '<p>b</p>' +
      '<p>c</p>'
    );

    LegacyUnit.setSelection(editor, 'p', 0, 'p:last', 0);
    editor.execCommand('InsertOrderedList');

    TinyAssertions.assertContent(
      editor,
      '<ol>' +
      '<li>a</li>' +
      '<li>b</li>' +
      '<li>c</li>' +
      '</ol>'
    );
    assert.equal(editor.selection.getStart().nodeName, 'LI');
  });

  it('TBA: Apply OL to UL list', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ul>' +
      '<li>a</li>' +
      '<li>b</li>' +
      '<li>c</li>' +
      '</ul>'
    );

    LegacyUnit.setSelection(editor, 'li', 0, 'li:last', 0);
    editor.execCommand('InsertOrderedList');

    TinyAssertions.assertContent(
      editor,
      '<ol>' +
      '<li>a</li>' +
      '<li>b</li>' +
      '<li>c</li>' +
      '</ol>'
    );
    assert.equal(editor.selection.getStart().nodeName, 'LI');
  });

  it('Apply OL to UL list with collapsed selection', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ul>' +
      '<li>a</li>' +
      '<li>b</li>' +
      '<li>c</li>' +
      '</ul>'
    );

    LegacyUnit.setSelection(editor, 'li:nth-child(2)', 0);
    editor.execCommand('InsertOrderedList');

    TinyAssertions.assertContent(
      editor,
      '<ol>' +
      '<li>a</li>' +
      '<li>b</li>' +
      '<li>c</li>' +
      '</ol>'
    );
    assert.equal(editor.selection.getStart().nodeName, 'LI');
  });

  it('TBA: Apply UL to OL list', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ol>' +
      '<li>a</li>' +
      '<li>b</li>' +
      '<li>c</li>' +
      '</ol>'
    );

    LegacyUnit.setSelection(editor, 'li', 0, 'li:last', 0);
    editor.execCommand('InsertUnorderedList');

    TinyAssertions.assertContent(
      editor,
      '<ul>' +
      '<li>a</li>' +
      '<li>b</li>' +
      '<li>c</li>' +
      '</ul>'
    );
    assert.equal(editor.selection.getStart().nodeName, 'LI');
  });

  it('TBA: Apply UL to OL list collapsed selection', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ol>' +
      '<li>a</li>' +
      '<li>b</li>' +
      '<li>c</li>' +
      '</ol>'
    );

    LegacyUnit.setSelection(editor, 'li:nth-child(2)', 0);
    editor.execCommand('InsertUnorderedList');

    TinyAssertions.assertContent(
      editor,
      '<ul>' +
      '<li>a</li>' +
      '<li>b</li>' +
      '<li>c</li>' +
      '</ul>'
    );
    assert.equal(editor.selection.getStart().nodeName, 'LI');
  });

  it('TBA: Apply UL to P and merge with adjacent lists', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ul>' +
      '<li>a</li>' +
      '</ul>' +
      '<p>b</p>' +
      '<ul>' +
      '<li>c</li>' +
      '</ul>'
    );

    LegacyUnit.setSelection(editor, 'p', 1);
    editor.execCommand('InsertUnorderedList');

    TinyAssertions.assertContent(
      editor,
      '<ul>' +
      '<li>a</li>' +
      '<li>b</li>' +
      '<li>c</li>' +
      '</ul>'
    );
    assert.equal(editor.selection.getStart().nodeName, 'LI');
  });

  it('TBA: Apply UL to OL and merge with adjacent lists', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ul>' +
      '<li>a</li>' +
      '</ul>' +
      '<ol><li>b</li></ol>' +
      '<ul>' +
      '<li>c</li>' +
      '</ul>'
    );

    LegacyUnit.setSelection(editor, 'ol li', 1);
    editor.execCommand('InsertUnorderedList');

    TinyAssertions.assertContent(
      editor,
      '<ul>' +
      '<li>a</li>' +
      '<li>b</li>' +
      '<li>c</li>' +
      '</ul>'
    );
    assert.equal(editor.selection.getStart().nodeName, 'LI');
  });

  it('TBA: Apply OL to P and merge with adjacent lists', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ol>' +
      '<li>a</li>' +
      '</ol>' +
      '<p>b</p>' +
      '<ol>' +
      '<li>c</li>' +
      '</ol>'
    );

    LegacyUnit.setSelection(editor, 'p', 1);
    editor.execCommand('InsertOrderedList');

    TinyAssertions.assertContent(
      editor,
      '<ol>' +
      '<li>a</li>' +
      '<li>b</li>' +
      '<li>c</li>' +
      '</ol>'
    );
    assert.equal(editor.selection.getStart().nodeName, 'LI');
  });

  it('TBA: Apply OL to UL and merge with adjacent lists', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ol>' +
      '<li>1a</li>' +
      '<li>1b</li>' +
      '</ol>' +
      '<ul><li>2a</li><li>2b</li></ul>' +
      '<ol>' +
      '<li>3a</li>' +
      '<li>3b</li>' +
      '</ol>'
    );

    LegacyUnit.setSelection(editor, 'ul li', 1);
    editor.execCommand('InsertOrderedList');

    TinyAssertions.assertContent(
      editor,
      '<ol>' +
      '<li>1a</li>' +
      '<li>1b</li>' +
      '<li>2a</li>' +
      '<li>2b</li>' +
      '<li>3a</li>' +
      '<li>3b</li>' +
      '</ol>'
    );
    assert.equal(editor.selection.getStart().nodeName, 'LI');
  });

  it('Apply OL to UL and DO not merge with adjacent lists because styles are different (exec has style)', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ol>' +
      '<li>a</li>' +
      '</ol>' +
      '<ul><li>b</li></ul>' +
      '<ol>' +
      '<li>c</li>' +
      '</ol>'
    );

    LegacyUnit.setSelection(editor, 'ul li', 1);
    editor.execCommand('InsertOrderedList', null, { 'list-style-type': 'lower-alpha' });

    TinyAssertions.assertContent(
      editor,
      '<ol>' +
      '<li>a</li>' +
      '</ol>' +
      '<ol style="list-style-type: lower-alpha;"><li>b</li></ol>' +
      '<ol>' +
      '<li>c</li>' +
      '</ol>'
    );
    assert.equal(editor.selection.getStart().nodeName, 'LI');
  });

  it('Apply OL to P and DO not merge with adjacent lists because styles are different (exec has style)', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ol>' +
      '<li>a</li>' +
      '</ol>' +
      '<p>b</p>' +
      '<ol>' +
      '<li>c</li>' +
      '</ol>'
    );

    LegacyUnit.setSelection(editor, 'p', 1);
    editor.execCommand('InsertOrderedList', null, { 'list-style-type': 'lower-alpha' });

    TinyAssertions.assertContent(
      editor,
      '<ol>' +
      '<li>a</li>' +
      '</ol>' +
      '<ol style="list-style-type: lower-alpha;"><li>b</li></ol>' +
      '<ol>' +
      '<li>c</li>' +
      '</ol>'
    );
    assert.equal(editor.selection.getStart().nodeName, 'LI');
  });

  it('Apply OL to UL and DO not merge with adjacent lists because styles are different (original has style)', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ol style="list-style-type: upper-roman;">' +
      '<li>a</li>' +
      '</ol>' +
      '<ul><li>b</li></ul>' +
      '<ol style="list-style-type: upper-roman;">' +
      '<li>c</li>' +
      '</ol>'
    );

    LegacyUnit.setSelection(editor, 'ul li', 1);
    editor.execCommand('InsertOrderedList');

    TinyAssertions.assertContent(
      editor,
      '<ol style="list-style-type: upper-roman;">' +
      '<li>a</li>' +
      '</ol>' +
      '<ol><li>b</li></ol>' +
      '<ol style="list-style-type: upper-roman;">' +
      '<li>c</li>' +
      '</ol>'
    );
    assert.equal(editor.selection.getStart().nodeName, 'LI');
  });

  it('Apply OL to UL should merge with adjacent lists because styles are the same (both have roman)', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ol style="list-style-type: upper-roman;">' +
      '<li>a</li>' +
      '</ol>' +
      '<ul><li>b</li></ul>' +
      '<ol style="list-style-type: upper-roman;">' +
      '<li>c</li>' +
      '</ol>'
    );

    LegacyUnit.setSelection(editor, 'ul li', 1);
    editor.execCommand('InsertOrderedList', false, { 'list-style-type': 'upper-roman' });

    TinyAssertions.assertContent(
      editor,
      '<ol style="list-style-type: upper-roman;">' +
      '<li>a</li>' +
      '<li>b</li>' +
      '<li>c</li>' +
      '</ol>'
    );
    assert.equal(editor.selection.getStart().nodeName, 'LI');
  });

  it('Apply OL to UL should merge with above list because styles are the same (both have lower-roman), but not below list', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ol style="list-style-type: lower-roman;">' +
      '<li>a</li>' +
      '</ol>' +
      '<ul><li>b</li></ul>' +
      '<ol style="list-style-type: upper-roman;">' +
      '<li>c</li>' +
      '</ol>'
    );

    LegacyUnit.setSelection(editor, 'ul li', 1);
    editor.execCommand('InsertOrderedList', false, { 'list-style-type': 'lower-roman' });

    TinyAssertions.assertContent(
      editor,
      '<ol style="list-style-type: lower-roman;">' +
      '<li>a</li>' +
      '<li>b</li>' +
      '</ol>' +
      '<ol style="list-style-type: upper-roman;">' +
      '<li>c</li>' +
      '</ol>'
    );
    assert.equal(editor.selection.getStart().nodeName, 'LI');
  });

  it('Apply OL to UL should merge with below lists because styles are the same (both have roman), but not above list', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ol style="list-style-type: upper-roman;">' +
      '<li>a</li>' +
      '</ol>' +
      '<ul><li>b</li></ul>' +
      '<ol style="list-style-type: lower-roman;">' +
      '<li>c</li>' +
      '</ol>'
    );

    LegacyUnit.setSelection(editor, 'ul li', 1);
    editor.execCommand('InsertOrderedList', false, { 'list-style-type': 'lower-roman' });

    TinyAssertions.assertContent(
      editor,
      '<ol style="list-style-type: upper-roman;">' +
      '<li>a</li>' +
      '</ol>' +
      '<ol style="list-style-type: lower-roman;">' +
      '<li>b</li>' +
      '<li>c</li>' +
      '</ol>'
    );
    assert.equal(editor.selection.getStart().nodeName, 'LI');
  });

  it('Apply OL to UL and DO not merge with adjacent lists because classes are different', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ol class="a">' +
      '<li>a</li>' +
      '</ol>' +
      '<ul><li>b</li></ul>' +
      '<ol class="b">' +
      '<li>c</li>' +
      '</ol>'
    );

    LegacyUnit.setSelection(editor, 'ul li', 1);
    editor.execCommand('InsertOrderedList');

    TinyAssertions.assertContent(
      editor,
      '<ol class="a">' +
      '<li>a</li>' +
      '</ol>' +
      '<ol><li>b</li></ol>' +
      '<ol class="b">' +
      '<li>c</li>' +
      '</ol>'
    );
    assert.equal(editor.selection.getStart().nodeName, 'LI');
  });

  it('TBA: Apply UL list to single text line', () => {
    const editor = hook.editor();
    editor.settings.forced_root_block = false;
    editor.setContent('a');

    LegacyUnit.setSelection(editor, 'body', 0);
    editor.execCommand('InsertUnorderedList');

    TinyAssertions.assertContent(editor, '<ul><li>a</li></ul>');
    assert.equal(editor.selection.getNode().nodeName, 'LI');

    editor.settings.forced_root_block = 'p';
  });

  it('TBA: Apply UL list to single text line with BR', () => {
    const editor = hook.editor();
    editor.settings.forced_root_block = false;
    editor.setContent('a<br>');

    LegacyUnit.setSelection(editor, 'body', 0);
    editor.execCommand('InsertUnorderedList');

    TinyAssertions.assertContent(editor, '<ul><li>a</li></ul>');
    assert.equal(editor.selection.getNode().nodeName, 'LI');

    editor.settings.forced_root_block = 'p';
  });

  it('TBA: Apply UL list to multiple lines separated by BR', () => {
    const editor = hook.editor();
    editor.settings.forced_root_block = false;

    editor.setContent(
      'a<br>' +
      'b<br>' +
      'c',
      { format: 'raw' }
    );

    editor.execCommand('SelectAll');
    editor.execCommand('InsertUnorderedList');

    TinyAssertions.assertContent(
      editor,
      '<ul>' +
      '<li>a</li>' +
      '<li>b</li>' +
      '<li>c</li>' +
      '</ul>'
    );
    assert.equal(editor.selection.getStart().nodeName, 'LI');

    editor.settings.forced_root_block = 'p';
  });

  it('Apply UL list to multiple lines separated by BR and with trailing BR', () => {
    const editor = hook.editor();
    editor.settings.forced_root_block = false;

    editor.setContent(
      'a<br>' +
      'b<br>' +
      'c<br>',
      { format: 'raw' }
    );

    editor.execCommand('SelectAll');
    editor.execCommand('InsertUnorderedList');

    TinyAssertions.assertContent(
      editor,
      '<ul>' +
      '<li>a</li>' +
      '<li>b</li>' +
      '<li>c</li>' +
      '</ul>'
    );
    assert.equal(editor.selection.getStart().nodeName, 'LI');
  });

  it('TBA: Apply UL list to multiple formatted lines separated by BR', () => {
    const editor = hook.editor();
    editor.settings.forced_root_block = false;

    editor.setContent(
      '<strong>a</strong><br>' +
      '<span>b</span><br>' +
      '<em>c</em>',
      { format: 'raw' }
    );

    LegacyUnit.setSelection(editor, 'strong', 0, 'em', 0);
    editor.execCommand('InsertUnorderedList');

    TinyAssertions.assertContent(
      editor,
      '<ul>' +
      '<li><strong>a</strong></li>' +
      '<li><span>b</span></li>' +
      '<li><em>c</em></li>' +
      '</ul>'
    );

    assert.equal(editor.selection.getStart().nodeName, 'STRONG');
    // Old IE will return the end LI not a big deal
    assert.equal(editor.selection.getEnd().nodeName, Env.ie && Env.ie < 9 ? 'LI' : 'EM');
  });

  it('TBA: Apply UL list to br line and text block line', () => {
    const editor = hook.editor();
    editor.settings.forced_root_block = false;

    editor.setContent(
      'a' +
      '<p>b</p>'
    );

    const rng = editor.dom.createRng();
    rng.setStart(editor.getBody().firstChild, 0);
    rng.setEnd(editor.getBody().lastChild.firstChild, 1);
    editor.selection.setRng(rng);

    editor.execCommand('InsertUnorderedList');
    TinyAssertions.assertContent(
      editor,
      '<ul>' +
      '<li>a</li>' +
      '<li>b</li>' +
      '</ul>'
    );

    assert.equal(editor.selection.getStart().nodeName, 'LI');
    assert.equal(editor.selection.getEnd().nodeName, 'LI');
  });

  it('TBA: Apply UL list to text block line and br line', () => {
    const editor = hook.editor();
    editor.settings.forced_root_block = false;

    editor.setContent(
      '<p>a</p>' +
      'b'
    );

    const rng = editor.dom.createRng();
    rng.setStart(editor.getBody().firstChild.firstChild, 0);
    rng.setEnd(editor.getBody().lastChild, 1);
    editor.selection.setRng(rng);

    editor.execCommand('InsertUnorderedList');
    TinyAssertions.assertContent(
      editor,
      '<ul>' +
      '<li>a</li>' +
      '<li>b</li>' +
      '</ul>'
    );

    assert.equal(editor.selection.getStart().nodeName, 'LI');
    assert.equal(editor.selection.getEnd().nodeName, 'LI');
  });

  it('TBA: Apply UL list to all BR lines (SelectAll)', () => {
    const editor = hook.editor();
    editor.settings.forced_root_block = false;

    editor.setContent(
      'a<br>' +
      'b<br>' +
      'c<br>',
      { format: 'raw' }
    );

    editor.execCommand('SelectAll');
    editor.execCommand('InsertUnorderedList');

    TinyAssertions.assertContent(
      editor,
      '<ul>' +
      '<li>a</li>' +
      '<li>b</li>' +
      '<li>c</li>' +
      '</ul>'
    );

    editor.settings.forced_root_block = 'p';
  });

  it('TBA: Apply UL list to all P lines (SelectAll)', () => {
    const editor = hook.editor();
    editor.setContent(
      '<p>a</p>' +
      '<p>b</p>' +
      '<p>c</p>'
    );

    editor.execCommand('SelectAll');
    editor.execCommand('InsertUnorderedList');

    TinyAssertions.assertContent(
      editor,
      '<ul>' +
      '<li>a</li>' +
      '<li>b</li>' +
      '<li>c</li>' +
      '</ul>'
    );
  });

  it('TBA: Apply UL list to more than two paragraphs', () => {
    const editor = hook.editor();
    editor.setContent(
      '<p>a</p>' +
      '<p>b</p>' +
      '<p>c</p>'
    );

    LegacyUnit.setSelection(editor, 'p:nth-child(1)', 0, 'p:nth-child(3)', 1);
    editor.execCommand('InsertUnorderedList', false, { 'list-style-type': null });

    TinyAssertions.assertContent(editor, '<ul><li>a</li><li>b</li><li>c</li></ul>');
  });

  it('TBA: Apply UL with custom attributes', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p>');

    LegacyUnit.setSelection(editor, 'p', 0);
    editor.execCommand('InsertUnorderedList', false, {
      'list-attributes': {
        'class': 'a',
        'data-custom': 'c1'
      }
    });

    TinyAssertions.assertContent(editor, '<ul class="a" data-custom="c1"><li>a</li></ul>');
  });

  it('TBA: Apply UL and LI with custom attributes', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p>');

    LegacyUnit.setSelection(editor, 'p', 0);
    editor.execCommand('InsertUnorderedList', false, {
      'list-attributes': {
        'class': 'a',
        'data-custom': 'c1'
      },

      'list-item-attributes': {
        'class': 'b',
        'data-custom1': 'c2',
        'data-custom2': ''
      }
    });

    TinyAssertions.assertContent(
      editor,
      '<ul class="a" data-custom="c1"><li class="b" data-custom1="c2" data-custom2="">a</li></ul>'
    );
  });

  it('TBA: Handle one empty unordered list items without error', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ul>' +
      '<li>a</li>' +
      '<li>b</li>' +
      '<li></li>' +
      '</ul>'
    );

    editor.execCommand('SelectAll');
    LegacyUnit.setSelection(editor, 'li:first', 0, 'li:last', 0);
    editor.execCommand('InsertUnorderedList');

    TinyAssertions.assertRawContent(
      editor,
      '<p>a</p>' +
      '<p>b</p>' +
      '<p><br data-mce-bogus="1"></p>'
    );
  });

  it('TBA: Handle several empty unordered list items without error', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ul>' +
      '<li>a</li>' +
      '<li>b</li>' +
      '<li></li>' +
      '<li>c</li>' +
      '<li></li>' +
      '<li>d</li>' +
      '<li></li>' +
      '<li>e</li>' +
      '</ul>'
    );

    LegacyUnit.setSelection(editor, 'li:first', 0, 'li:last', 0);
    editor.execCommand('InsertUnorderedList');

    TinyAssertions.assertRawContent(
      editor,
      '<p>a</p>' +
      '<p>b</p>' +
      '<p><br data-mce-bogus=\"1\"></p>' +
      '<p>c</p>' +
      '<p><br data-mce-bogus=\"1\"></p>' +
      '<p>d</p>' +
      '<p><br data-mce-bogus=\"1\"></p>' +
      '<p>e</p>'
    );
  });

  it('TBA: Handle one empty ordered list items without error', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ol>' +
      '<li>a</li>' +
      '<li>b</li>' +
      '<li></li>' +
      '</ol>'
    );

    editor.execCommand('SelectAll');
    LegacyUnit.setSelection(editor, 'li:first', 0, 'li:last', 0);
    editor.execCommand('InsertOrderedList');

    TinyAssertions.assertRawContent(
      editor,
      '<p>a</p>' +
      '<p>b</p>' +
      '<p><br data-mce-bogus="1"></p>'
    );
  });

  it('TBA: Handle several empty ordered list items without error', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ol>' +
      '<li>a</li>' +
      '<li>b</li>' +
      '<li></li>' +
      '<li>c</li>' +
      '<li></li>' +
      '<li>d</li>' +
      '<li></li>' +
      '<li>e</li>' +
      '</ol>'
    );

    LegacyUnit.setSelection(editor, 'li:first', 0, 'li:last', 0);
    editor.execCommand('InsertOrderedList');

    TinyAssertions.assertRawContent(
      editor,
      '<p>a</p>' +
      '<p>b</p>' +
      '<p><br data-mce-bogus=\"1\"></p>' +
      '<p>c</p>' +
      '<p><br data-mce-bogus=\"1\"></p>' +
      '<p>d</p>' +
      '<p><br data-mce-bogus=\"1\"></p>' +
      '<p>e</p>'
    );
  });

  it('TBA: Apply list on paragraphs with list between', () => {
    const editor = hook.editor();
    editor.setContent(
      '<p>a</p>' +
      '<ol>' +
      '<li>b</li>' +
      '</ol>' +
      '<p>c</p>'
    );

    editor.execCommand('SelectAll');
    editor.execCommand('InsertUnorderedList');
    TinyAssertions.assertRawContent(editor, '<ul><li>a</li></ul><ul><li>b</li></ul><ul><li>c</li></ul>');
  });

  it('TBA: Apply unordered list on children on a fully selected ordered list', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ol>' +
        '<li>a' +
          '<ol>' +
            '<li>b</li>' +
          '</ol>' +
        '</li>' +
        '<li>c</li>' +
      '</ol>'
    );

    editor.execCommand('SelectAll');
    editor.execCommand('InsertUnorderedList');
    TinyAssertions.assertRawContent(editor, '<ul><li>a<ul><li>b</li></ul></li><li>c</li></ul>');
  });

  it('TBA: Apply unordered list on empty table cell', () => {
    const editor = hook.editor();
    editor.setContent(
      '<table>' +
        '<tbody>' +
          '<tr>' +
            '<td>' +
              '<br>' +
            '</td>' +
          '</tr>' +
        '</tbody>' +
      '</table>',
      { format: 'raw' }
    );

    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('td')[0], 0);
    rng.setEnd(editor.dom.select('td')[0], 1);
    editor.selection.setRng(rng);

    editor.execCommand('InsertUnorderedList');
    TinyAssertions.assertRawContent(editor, '<table class="mce-item-table"><tbody><tr><td><ul><li><br></li></ul></td></tr></tbody></table>');
  });

  it('TBA: Apply unordered list on table cell with two lines br', () => {
    const editor = hook.editor();
    editor.setContent(
      '<table>' +
        '<tbody>' +
          '<tr>' +
            '<td>' +
              'a<br>b' +
            '</td>' +
          '</tr>' +
        '</tbody>' +
      '</table>',
      { format: 'raw' }
    );

    const rng = editor.dom.createRng();
    rng.setStart(editor.dom.select('td')[0].firstChild, 0);
    rng.setEnd(editor.dom.select('td')[0].firstChild, 0);
    editor.selection.setRng(rng);

    editor.execCommand('InsertUnorderedList');
    TinyAssertions.assertRawContent(
      editor,
      '<table class="mce-item-table"><tbody><tr><td><ul><li>a</li></ul>b</td></tr></tbody></table>'
    );
  });

  it('TBA: Apply UL list to single P with forced_root_block_attrs', () => {
    const editor = hook.editor();
    editor.settings.forced_root_block = 'p';
    editor.settings.forced_root_block_attrs = {
      'data-editor': '1'
    };

    editor.setContent(
      '<p data-editor="1">a</p>',
      { format: 'raw' }
    );

    LegacyUnit.setSelection(editor, 'p', 0);
    editor.execCommand('InsertUnorderedList');

    TinyAssertions.assertRawContent(editor, '<ul><li data-editor="1">a</li></ul>');
    assert.equal(editor.selection.getNode().nodeName, 'LI');

    editor.settings.forced_root_block = 'p';
    delete editor.settings.forced_root_block_attrs;
  });

  it('TINY-3755: Lists: Apply list on mix of existing lists and other text blocks', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ol>' +
        '<li>a</li>' +
        '<li>b' +
        '<ol>' +
          '<li>c</li>' +
          '<li>d</li>' +
          '<li>e</li>' +
        '</ol>' +
        '</li>' +
        '<li>f</li>' +
        '<li>g</li>' +
      '</ol>' +
      '<p>text1<br>text2<br>text3</p>' +
      '<p>text4<br>text5<br>text6</p>' +
      '<ul>' +
        '<li>h</li>' +
        '<li>i<br>j' +
        '<ul>' +
          '<li>k' +
            '<ul>' +
              '<li>l</li>' +
            '</ul>' +
          '</li>' +
          '<li>m</li>' +
        '</ul>' +
        '</li>' +
        '<li>n</li>' +
      '</ul>'
    );
    editor.execCommand('SelectAll');
    editor.execCommand('InsertUnorderedList');
    const expected = (
      '<ul>' +
        '<li>a</li>' +
        '<li>b' +
        '<ul>' +
          '<li>c</li>' +
          '<li>d</li>' +
          '<li>e</li>' +
        '</ul>' +
        '</li>' +
        '<li>f</li>' +
        '<li>g</li>' +
      '</ul>' +
      '<ul>' +
        '<li>text1<br>text2<br>text3</li>' +
        '<li>text4<br>text5<br>text6</li>' +
        '<li>h</li>' +
        '<li>i<br>j' +
        '<ul>' +
          '<li>k' +
            '<ul>' +
              '<li>l</li>' +
            '</ul>' +
          '</li>' +
          '<li>m</li>' +
        '</ul>' +
        '</li>' +
        '<li>n</li>' +
      '</ul>'
    );
    TinyAssertions.assertRawContent(editor, expected);
  });

  it('TINY-3755: Lists: Apply lists with selection start and end on text blocks', () => {
    const editor = hook.editor();
    editor.setContent(
      '<p>&nbsp;</p>' +
      '<ul>' +
        '<li>one</li>' +
        '<li>two</li>' +
        '<li>three</li>' +
      '</ul>' +
      '<ol>' +
        '<li>four</li>' +
        '<li>five</li>' +
        '<li>six</li>' +
      '</ol>' +
      '<p>After</p>',
      { format: 'raw' }
    );
    editor.execCommand('SelectAll');
    editor.execCommand('InsertUnorderedList');
    const expected = (
      '<ul>' +
        '<li>&nbsp;</li>' +
        '<li>one</li>' +
        '<li>two</li>' +
        '<li>three</li>' +
      '</ul>' +
      '<ul>' +
        '<li>four</li>' +
        '<li>five</li>' +
        '<li>six</li>' +
      '</ul>' +
      '<ul>' +
        '<li>After</li>' +
      '</ul>'
    );
    TinyAssertions.assertRawContent(editor, expected);
  });
});
