import { describe, it } from '@ephox/bedrock-client';
import { LegacyUnit, TinyAssertions, TinyHooks } from '@ephox/mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/lists/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.plugins.lists.OutdentTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'lists',
    add_unload_trigger: false,
    disable_nodechange: true,
    indent: false,
    entities: 'raw',
    valid_elements:
      'li[style|class|data-custom],ol[style|class|data-custom|start],' +
      'ul[style|class|data-custom],dl,dt,dd,em,strong,span,#p,div,br',
    valid_styles: {
      '*': 'color,font-size,font-family,background-color,font-weight,' +
        'font-style,text-decoration,float,margin,margin-top,margin-right,' +
        'margin-bottom,margin-left,display,position,top,left,list-style-type'
    },
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin, Theme ], true);

  it('TBA: Outdent inside LI in beginning of OL in LI', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ol>' +
      '<li>a' +
      '<ol>' +
      '<li>b</li>' +
      '<li>c</li>' +
      '</ol>' +
      '</li>' +
      '</ol>'
    );

    LegacyUnit.setSelection(editor, 'li li', 1);
    editor.execCommand('Outdent');

    TinyAssertions.assertContent(editor,
      '<ol>' +
      '<li>a</li>' +
      '<li>b' +
      '<ol>' +
      '<li>c</li>' +
      '</ol>' +
      '</li>' +
      '</ol>'
    );

    assert.equal(editor.selection.getNode().nodeName, 'LI');
  });

  it('TBA: Outdent inside LI in middle of OL in LI', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ol>' +
      '<li>a' +
      '<ol>' +
      '<li>b</li>' +
      '<li>c</li>' +
      '<li>d</li>' +
      '</ol>' +
      '</li>' +
      '</ol>'
    );

    LegacyUnit.setSelection(editor, 'li li:nth-child(2)', 1);
    editor.execCommand('Outdent');

    TinyAssertions.assertContent(editor,
      '<ol>' +
      '<li>a' +
      '<ol>' +
      '<li>b</li>' +
      '</ol>' +
      '</li>' +
      '<li>c' +
      '<ol>' +
      '<li>d</li>' +
      '</ol>' +
      '</li>' +
      '</ol>'
    );

    assert.equal(editor.selection.getNode().nodeName, 'LI');
  });

  it('TBA: Outdent inside LI in end of OL in LI', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ol>' +
      '<li>a' +
      '<ol>' +
      '<li>b</li>' +
      '<li>c</li>' +
      '</ol>' +
      '</li>' +
      '</ol>'
    );

    LegacyUnit.setSelection(editor, 'li li:last', 1);
    editor.execCommand('Outdent');

    TinyAssertions.assertContent(editor,
      '<ol>' +
      '<li>a' +
      '<ol>' +
      '<li>b</li>' +
      '</ol>' +
      '</li>' +
      '<li>c</li>' +
      '</ol>'
    );

    assert.equal(editor.selection.getNode().nodeName, 'LI');
  });

  // Nested lists in OL elements

  it('TBA: Outdent inside LI in beginning of OL in OL', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ol>' +
      '<li>a</li>' +
      '<ol>' +
      '<li>b</li>' +
      '<li>c</li>' +
      '</ol>' +
      '</ol>'
    );

    LegacyUnit.setSelection(editor, 'ol ol li', 1);
    editor.execCommand('Outdent');

    TinyAssertions.assertContent(editor,
      '<ol>' +
      '<li>a</li>' +
      '<li>b' +
      '<ol>' +
      '<li>c</li>' +
      '</ol>' +
      '</li>' +
      '</ol>'
    );

    assert.equal(editor.selection.getNode().nodeName, 'LI');
  });

  it('TBA: Outdent inside LI in middle of OL in OL', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ol>' +
      '<li>a</li>' +
      '<ol>' +
      '<li>b</li>' +
      '<li>c</li>' +
      '<li>d</li>' +
      '</ol>' +
      '</ol>'
    );

    LegacyUnit.setSelection(editor, 'ol ol li:nth-child(2)', 1);
    editor.execCommand('Outdent');

    TinyAssertions.assertContent(editor,
      '<ol>' +
      '<li>a' +
      '<ol>' +
      '<li>b</li>' +
      '</ol>' +
      '</li>' +
      '<li>c' +
      '<ol>' +
      '<li>d</li>' +
      '</ol>' +
      '</li>' +
      '</ol>'
    );

    assert.equal(editor.selection.getNode().nodeName, 'LI');
  });

  it('TBA: Outdent inside first/last LI in inner OL', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ol>' +
      '<li>1' +
      '<ol>' +
      '<li>2</li>' +
      '<li>3</li>' +
      '</ol>' +
      '</li>' +
      '<li>4</li>' +
      '</ol>'
    );

    LegacyUnit.setSelection(editor, 'ol ol li:nth-child(1)', 0, 'ol ol li:nth-child(2)', 1);
    editor.execCommand('Outdent');

    TinyAssertions.assertContent(editor,
      '<ol>' +
      '<li>1</li>' +
      '<li>2</li>' +
      '<li>3</li>' +
      '<li>4</li>' +
      '</ol>'
    );

    LegacyUnit.equal(editor.selection.getRng().startContainer.nodeValue, '2');
    LegacyUnit.equal(editor.selection.getRng().endContainer.nodeValue, '3');
  });

  it('TBA: Outdent inside first LI in inner OL where OL is single child of parent LI', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ol>' +
      '<li>a</li>' +
      '<li>' +
      '<ol>' +
      '<li>b</li>' +
      '<li>c</li>' +
      '</ol>' +
      '</li>' +
      '</ol>'
    );

    LegacyUnit.setSelection(editor, 'ol ol li:first', 0);
    editor.execCommand('Outdent');

    TinyAssertions.assertContent(editor,
      '<ol>' +
      '<li>a</li>' +
      '<li>b' +
      '<ol>' +
      '<li>c</li>' +
      '</ol>' +
      '</li>' +
      '</ol>'
    );

    assert.equal(editor.selection.getNode().nodeName, 'LI');
  });

  it('TBA: Outdent inside LI in end of OL in OL', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ol>' +
      '<li>a</li>' +
      '<ol>' +
      '<li>b</li>' +
      '<li>c</li>' +
      '</ol>' +
      '</ol>'
    );

    LegacyUnit.setSelection(editor, 'ol ol li:last', 1);
    editor.execCommand('Outdent');

    TinyAssertions.assertContent(editor,
      '<ol>' +
      '<li>a' +
      '<ol>' +
      '<li>b</li>' +
      '</ol>' +
      '</li>' +
      '<li>c</li>' +
      '</ol>'
    );

    assert.equal(editor.selection.getNode().nodeName, 'LI');
  });

  it('TBA: Outdent inside only child LI in OL in OL', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ol>' +
      '<li>a' +
      '<ol>' +
      '<li>b</li>' +
      '</ol>' +
      '</li>' +
      '</ol>'
    );

    LegacyUnit.setSelection(editor, 'ol ol li', 0);
    editor.execCommand('Outdent');

    TinyAssertions.assertContent(editor,
      '<ol>' +
      '<li>a</li>' +
      '<li>b</li>' +
      '</ol>'
    );

    assert.equal(editor.selection.getNode().nodeName, 'LI');
  });

  it('TBA: Outdent multiple LI in OL and nested OL', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ol>' +
      '<li>a' +
      '<ol>' +
      '<li>b</li>' +
      '</ol>' +
      '</li>' +
      '</ol>'
    );

    LegacyUnit.setSelection(editor, 'li', 0, 'li li', 1);
    editor.execCommand('Outdent');

    TinyAssertions.assertContent(editor,
      '<p>a</p>' +
      '<ol>' +
      '<li>b</li>' +
      '</ol>'
    );
  });

  it('TBA: Outdent on li with inner block element', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ul>' +
      '<li><p>a</p></li>' +
      '<li><p>b</p></li>' +
      '<li><p>c</p></li>' +
      '</ul>'
    );

    LegacyUnit.setSelection(editor, 'ul li:nth-child(2) p', 0);
    editor.execCommand('Outdent');

    TinyAssertions.assertContent(editor,
      '<ul>' +
        '<li><p>a</p></li>' +
      '</ul>' +
      '<p>b</p>' +
      '<ul>' +
        '<li><p>c</p></li>' +
      '</ul>'
    );
  });

  it('TBA: Outdent on nested li with inner block element', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ul>' +
        '<li>' +
          '<p>a</p>' +
          '<ul><li><p>b</p></li></ul>' +
        '</li>' +
        '<li><p>c</p></li>' +
      '</ul>'
    );

    LegacyUnit.setSelection(editor, 'ul li:nth-child(1) li p', 0);
    editor.execCommand('Outdent');

    TinyAssertions.assertContent(editor,
      '<ul>' +
      '<li><p>a</p></li>' +
      '<li><p>b</p></li>' +
      '<li><p>c</p></li>' +
      '</ul>'
    );
  });

  it('Outdent nested ul in ol', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ol>' +
        '<li style="list-style-type: none;">' +
          '<ul>' +
            '<li>a</li>' +
          '</ul>' +
        '</li>' +
      '</ol>'
    );

    LegacyUnit.setSelection(editor, 'ul', 0);
    editor.execCommand('Outdent');

    TinyAssertions.assertContent(editor,
      '<ul>' +
        '<li>a</li>' +
      '</ul>'
    );
  });

  it('Outdenting an item should not affect its attributes', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ul>' +
        '<li style="color: red;" class="xyz">a' +
          '<ul>' +
            '<li style="color: blue;">b</li>' +
          '</ul>' +
        '</li>' +
      '</ul>'
    );

    LegacyUnit.setSelection(editor, 'ul ul li', 0);
    editor.execCommand('Outdent');

    TinyAssertions.assertContent(editor,
      '<ul>' +
        '<li style="color: red;" class="xyz">a</li>' +
        '<li style="color: blue;">b</li>' +
      '</ul>'
    );
  });

  it('TBA: Outdent inside LI in beginning of OL in LI with start attribute', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ol>' +
      '<li>a' +
      '<ol start="5">' +
      '<li>b</li>' +
      '<li>c</li>' +
      '</ol>' +
      '</li>' +
      '</ol>'
    );

    LegacyUnit.setSelection(editor, 'li li', 1);
    editor.execCommand('Outdent');

    TinyAssertions.assertContent(editor,
      '<ol>' +
      '<li>a</li>' +
      '<li>b' +
      '<ol start="5">' +
      '<li>c</li>' +
      '</ol>' +
      '</li>' +
      '</ol>'
    );

    assert.equal(editor.selection.getNode().nodeName, 'LI');
  });

  it('TBA: Outdent inside LI in beginning of OL in LI with start attribute on both OL', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ol start="2">' +
      '<li>a' +
      '<ol start="5">' +
      '<li>b</li>' +
      '<li>c</li>' +
      '</ol>' +
      '</li>' +
      '</ol>'
    );

    LegacyUnit.setSelection(editor, 'li li', 1);
    editor.execCommand('Outdent');

    TinyAssertions.assertContent(editor,
      '<ol start="2">' +
      '<li>a</li>' +
      '<li>b' +
      '<ol start="5">' +
      '<li>c</li>' +
      '</ol>' +
      '</li>' +
      '</ol>'
    );

    assert.equal(editor.selection.getNode().nodeName, 'LI');
  });
});
