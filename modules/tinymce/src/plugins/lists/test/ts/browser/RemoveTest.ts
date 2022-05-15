import { describe, it } from '@ephox/bedrock-client';
import { LegacyUnit, TinyAssertions, TinySelections, TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/lists/Plugin';

describe('browser.tinymce.plugins.lists.RemoveTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'lists',
    add_unload_trigger: false,
    disable_nodechange: true,
    indent: false,
    entities: 'raw',
    valid_elements:
      'li[style|class|data-custom],ol[style|class|data-custom],' +
      'ul[style|class|data-custom],dl,dt,dd,em,strong,span,#p,div,br',
    valid_styles: {
      '*': 'color,font-size,font-family,background-color,font-weight,' +
        'font-style,text-decoration,float,margin,margin-top,margin-right,' +
        'margin-bottom,margin-left,display,position,top,left,list-style-type'
    },
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ], true);

  it('TBA: Remove UL at single LI', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ul>' +
      '<li>a</li>' +
      '</ul>'
    );

    LegacyUnit.setSelection(editor, 'li', 0);
    editor.execCommand('InsertUnorderedList');

    TinyAssertions.assertContent(editor, '<p>a</p>');
    assert.equal(editor.selection.getStart().nodeName, 'P');
  });

  it('TBA: Remove UL at start LI', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ul>' +
      '<li>a</li>' +
      '<li>b</li>' +
      '<li>c</li>' +
      '</ul>'
    );

    LegacyUnit.setSelection(editor, 'li', 0);
    editor.execCommand('InsertUnorderedList');

    TinyAssertions.assertContent(editor,
      '<p>a</p>' +
      '<ul>' +
      '<li>b</li>' +
      '<li>c</li>' +
      '</ul>'
    );
    assert.equal(editor.selection.getStart().nodeName, 'P');
  });

  it('TBA: Remove UL at start empty LI', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ul>' +
      '<li><br></li>' +
      '<li>b</li>' +
      '<li>c</li>' +
      '</ul>'
    );

    LegacyUnit.setSelection(editor, 'li', 0);
    editor.execCommand('InsertUnorderedList');

    TinyAssertions.assertContent(editor,
      '<p>\u00a0</p>' +
      '<ul>' +
      '<li>b</li>' +
      '<li>c</li>' +
      '</ul>'
    );
    assert.equal(editor.selection.getNode().nodeName, 'P');
  });

  it('TBA: Remove UL at middle LI', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ul>' +
      '<li>a</li>' +
      '<li>b</li>' +
      '<li>c</li>' +
      '</ul>'
    );

    LegacyUnit.setSelection(editor, 'li:nth-child(2)', 1);
    editor.execCommand('InsertUnorderedList');

    TinyAssertions.assertContent(editor,
      '<ul>' +
      '<li>a</li>' +
      '</ul>' +
      '<p>b</p>' +
      '<ul>' +
      '<li>c</li>' +
      '</ul>'
    );
    assert.equal(editor.selection.getStart().nodeName, 'P');
  });

  it('TBA: Remove UL at middle empty LI', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ul>' +
      '<li>a</li>' +
      '<li><br></li>' +
      '<li>c</li>' +
      '</ul>'
    );

    LegacyUnit.setSelection(editor, 'li:nth-child(2)', 0);
    editor.execCommand('InsertUnorderedList');

    TinyAssertions.assertContent(editor,
      '<ul>' +
      '<li>a</li>' +
      '</ul>' +
      '<p>\u00a0</p>' +
      '<ul>' +
      '<li>c</li>' +
      '</ul>'
    );
    assert.equal(editor.selection.getNode().nodeName, 'P');
  });

  it('TBA: Remove UL at end LI', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ul>' +
      '<li>a</li>' +
      '<li>b</li>' +
      '<li>c</li>' +
      '</ul>'
    );

    LegacyUnit.setSelection(editor, 'li:last-of-type', 1);
    editor.execCommand('InsertUnorderedList');

    TinyAssertions.assertContent(editor,
      '<ul>' +
      '<li>a</li>' +
      '<li>b</li>' +
      '</ul>' +
      '<p>c</p>'
    );
    assert.equal(editor.selection.getStart().nodeName, 'P');
  });

  it('TBA: Remove UL at end empty LI', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ul>' +
      '<li>a</li>' +
      '<li>b</li>' +
      '<li><br></li>' +
      '</ul>'
    );

    LegacyUnit.setSelection(editor, 'li:last-of-type', 0);
    editor.execCommand('InsertUnorderedList');

    TinyAssertions.assertContent(editor,
      '<ul>' +
      '<li>a</li>' +
      '<li>b</li>' +
      '</ul>' +
      '<p>\u00a0</p>'
    );
    assert.equal(editor.selection.getNode().nodeName, 'P');
  });

  it('TBA: Remove UL at middle LI inside parent OL', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ol>' +
      '<li>a</li>' +
      '<ul>' +
      '<li>b</li>' +
      '<li>c</li>' +
      '<li>d</li>' +
      '</ul>' +
      '<li>e</li>' +
      '</ol>'
    );

    LegacyUnit.setSelection(editor, 'ul li:nth-child(2)', 1);
    editor.execCommand('InsertUnorderedList');

    TinyAssertions.assertContent(editor,
      '<ol>' +
      '<li>a' +
      '<ul>' +
      '<li>b</li>' +
      '</ul>' +
      '</li>' +
      '</ol>' +
      '<p>c</p>' +
      '<ol>' +
      '<li style="list-style-type: none;">' +
      '<ul>' +
      '<li>d</li>' +
      '</ul>' +
      '</li>' +
      '<li>e</li>' +
      '</ol>'
    );
    assert.equal(editor.selection.getStart().nodeName, 'P');
  });

  it('TBA: Remove UL at middle LI inside parent OL (html5)', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ol>' +
      '<li>a' +
      '<ul>' +
      '<li>b</li>' +
      '<li>c</li>' +
      '<li>d</li>' +
      '</ul>' +
      '</li>' +
      '<li>e</li>' +
      '</ol>'
    );

    LegacyUnit.setSelection(editor, 'ul li:nth-child(2)', 1);
    editor.execCommand('InsertUnorderedList');

    TinyAssertions.assertContent(editor,
      '<ol>' +
      '<li>a' +
      '<ul>' +
      '<li>b</li>' +
      '</ul>' +
      '</li>' +
      '</ol>' +
      '<p>c</p>' +
      '<ol>' +
      '<li style="list-style-type: none;">' +
      '<ul>' +
      '<li>d</li>' +
      '</ul>' +
      '</li>' +
      '<li>e</li>' +
      '</ol>'
    );
    assert.equal(editor.selection.getStart().nodeName, 'P');
  });

  it('TBA: Remove OL on a deep nested LI', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ol>' +
      '<li>a' +
      '<ol>' +
      '<li>b</li>' +
      '<li>c' +
      '<ol>' +
      '<li>d</li>' +
      '<li>e</li>' +
      '<li>f</li>' +
      '</ol>' +
      '</li>' +
      '<li>g</li>' +
      '<li>h</li>' +
      '</ol>' +
      '</li>' +
      '<li>i</li>' +
      '</ol>'
    );

    LegacyUnit.setSelection(editor, 'ol ol ol li:nth-child(2)', 1);
    editor.execCommand('InsertOrderedList');

    TinyAssertions.assertContent(editor,
      '<ol>' +
      '<li>a' +
      '<ol>' +
      '<li>b</li>' +
      '<li>c' +
      '<ol>' +
      '<li>d</li>' +
      '</ol>' +
      '</li>' +
      '</ol>' +
      '</li>' +
      '</ol>' +
      '<p>e</p>' +
      '<ol>' +
      '<li style="list-style-type: none;">' +
      '<ol>' +
      '<li style="list-style-type: none;">' +
      '<ol>' +
      '<li>f</li>' +
      '</ol>' +
      '</li>' +
      '<li>g</li>' +
      '<li>h</li>' +
      '</ol>' +
      '</li>' +
      '<li>i</li>' +
      '</ol>'
    );

    assert.equal(editor.selection.getStart().nodeName, 'P');
  });

  it('TBA: Remove empty UL between two textblocks', () => {
    const editor = hook.editor();
    editor.setContent(
      '<div>a</div>' +
      '<ul>' +
      '<li></li>' +
      '</ul>' +
      '<div>b</div>'
    );

    LegacyUnit.setSelection(editor, 'li:first-of-type', 0);
    editor.execCommand('InsertUnorderedList');

    TinyAssertions.assertContent(editor,
      '<div>a</div>' +
      '<p>\u00a0</p>' +
      '<div>b</div>'
    );
    assert.equal(editor.selection.getNode().nodeName, 'P');
  });

  it('TBA: Remove indented list with single item', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ul>' +
      '<li>a' +
      '<ul>' +
      '<li>b</li>' +
      '</ul>' +
      '</li>' +
      '<li>c</li>' +
      '</ul>'
    );

    LegacyUnit.setSelection(editor, 'li li', 0, 'li li', 1);
    editor.execCommand('InsertUnorderedList');

    TinyAssertions.assertContent(editor,
      '<ul>' +
      '<li>a</li>' +
      '</ul>' +
      '<p>b</p>' +
      '<ul>' +
      '<li>c</li>' +
      '</ul>'
    );
    assert.equal(editor.selection.getNode().nodeName, 'P');
  });

  it('TBA: Remove indented list with multiple items', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ul>' +
      '<li>a' +
      '<ul>' +
      '<li>b</li>' +
      '<li>c</li>' +
      '</ul>' +
      '</li>' +
      '<li>d</li>' +
      '</ul>'
    );

    LegacyUnit.setSelection(editor, 'li li:first-of-type', 0, 'li li:last-of-type', 1);
    editor.execCommand('InsertUnorderedList');

    TinyAssertions.assertContent(editor,
      '<ul>' +
      '<li>a</li>' +
      '</ul>' +
      '<p>b</p>' +
      '<p>c</p>' +
      '<ul>' +
      '<li>d</li>' +
      '</ul>'
    );
    assert.equal((editor.selection.getStart().firstChild as Text).data, 'b');
    assert.equal((editor.selection.getEnd().firstChild as Text).data, 'c');
  });

  it('TBA: Remove indented list with multiple items and paragraph', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ul>' +
        '<li>a</li>' +
        '<li><p>b</p></li>' +
        '<li>c</li>' +
      '</ul>'
    );

    LegacyUnit.setSelection(editor, 'p', 0);
    editor.execCommand('InsertUnorderedList');

    TinyAssertions.assertContent(editor,
      '<ul>' +
        '<li>a</li>' +
      '</ul>' +
      '<p>b</p>' +
      '<ul>' +
        '<li>c</li>' +
      '</ul>'
    );
  });

  it('TINY-8068: Remove list inside a div inside a list item should only remove the nested list', () => {
    const editor = hook.editor();
    editor.setContent('<ul><li><div><ul><li>a</li></ul></div></li></ul>');

    TinySelections.setCursor(editor, [ 0, 0, 0, 0, 0, 0 ], 0);
    editor.execCommand('InsertUnorderedList');

    TinyAssertions.assertContent(editor, '<ul><li><div><p>a</p></div></li></ul>');
  });
});
