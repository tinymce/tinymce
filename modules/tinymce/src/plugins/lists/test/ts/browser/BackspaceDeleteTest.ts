import { describe, it } from '@ephox/bedrock-client';
import { LegacyUnit, TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/lists/Plugin';

describe('browser.tinymce.plugins.lists.BackspaceDeleteTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'lists',
    add_unload_trigger: false,
    disable_nodechange: true,
    indent: false,
    entities: 'raw',
    valid_elements:
      'li[style|class|data-custom],ol[style|class|data-custom],' +
      'ul[style|class|data-custom],dl,dt,dd,em,strong,span,#p,div[contenteditable],br,details,summary',
    valid_styles: {
      '*': 'color,font-size,font-family,background-color,font-weight,' +
        'font-style,text-decoration,float,margin,margin-top,margin-right,' +
        'margin-bottom,margin-left,display,position,top,left,list-style-type'
    },
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ]);

  it('TBA: Backspace at beginning of single LI in UL', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ul>' +
      '<li>a</li>' +
      '</ul>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'li', 0);
    editor.plugins.lists.backspaceDelete();

    TinyAssertions.assertContent(editor, '<p>a</p>');

    assert.equal(editor.selection.getNode().nodeName, 'P');
  });

  it('TBA: Backspace at end of single LI in UL', () => {
    const editor = hook.editor();
    const content = '<ul><li><span>a</span></li></ul>';
    editor.setContent(content);

    editor.focus();
    // Special set rng, puts selection here: <li><span>a</span>|</li>
    const li = editor.dom.select('li')[0];
    const rng = editor.dom.createRng();
    rng.setStart(li, 1);
    rng.setEnd(li, 1);
    editor.selection.setRng(rng);

    editor.plugins.lists.backspaceDelete();

    // The content doesn't change here as it's not a real backspace, we're just ensuring the "delete list" code doesn't fire
    TinyAssertions.assertContent(editor, content);

    assert.equal(editor.selection.getNode().nodeName, 'LI');
  });

  it('TBA: Backspace at end of single LI in UL with STRONG', () => {
    const editor = hook.editor();
    const content = '<ul><li><span>a</span><strong>b</strong></li></ul>';
    editor.setContent(content);

    editor.focus();
    // Special set rng, puts selection here: <li><span>a</span><strong>|b</strong></li>
    const strong = editor.dom.select('strong')[0];
    const rng = editor.dom.createRng();
    rng.setStart(strong, 0);
    rng.setEnd(strong, 0);
    editor.selection.setRng(rng);

    editor.plugins.lists.backspaceDelete();

    // The content doesn't change here as it's not a real backspace, we're just ensuring the "delete list" code doesn't fire
    TinyAssertions.assertContent(editor, content);

    assert.equal(editor.selection.getNode().nodeName, 'STRONG');
  });

  it('TBA: Backspace at beginning of first LI in UL', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ul>' +
      '<li>a</li>' +
      '<li>b</li>' +
      '</ul>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'li', 0);
    editor.plugins.lists.backspaceDelete();

    TinyAssertions.assertContent(editor,
      '<p>a</p>' +
      '<ul>' +
      '<li>b</li>' +
      '</ul>'
    );

    assert.equal(editor.selection.getNode().nodeName, 'P');
  });

  it('TBA: Backspace at beginning of middle LI in UL', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ul>' +
      '<li>a</li>' +
      '<li>b</li>' +
      '<li>c</li>' +
      '</ul>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'li:nth-child(2)', 0);
    editor.plugins.lists.backspaceDelete();

    TinyAssertions.assertContent(editor,
      '<ul>' +
      '<li>ab</li>' +
      '<li>c</li>' +
      '</ul>'
    );

    assert.equal(editor.selection.getNode().nodeName, 'LI');
  });

  it('TBA: Backspace at beginning of start LI in UL inside UL', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ul>' +
      '<li>a' +
      '<ul>' +
      '<li>b</li>' +
      '<li>c</li>' +
      '</ul>' +
      '</li>' +
      '</ul>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'li li', 0);
    editor.plugins.lists.backspaceDelete();

    TinyAssertions.assertContent(editor,
      '<ul>' +
      '<li>a</li>' +
      '<li>b' +
      '<ul>' +
      '<li>c</li>' +
      '</ul>' +
      '</li>' +
      '</ul>'
    );

    assert.equal(editor.selection.getNode().nodeName, 'LI');
  });

  it('TBA: Backspace at beginning of middle LI in UL inside UL', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ul>' +
      '<li>a' +
      '<ul>' +
      '<li>b</li>' +
      '<li>c</li>' +
      '<li>d</li>' +
      '</ul>' +
      '</li>' +
      '</ul>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'li li:nth-child(2)', 0);
    editor.plugins.lists.backspaceDelete();

    TinyAssertions.assertContent(editor,
      '<ul>' +
      '<li>a' +
      '<ul>' +
      '<li>bc</li>' +
      '<li>d</li>' +
      '</ul>' +
      '</li>' +
      '</ul>'
    );

    assert.equal(editor.selection.getNode().nodeName, 'LI');
  });

  it('TBA: Backspace at beginning of LI with empty LI above in UL', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ul>' +
      '<li>a</li>' +
      '<li></li>' +
      '<li>b</li>' +
      '</ul>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'li:nth-child(3)', 0);
    editor.plugins.lists.backspaceDelete();

    TinyAssertions.assertContent(editor,
      '<ul>' +
      '<li>a</li>' +
      '<li>b</li>' +
      '</ul>'
    );

    assert.equal(editor.selection.getNode().innerHTML, 'b');
  });

  it('TBA: Backspace at beginning of LI with BR padded empty LI above in UL', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ul>' +
      '<li>a</li>' +
      '<li><br></li>' +
      '<li>b</li>' +
      '</ul>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'li:nth-child(3)', 0);
    editor.plugins.lists.backspaceDelete();

    TinyAssertions.assertContent(editor,
      '<ul>' +
      '<li>a</li>' +
      '<li>b</li>' +
      '</ul>'
    );

    assert.equal(editor.selection.getNode().innerHTML, 'b');
  });

  it('TBA: Backspace at empty LI (IE)', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ul>' +
      '<li>a</li>' +
      '<li></li>' +
      '<li>b</li>' +
      '</ul>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'li:nth-child(2)', 0);
    editor.plugins.lists.backspaceDelete();

    TinyAssertions.assertContent(editor,
      '<ul>' +
      '<li>a</li>' +
      '<li>b</li>' +
      '</ul>'
    );

    assert.equal(editor.selection.getNode().innerHTML, 'a');
  });

  it('TBA: Backspace at beginning of LI with empty LI with STRING and BR above in UL', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ul>' +
      '<li>a</li>' +
      '<li><strong><br></strong></li>' +
      '<li>b</li>' +
      '</ul>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'li:nth-child(3)', 0);
    editor.plugins.lists.backspaceDelete();

    TinyAssertions.assertContent(editor,
      '<ul>' +
      '<li>a</li>' +
      '<li>b</li>' +
      '</ul>'
    );

    assert.equal(editor.selection.getNode().innerHTML, 'b');
  });

  it('TBA: Backspace at nested LI with adjacent BR', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ul>' +
      '<li>1' +
      '<ul>' +
      '<li>' +
      '<br>' +
      '<ul>' +
      '<li>2</li>' +
      '</ul>' +
      '</li>' +
      '</ul>' +
      '</li>' +
      '<li>3</li>' +
      '</ul>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'ul ul ul li', 0);
    editor.plugins.lists.backspaceDelete();

    TinyAssertions.assertContent(editor, '<ul><li>1<ul><li></li><li>2</li></ul></li><li>3</li></ul>');
    assert.equal(editor.selection.getNode().nodeName, 'LI');
  });

  it('TBA: Backspace at LI selected with triple-click in UL', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ul>' +
      '<li>a</li>' +
      '<li>b' +
      '<ul>' +
      '<li>c</li>' +
      '<li>d</li>' +
      '</ul>' +
      '</li>' +
      '</ul>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'li:nth-child(1)', 0, 'li:nth-child(2)', 0);
    editor.plugins.lists.backspaceDelete();

    TinyAssertions.assertContent(
      editor,
      '<ul>' +
      '<li>b' +
      '<ul>' +
      '<li>c</li>' +
      '<li>d</li>' +
      '</ul>' +
      '</li>' +
      '</ul>'
    );

    assert.equal(editor.selection.getNode().nodeName, 'LI');
  });

  it('TBA: Backspace at partially selected list', () => {
    const editor = hook.editor();
    editor.setContent(
      '<p>abc</p>' +
      '<ul>' +
      '<li>a</li>' +
      '<li>b' +
      '<ul>' +
      '<li>c</li>' +
      '<li>d</li>' +
      '</ul>' +
      '</li>' +
      '</ul>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'p', 1, 'li:nth-child(2)', 0);
    editor.plugins.lists.backspaceDelete();

    TinyAssertions.assertContent(
      editor,
      '<p>ab</p>' +
      '<ul>' +
      '<li style="list-style-type: none;">' +
      '<ul>' +
      '<li>c</li>' +
      '<li>d</li>' +
      '</ul>' +
      '</li>' +
      '</ul>'
    );

    assert.equal(editor.selection.getNode().nodeName, 'P');
  });

  // Delete

  it('TBA: Delete at end of single LI in UL', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ul>' +
      '<li>a</li>' +
      '</ul>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'li', 1);
    editor.plugins.lists.backspaceDelete(true);

    TinyAssertions.assertContent(editor,
      '<ul>' +
      '<li>a</li>' +
      '</ul>'
    );

    assert.equal(editor.selection.getNode().nodeName, 'LI');
  });

  it('TBA: Delete at end of first LI in UL', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ul>' +
      '<li>a</li>' +
      '<li>b</li>' +
      '</ul>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'li', 1);
    editor.plugins.lists.backspaceDelete(true);

    TinyAssertions.assertContent(editor,
      '<ul>' +
      '<li>ab</li>' +
      '</ul>'
    );

    assert.equal(editor.selection.getNode().nodeName, 'LI');
  });

  it('TBA: Delete at end of middle LI in UL', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ul>' +
      '<li>a</li>' +
      '<li>b</li>' +
      '<li>c</li>' +
      '</ul>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'li:nth-child(2)', 1);
    editor.plugins.lists.backspaceDelete(true);

    TinyAssertions.assertContent(editor,
      '<ul>' +
      '<li>a</li>' +
      '<li>bc</li>' +
      '</ul>'
    );

    assert.equal(editor.selection.getNode().nodeName, 'LI');
  });

  it('TBA: Delete at end of start LI in UL inside UL', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ul>' +
      '<li>a' +
      '<ul>' +
      '<li>b</li>' +
      '<li>c</li>' +
      '</ul>' +
      '</li>' +
      '</ul>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'li li', 1);
    editor.plugins.lists.backspaceDelete(true);

    TinyAssertions.assertContent(editor,
      '<ul>' +
      '<li>a' +
      '<ul>' +
      '<li>bc</li>' +
      '</ul>' +
      '</li>' +
      '</ul>'
    );

    assert.equal(editor.selection.getNode().nodeName, 'LI');
  });

  it('TBA: Delete at end of middle LI in UL inside UL with', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ul>' +
      '<li>a' +
      '<ul>' +
      '<li>b</li>' +
      '<li>c</li>' +
      '<li>d</li>' +
      '</ul>' +
      '</li>' +
      '</ul>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'li li:nth-child(2)', 1);
    editor.plugins.lists.backspaceDelete(true);

    TinyAssertions.assertContent(editor,
      '<ul>' +
      '<li>a' +
      '<ul>' +
      '<li>b</li>' +
      '<li>cd</li>' +
      '</ul>' +
      '</li>' +
      '</ul>'
    );

    assert.equal(editor.selection.getNode().nodeName, 'LI');
  });

  it('TBA: Delete at end of LI before empty LI', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ul>' +
      '<li>a</li>' +
      '<li></li>' +
      '<li>b</li>' +
      '</ul>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'li', 1);
    editor.plugins.lists.backspaceDelete(true);

    TinyAssertions.assertContent(editor,
      '<ul>' +
      '<li>a</li>' +
      '<li>b</li>' +
      '</ul>'
    );

    assert.equal(editor.selection.getNode().innerHTML, 'a');
  });

  it('TBA: Delete at end of LI before BR padded empty LI', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ul>' +
      '<li>a</li>' +
      '<li><br></li>' +
      '<li>b</li>' +
      '</ul>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'li', 1);
    editor.plugins.lists.backspaceDelete(true);

    TinyAssertions.assertContent(editor,
      '<ul>' +
      '<li>a</li>' +
      '<li>b</li>' +
      '</ul>'
    );

    assert.equal(editor.selection.getNode().innerHTML, 'a');
  });

  it('TBA: Delete at end of LI before empty LI with STRONG', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ul>' +
      '<li>a</li>' +
      '<li><strong><br></strong></li>' +
      '<li>b</li>' +
      '</ul>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'li', 1);
    editor.plugins.lists.backspaceDelete(true);

    TinyAssertions.assertContent(editor,
      '<ul>' +
      '<li>a</li>' +
      '<li>b</li>' +
      '</ul>'
    );

    assert.equal(editor.selection.getNode().innerHTML, 'a');
  });

  it('TBA: Delete at nested LI with adjacent BR', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ul>' +
      '<li>1' +
      '<ul>' +
      '<li>' +
      '<br>' +
      '<ul>' +
      '<li>2</li>' +
      '</ul>' +
      '</li>' +
      '</ul>' +
      '</li>' +
      '<li>3</li>' +
      '</ul>'
    );

    editor.focus();
    editor.selection.setCursorLocation(editor.dom.select('ul ul li')[0], 0);
    editor.plugins.lists.backspaceDelete(true);

    TinyAssertions.assertContent(editor, '<ul><li>1<ul><li>2</li></ul></li><li>3</li></ul>');
    assert.equal(editor.selection.getNode().nodeName, 'LI');
  });

  it('TBA: Delete at BR before text in LI', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ul>' +
      '<li>1</li>' +
      '<li>2<br></li>' +
      '<li>3</li>' +
      '</ul>'
    );

    editor.focus();
    editor.selection.setCursorLocation(editor.dom.select('li')[1], 1);
    editor.plugins.lists.backspaceDelete(false);

    TinyAssertions.assertContent(editor, '<ul><li>1</li><li>2</li><li>3</li></ul>');
    assert.equal(editor.selection.getNode().nodeName, 'LI');
  });

  it('TBA: Backspace merge li elements', () => {
    const editor = hook.editor();
    // IE allows you to place the caret inside a LI without children
    editor.setContent(
      '<ul>' +
      '<li>a</li>' +
      '<li></li>' +
      '</ul>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'li:nth-child(2)', 0);

    editor.plugins.lists.backspaceDelete();

    TinyAssertions.assertContent(editor,
      '<ul>' +
      '<li>a</li>' +
      '</ul>'
    );

    assert.equal(editor.selection.getNode().nodeName, 'LI');
    assert.equal(editor.selection.getRng().startContainer.nodeType, 3, 'Should be a text node');
  });

  it('TBA: Backspace at block inside li element into li without block element', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ul>' +
        '<li>1</li>' +
        '<li><p>2</p></li>' +
        '<li>3</li>' +
      '</ul>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'p', 0);
    editor.plugins.lists.backspaceDelete();

    TinyAssertions.assertContent(
      editor,
      '<ul>' +
        '<li>12</li>' +
        '<li>3</li>' +
      '</ul>'
    );
    assert.equal(editor.selection.getNode().nodeName, 'LI');
  });

  it('TBA: Backspace at block inside li element into li with block element', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ul>' +
        '<li><p>1</p></li>' +
        '<li><p>2</p></li>' +
        '<li>3</li>' +
      '</ul>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'li:nth-child(2) p', 0);
    editor.plugins.lists.backspaceDelete();

    TinyAssertions.assertContent(
      editor,
      '<ul>' +
        '<li><p>12</p></li>' +
        '<li>3</li>' +
      '</ul>'
    );
    assert.equal(editor.selection.getNode().nodeName, 'P');
  });

  it('TBA: Backspace at block inside li element into li with multiple block elements', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ul>' +
        '<li><p>1</p><p>2</p></li>' +
        '<li><p>3</p></li>' +
        '<li>4</li>' +
      '</ul>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'li:nth-child(2) p', 0);
    editor.plugins.lists.backspaceDelete();

    TinyAssertions.assertContent(
      editor,
      '<ul>' +
        '<li><p>1</p><p>2</p>3</li>' +
        '<li>4</li>' +
      '</ul>'
    );
    assert.equal(editor.selection.getNode().nodeName, 'LI');
  });

  it('TBA: Delete at block inside li element into li without block element', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ul>' +
        '<li><p>1</p></li>' +
        '<li>2</li>' +
        '<li>3</li>' +
      '</ul>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'p', 1);
    editor.plugins.lists.backspaceDelete(true);

    TinyAssertions.assertContent(
      editor,
      '<ul>' +
        '<li><p>12</p></li>' +
        '<li>3</li>' +
      '</ul>'
    );
    assert.equal(editor.selection.getNode().nodeName, 'P');
  });

  it('TBA: Delete at block inside li element into li with block element', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ul>' +
        '<li><p>1</p></li>' +
        '<li><p>2</p></li>' +
        '<li>3</li>' +
      '</ul>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'li:nth-child(1) p', 1);
    editor.plugins.lists.backspaceDelete(true);

    TinyAssertions.assertContent(
      editor,
      '<ul>' +
        '<li><p>12</p></li>' +
        '<li>3</li>' +
      '</ul>'
    );
    assert.equal(editor.selection.getNode().nodeName, 'P');
  });

  it('TBA: Delete at block inside li element into li with multiple block elements', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ul>' +
        '<li>1</li>' +
        '<li><p>2</p><p>3</p></li>' +
        '<li>4</li>' +
      '</ul>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'li:nth-child(1)', 1);
    editor.plugins.lists.backspaceDelete(true);

    TinyAssertions.assertContent(
      editor,
      '<ul>' +
        '<li>1<p>2</p><p>3</p></li>' +
        '<li>4</li>' +
      '</ul>'
    );
    assert.equal(editor.selection.getNode().nodeName, 'LI');
  });

  it('TINY-10133: Backspace at the CEF inside li', () => {
    const editor = hook.editor();
    editor.setContent('<ul>' +
        '<li>1</li>' +
        '<li><div contenteditable="false">2</div></li>' +
        '<li>3</li>' +
      '</ul>');
    TinySelections.setCursor(editor, [ 0, 1 ], 0);
    editor.plugins.lists.backspaceDelete(false);

    TinyAssertions.assertContent(editor, '<ul>' +
        '<li>1<div contenteditable="false">2</div></li>' +
        '<li>3</li>' +
      '</ul>');
    // caret in the fake cursor paragraph before CEF div
    TinyAssertions.assertCursor(editor, [ 0, 0, 1 ], 0);
  });

  it('TINY-10133: Delete at the end of li content when next li contains CEF', () => {
    const editor = hook.editor();
    editor.setContent('<ul>' +
        '<li>1</li>' +
        '<li><div contenteditable="false">2</div></li>' +
        '<li>3</li>' +
      '</ul>');
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 1);
    editor.plugins.lists.backspaceDelete(true);

    TinyAssertions.assertContent(editor, '<ul>' +
        '<li>1<div contenteditable="false">2</div></li>' +
        '<li>3</li>' +
      '</ul>');
    TinyAssertions.assertCursor(editor, [ 0, 0, 0 ], 1);
  });

  it('TINY-10133: Backspace at the beginning of `summary` inside li', () => {
    const editor = hook.editor();
    editor.setContent('<ul>' +
        '<li>1</li>' +
        '<li><details><summary>2a</summary><p>2b</p></details></li>' +
        '<li>3</li>' +
      '</ul>');
    TinySelections.setCursor(editor, [ 0, 1, 0, 0 ], 0);
    editor.plugins.lists.backspaceDelete(false);

    TinyAssertions.assertContent(editor, '<ul>' +
        '<li>1<details><summary>2a</summary><p>2b</p></details></li>' +
        '<li>3</li>' +
      '</ul>');
    TinyAssertions.assertCursor(editor, [ 0, 0, 1, 0, 0 ], 0);
  });

  it('TINY-10133: Delete at the end of li content when next li contains `details`', () => {
    const editor = hook.editor();
    editor.setContent('<ul>' +
        '<li>1</li>' +
        '<li><details><summary>2a</summary><p>2b</p></details></li>' +
        '<li>3</li>' +
      '</ul>');
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 1);
    editor.plugins.lists.backspaceDelete(true);

    TinyAssertions.assertContent(editor, '<ul>' +
        '<li>1<details><summary>2a</summary><p>2b</p></details></li>' +
        '<li>3</li>' +
      '</ul>');
    TinyAssertions.assertCursor(editor, [ 0, 0, 0 ], 1);
  });

  it('Backspace from indented list', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ol>' +
        '<li>a' +
          '<ol>' +
            '<li style="list-style-type: none;">' +
              '<ol>' +
                '<li>b</li>' +
              '</ol>' +
            '</li>' +
          '</ol>' +
        '</li>' +
      '</ol>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'ol li ol li ol li:nth-child(1)', 0);
    editor.plugins.lists.backspaceDelete();

    TinyAssertions.assertContent(
      editor,
      '<ol>' +
        '<li>a' +
          '<ol>' +
            '<li>b</li>' +
          '</ol>' +
        '</li>' +
      '</ol>'
    );
    assert.equal(editor.selection.getNode().nodeName, 'LI');
  });

  it('Delete into indented list', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ol>' +
        '<li>a' +
          '<ol>' +
            '<li style="list-style-type: none;">' +
              '<ol>' +
                '<li>b</li>' +
              '</ol>' +
            '</li>' +
          '</ol>' +
        '</li>' +
      '</ol>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'ol li:nth-child(1)', 1);
    editor.plugins.lists.backspaceDelete(true);

    TinyAssertions.assertContent(
      editor,
      '<ol>' +
        '<li>ab</li>' +
      '</ol>'
    );
    assert.equal(editor.selection.getNode().nodeName, 'LI');
  });

  it('TBA: Backspace at beginning of LI in UL inside UL and then undo', () => {
    const editor = hook.editor();
    editor.resetContent(
      '<ul>' +
        '<li>item 1</li>' +
        '<li>item 2' +
          '<ul>' +
            '<li>item 2.1' +
              '<ul>' +
                '<li>item 2.2</li>' +
              '</ul>' +
            '</li>' +
          '</ul>' +
        '</li>' +
        '<li>item 3</li>' +
      '</ul>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'li li:nth-child(1)', 0);
    editor.plugins.lists.backspaceDelete();

    TinyAssertions.assertContent(
      editor,
      '<ul>' +
        '<li>item 1</li>' +
        '<li>item 2</li>' +
        '<li>item 2.1' +
          '<ul>' +
            '<li style="list-style-type: none;">' +
              '<ul>' +
                '<li>item 2.2</li>' +
              '</ul>' +
            '</li>' +
          '</ul>' +
        '</li>' +
        '<li>item 3</li>' +
      '</ul>'
    );

    assert.equal(editor.selection.getNode().nodeName, 'LI');

    editor.undoManager.undo();
    TinyAssertions.assertContent(
      editor,
      '<ul>' +
        '<li>item 1</li>' +
        '<li>item 2' +
          '<ul>' +
            '<li>item 2.1' +
              '<ul>' +
                '<li>item 2.2</li>' +
              '</ul>' +
            '</li>' +
          '</ul>' +
        '</li>' +
        '<li>item 3</li>' +
      '</ul>'
    );
  });
});
