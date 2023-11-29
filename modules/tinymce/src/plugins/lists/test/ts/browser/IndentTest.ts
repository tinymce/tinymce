import { beforeEach, context, describe, it } from '@ephox/bedrock-client';
import { LegacyUnit, TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/lists/Plugin';

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
  }, [ Plugin ]);

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

    LegacyUnit.setSelection(editor, 'li:last-of-type', 0);
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

    LegacyUnit.setSelection(editor, 'li:nth-child(2)', 1);
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

    LegacyUnit.setSelection(editor, 'li:nth-child(2)', 0, 'li:last-of-type', 0);
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

  it('TINY-10213: Indent an LI with a list inside should not delete the rest of the content', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ol>' +
      '<li>a</li>' +
      '<!-- c1 -->' +
      '<li>' +
      '<ol>' +
      '<li>b</li>' +
      '</ol>' +
      '<p data-fake-attr="something">p1</p>' +
      '<p data-fake-attr="something">p2</p>' +
      '</li>' +
      '<!-- c2 -->' +
      '</ol>'
    );

    LegacyUnit.setSelection(editor, 'li', 0);
    editor.execCommand('Outdent');

    TinyAssertions.assertContent(editor,
      '<p>a</p>' +
      '<ol>' +
      '<!-- c1 -->' +
      '<li style="list-style-type: none;">' +
      '<ol>' +
      '<li>b</li>' +
      '</ol>' +
      '<p data-fake-attr="something">p1</p>' +
      '<p data-fake-attr="something">p2</p>' +
      '</li>' +
      '<!-- c2 -->' +
      '</ol>'
    );

    assert.equal(editor.selection.getNode().nodeName, 'P');

    editor.setContent(
      '<ol start="2">' +
      '<li>a</li>' +
      '<!-- c1 -->' +
      '<li>' +
      '<ol start="5">' +
      '<li>b</li>' +
      '</ol>' +
      '<p data-fake-attr="something">p1</p>' +
      '<p data-fake-attr="something">p2</p>' +
      '</li>' +
      '<!-- c2 -->' +
      '</ol>'
    );

    LegacyUnit.setSelection(editor, 'li', 0);
    editor.execCommand('Indent');

    TinyAssertions.assertContent(editor,
      '<ol>' +
      '<li style="list-style-type: none;">' +
      '<ol start="5">' +
      '<li>a</li>' +
      '<!-- c1 -->' +
      '<li>b</li>' +
      '</ol>' +
      '<p data-fake-attr="something">p1</p>' +
      '<p data-fake-attr="something">p2</p>' +
      '</li>' +
      '<!-- c2 -->' +
      '</ol>'
    );

    assert.equal(editor.selection.getNode().nodeName, 'LI');
  });

  it('TINY-10414: toggle a list inside a `li` with non-list siblings should not delete the siblings', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ul>' +
        '<li>A' +
          '<ul>' +
            '<li style="list-style-type: none;">' +
              '<ul>' +
                '<li>B</li>' +
              '</ul>' +
              '<p>C</p>' +
              '<p>D</p>' +
            '</li>' +
          '</ul>' +
        '</li>' +
      '</ul>'
    );

    TinySelections.setCursor(editor, [ 0, 0, 1, 0, 0, 0 ], 0);
    editor.execCommand('InsertUnorderedList');

    TinyAssertions.assertContent(editor,
      '<ul>' +
        '<li>A</li>' +
      '</ul>' +
      '<p>B</p>' +
      '<ul>' +
        '<li style="list-style-type: none;">' +
          '<ul>' +
            '<li>' +
              'C' +
              '<p>D</p>' +
            '</li>' +
          '</ul>' +
        '</li>' +
      '</ul>'
    );
  });

  it('TINY-10268: a `list` inside a `li` surrounded by 2 not element should allow the user to indent/outdent its `li`', () => {
    const editor = hook.editor();
    editor.setContent(`<ul>
      <li>
        Dedent me
        <ul>
          <li>or try to dedent me 1</li>
          <li>or try to dedent me 2</li>
        </ul>
        <span>abc</span>
      </li>
    </ul>`);

    TinySelections.setCursor(editor, [ 0, 0, 1, 0 ], 0);
    editor.execCommand('Indent');

    TinyAssertions.assertContent(editor, '<ul>' +
      '<li>' +
        'Dedent me' +
        '<ul>' +
          '<li style="list-style-type: none;"><ul><li>or try to dedent me 1</li></ul></li>' +
          '<li>or try to dedent me 2</li>' +
        '</ul>' +
        '<span>abc</span>' +
      '</li>' +
    '</ul>');

    TinySelections.setCursor(editor, [ 0, 0, 1, 0, 0, 0 ], 0);
    editor.execCommand('Outdent');

    TinyAssertions.assertContent(editor, '<ul>' +
      '<li>' +
        'Dedent me' +
        '<ul>' +
          '<li>or try to dedent me 1</li>' +
          '<li>or try to dedent me 2</li>' +
        '</ul>' +
        '<span>abc</span>' +
      '</li>' +
    '</ul>');
  });

  it('TINY-10268: in a `list` inside a `li` with another list as sibling and 2 not `list` elements as first and last element of the parent `li` indent/outdent should work as expected', () => {
    const editor = hook.editor();
    editor.setContent(`<ul>
      <li>
        Dedent me
        <ul>
          <li>or try to dedent me 1</li>
          <li>or try to dedent me 2</li>
        </ul>
        <ul>
          <li>or try to dedent me 1</li>
          <li>or try to dedent me 2</li>
        </ul>
        <span>abc</span>
      </li>
    </ul>`);

    TinySelections.setCursor(editor, [ 0, 0, 1, 0 ], 0);
    editor.execCommand('Indent');

    TinyAssertions.assertContent(editor, '<ul>' +
      '<li>' +
        'Dedent me' +
        '<ul>' +
          '<li style="list-style-type: none;"><ul><li>or try to dedent me 1</li></ul></li>' +
          '<li>or try to dedent me 2</li>' +
        '</ul>' +
        '<ul>' +
          '<li>or try to dedent me 1</li>' +
          '<li>or try to dedent me 2</li>' +
        '</ul>' +
        '<span>abc</span>' +
      '</li>' +
    '</ul>');

    TinySelections.setCursor(editor, [ 0, 0, 1, 0, 0, 0 ], 0);
    editor.execCommand('Outdent');

    TinyAssertions.assertContent(editor, '<ul>' +
      '<li>' +
        'Dedent me' +
        '<ul>' +
          '<li>or try to dedent me 1</li>' +
          '<li>or try to dedent me 2</li>' +
        '</ul>' +
        '<ul>' +
          '<li>or try to dedent me 1</li>' +
          '<li>or try to dedent me 2</li>' +
        '</ul>' +
        '<span>abc</span>' +
      '</li>' +
    '</ul>');
  });

  context('Parent context', () => {
    const testCommandAtTextPath = (command: string) => (inputHtml: string, path: number[], expectedHtml: string) => () => {
      const editor = hook.editor();
      editor.setContent(inputHtml);

      TinySelections.setCursor(editor, path, 0);
      editor.execCommand(command);

      TinyAssertions.assertContent(editor, expectedHtml);
    };

    const testIndentAtTextPath = testCommandAtTextPath('Indent');
    const testOutdentAtTextPath = testCommandAtTextPath('Outdent');

    it('TINY-7209: indent list item inside div inside list item', testIndentAtTextPath(
      '<ul><li>A<div><ul><li>B</li><li>C</li></ul></div></li><li>D</li></ul>',
      [ 0, 0, 1, 0, 0, 0 ],
      '<ul><li>A<div><ul><li style="list-style-type: none;"><ul><li>B</li></ul></li><li>C</li></ul></div></li><li>D</li></ul>'
    ));

    it('TINY-7209: indent list item with a paragraph inside div inside a list item', testIndentAtTextPath(
      '<ul><li>A<div><ul><li><p>B</p></li><li>C</li></ul></div></li><li>D</li></ul>',
      [ 0, 0, 1, 0, 0, 0, 0 ],
      '<ul><li>A<div><ul><li style="list-style-type: none;"><ul><li><p>B</p></li></ul></li><li>C</li></ul></div></li><li>D</li></ul>'
    ));

    it('TINY-7209: outdent list item inside a div inside a list item', testOutdentAtTextPath(
      '<ul><li>A<div><ul><li>B</li><li>C</li></ul></div></li><li>D</li></ul>',
      [ 0, 0, 1, 0, 0, 0 ],
      '<ul><li>A<div><p>B</p><ul><li>C</li></ul></div></li><li>D</li></ul>'
    ));

    it('TINY-7209: outdent list item with a paragraph inside div inside a list item', testOutdentAtTextPath(
      '<ul><li>A<div><ul><li><p>B</p></li><li>C</li></ul></div></li><li>D</li></ul>',
      [ 0, 0, 1, 0, 0, 0 ],
      '<ul><li>A<div><p>B</p><ul><li>C</li></ul></div></li><li>D</li></ul>'
    ));
  });
});
