import { beforeEach, describe, it } from '@ephox/bedrock-client';
import { LegacyUnit, TinyAssertions, TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/lists/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.plugins.lists.IndentTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'lists',
    add_unload_trigger: false,
    disable_nodechange: true,
    indent: false,
    entities: 'raw',
    valid_elements:
      'li[style|class|data-custom],ol[style|class|data-custom|start],' +
      'ul[style|class|data-custom],dl,dt,dd,em,strong,span,#p,div,br,table,tr,td',
    valid_styles: {
      '*': 'color,font-size,font-family,background-color,font-weight,' +
        'font-style,text-decoration,float,margin,margin-top,margin-right,' +
        'margin-bottom,margin-left,display,position,top,left,list-style-type'
    },
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin, Theme ]);

  beforeEach(() => {
    hook.editor().focus();
  });

  it('TBA: Indent single LI in OL', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ol>' +
      '<li>a</li>' +
      '</ol>'
    );

    LegacyUnit.setSelection(editor, 'li', 0);
    editor.execCommand('Indent');

    TinyAssertions.assertContent(
      editor,
      '<ol>' +
      '<li style="list-style-type: none;">' +
      '<ol>' +
      '<li>a</li>' +
      '</ol>' +
      '</li>' +
      '</ol>'
    );

    assert.equal(editor.selection.getNode().nodeName, 'LI');
  });

  it('TBA: Indent middle LI in OL', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ol>' +
      '<li>a</li>' +
      '<li>b</li>' +
      '<li>c</li>' +
      '</ol>'
    );

    LegacyUnit.setSelection(editor, 'li:nth-child(2)', 0);
    editor.execCommand('Indent');

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

  it('TBA: Indent single LI in OL and retain OLs list style in the new OL', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ol style="list-style-type: lower-alpha;">' +
      '<li>a</li>' +
      '<li>b</li>' +
      '</ol>'
    );

    LegacyUnit.setSelection(editor, 'li:nth-child(2)', 0);
    editor.execCommand('Indent');

    TinyAssertions.assertContent(editor,
      '<ol style="list-style-type: lower-alpha;">' +
      '<li>a' +
      '<ol style="list-style-type: lower-alpha;">' +
      '<li>b</li>' +
      '</ol>' +
      '</li>' +
      '</ol>'
    );
  });

  it('TBA: Indent last LI in OL', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ol>' +
      '<li>a</li>' +
      '<li>b</li>' +
      '</ol>'
    );

    LegacyUnit.setSelection(editor, 'li:last', 0);
    editor.execCommand('Indent');

    TinyAssertions.assertContent(editor,
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

  it('TBA: Indent in table cell in table inside of list should not do anything', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ol>' +
      '<li>' +
      '<table>' +
      '<tr>' +
      '<td></td>' +
      '</tr>' +
      '</table>' +
      '</li>' +
      '</ol>'
    );

    LegacyUnit.setSelection(editor, 'td', 0);
    editor.execCommand('Indent');

    TinyAssertions.assertContent(editor,
      '<ol>' +
    '<li>' +
    '<table>' +
    '<tr>' +
    '<td></td>' +
    '</tr>' +
    '</table>' +
    '</li>' +
    '</ol>'
    );

    assert.equal(editor.selection.getNode().nodeName, 'TD');
  });

  it('TBA: Indent last LI to same level as middle LI', () => {
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

    LegacyUnit.setSelection(editor, 'li:last', 1);
    editor.execCommand('Indent');

    TinyAssertions.assertContent(editor,
      '<ol>' +
      '<li>a' +
      '<ol>' +
      '<li>b</li>' +
      '<li>c</li>' +
      '</ol>' +
      '</li>' +
      '</ol>'
    );

    assert.equal(editor.selection.getNode().nodeName, 'LI');
  });

  it('TBA: Indent first LI and nested LI OL', () => {
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

    LegacyUnit.setSelection(editor, 'li', 0, 'li li', 0);
    editor.execCommand('Indent');

    TinyAssertions.assertContent(editor,
      '<ol>' +
      '<li style="list-style-type: none;">' +
      '<ol>' +
      '<li>a' +
      '<ol>' +
      '<li>b</li>' +
      '</ol>' +
      '</li>' +
      '</ol>' +
      '</li>' +
      '</ol>'
    );

    assert.equal(editor.selection.getNode().nodeName, 'LI');
  });

  it('TBA: Indent second LI to same level as nested LI', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ul>' +
      '<li>a</li>' +
      '<li>b' +
      '<ul>' +
      '<li>c</li>' +
      '</ul>' +
      '</li>' +
      '</ul>'
    );

    LegacyUnit.setSelection(editor, 'li:nth-child(2)', 0);
    editor.execCommand('Indent');

    TinyAssertions.assertContent(editor,
      '<ul>' +
      '<li>a' +
      '<ul>' +
      '<li>b</li>' +
      '<li>c</li>' +
      '</ul>' +
      '</li>' +
      '</ul>'
    );

    assert.equal(editor.selection.getNode().nodeName, 'LI');
  });

  it('TBA: Indent second LI to same level as nested LI 2', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ul>' +
      '<li>a' +
      '<ul>' +
      '<li>b</li>' +
      '</ul>' +
      '</li>' +
      '<li>cd' +
      '<ul>' +
      '<li>e</li>' +
      '</ul>' +
      '</li>' +
      '</ul>'
    );

    LegacyUnit.setSelection(editor, 'li:nth-child(2)', 1);
    editor.execCommand('Indent');

    TinyAssertions.assertContent(editor,
      '<ul>' +
      '<li>a' +
      '<ul>' +
      '<li>b</li>' +
      '<li>cd</li>' +
      '<li>e</li>' +
      '</ul>' +
      '</li>' +
      '</ul>'
    );

    assert.equal(editor.selection.getNode().nodeName, 'LI');
  });

  it('TBA: Indent second and third LI', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ul>' +
      '<li>a</li>' +
      '<li>b</li>' +
      '<li>c</li>' +
      '</ul>'
    );

    LegacyUnit.setSelection(editor, 'li:nth-child(2)', 0, 'li:last', 0);
    editor.execCommand('Indent');

    TinyAssertions.assertContent(editor,
      '<ul>' +
      '<li>a' +
      '<ul>' +
      '<li>b</li>' +
      '<li>c</li>' +
      '</ul>' +
      '</li>' +
      '</ul>'
    );
  });

  it('TBA: Indent second second li with next sibling to nested li', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ul>' +
      '<li>a</li>' +
      '<li>b' +
      '<ul>' +
      '<li>c</li>' +
      '</ul>' +
      '</li>' +
      '<li>d</li>' +
      '</ul>'
    );

    LegacyUnit.setSelection(editor, 'ul > li:nth-child(2)', 1);
    editor.execCommand('Indent');

    TinyAssertions.assertContent(editor,
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
  });

  it('TBA: Indent on second li with inner block element', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ul>' +
      '<li><p>a</p></li>' +
      '<li><p>b</p></li>' +
      '<li><p>c</p></li>' +
      '</ul>'
    );

    LegacyUnit.setSelection(editor, 'ul > li:nth-child(2) > p', 0);
    editor.execCommand('Indent');

    TinyAssertions.assertContent(editor,
      '<ul>' +
        '<li>' +
          '<p>a</p>' +
          '<ul><li><p>b</p></li></ul>' +
        '</li>' +
        '<li><p>c</p></li>' +
      '</ul>'
    );
  });

  it('Indent already indented last li, ul in ol', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ol>' +
        '<li>a' +
          '<ul>' +
            '<li>b</li>' +
          '</ul>' +
        '</li>' +
      '</ol>'
    );

    LegacyUnit.setSelection(editor, 'ul li', 0);
    editor.execCommand('Indent');

    TinyAssertions.assertContent(editor,
      '<ol>' +
        '<li>a' +
          '<ul>' +
            '<li style="list-style-type: none;">' +
              '<ul>' +
                '<li>b</li>' +
              '</ul>' +
            '</li>' +
          '</ul>' +
        '</li>' +
      '</ol>'
    );
  });

  it('TBA: Indent single LI in OL with start attribute', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ol start="5">' +
      '<li>a</li>' +
      '</ol>'
    );

    LegacyUnit.setSelection(editor, 'li', 0);
    editor.execCommand('Indent');

    TinyAssertions.assertContent(editor,
      '<ol>' +
      '<li style="list-style-type: none;">' +
      '<ol>' +
      '<li>a</li>' +
      '</ol>' +
      '</li>' +
      '</ol>'
    );

    assert.equal(editor.selection.getNode().nodeName, 'LI');
  });

  it('TBA: Indent first LI and nested LI OL with start attributes', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ol start="2">' +
      '<li>a</li>' +
      '<li>' +
      '<ol start="5">' +
      '<li>b</li>' +
      '</ol>' +
      '</li>' +
      '</ol>'
    );

    LegacyUnit.setSelection(editor, 'li', 0);
    editor.execCommand('Indent');

    TinyAssertions.assertContent(editor,
      '<ol>' +
      '<li style="list-style-type: none;">' +
      '<ol start="5">' +
      '<li>a</li>' +
      '<li>b</li>' +
      '</ol>' +
      '</li>' +
      '</ol>'
    );

    assert.equal(editor.selection.getNode().nodeName, 'LI');
  });
});
