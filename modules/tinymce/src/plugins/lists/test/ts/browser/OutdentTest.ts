import { Log, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { LegacyUnit, TinyLoader } from '@ephox/mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/lists/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.plugins.lists.OutdentTest', (success, failure) => {
  const suite = LegacyUnit.createSuite<Editor>();

  Plugin();
  Theme();

  suite.test('TestCase-TBA: Lists: Outdent inside LI in beginning of OL in LI', (editor) => {
    editor.getBody().innerHTML = LegacyUnit.trimBrs(
      '<ol>' +
      '<li>a' +
      '<ol>' +
      '<li>b</li>' +
      '<li>c</li>' +
      '</ol>' +
      '</li>' +
      '</ol>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'li li', 1);
    LegacyUnit.execCommand(editor, 'Outdent');

    LegacyUnit.equal(editor.getContent(),
      '<ol>' +
      '<li>a</li>' +
      '<li>b' +
      '<ol>' +
      '<li>c</li>' +
      '</ol>' +
      '</li>' +
      '</ol>'
    );

    LegacyUnit.equal(editor.selection.getNode().nodeName, 'LI');
  });

  suite.test('TestCase-TBA: Lists: Outdent inside LI in middle of OL in LI', (editor) => {
    editor.getBody().innerHTML = LegacyUnit.trimBrs(
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

    editor.focus();
    LegacyUnit.setSelection(editor, 'li li:nth-child(2)', 1);
    LegacyUnit.execCommand(editor, 'Outdent');

    LegacyUnit.equal(editor.getContent(),
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

    LegacyUnit.equal(editor.selection.getNode().nodeName, 'LI');
  });

  suite.test('TestCase-TBA: Lists: Outdent inside LI in end of OL in LI', (editor) => {
    editor.getBody().innerHTML = LegacyUnit.trimBrs(
      '<ol>' +
      '<li>a' +
      '<ol>' +
      '<li>b</li>' +
      '<li>c</li>' +
      '</ol>' +
      '</li>' +
      '</ol>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'li li:last', 1);
    LegacyUnit.execCommand(editor, 'Outdent');

    LegacyUnit.equal(editor.getContent(),
      '<ol>' +
      '<li>a' +
      '<ol>' +
      '<li>b</li>' +
      '</ol>' +
      '</li>' +
      '<li>c</li>' +
      '</ol>'
    );

    LegacyUnit.equal(editor.selection.getNode().nodeName, 'LI');
  });

  // Nested lists in OL elements

  suite.test('TestCase-TBA: Lists: Outdent inside LI in beginning of OL in OL', (editor) => {
    editor.getBody().innerHTML = LegacyUnit.trimBrs(
      '<ol>' +
      '<li>a</li>' +
      '<ol>' +
      '<li>b</li>' +
      '<li>c</li>' +
      '</ol>' +
      '</ol>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'ol ol li', 1);
    LegacyUnit.execCommand(editor, 'Outdent');

    LegacyUnit.equal(editor.getContent(),
      '<ol>' +
      '<li>a</li>' +
      '<li>b' +
      '<ol>' +
      '<li>c</li>' +
      '</ol>' +
      '</li>' +
      '</ol>'
    );

    LegacyUnit.equal(editor.selection.getNode().nodeName, 'LI');
  });

  suite.test('TestCase-TBA: Lists: Outdent inside LI in middle of OL in OL', (editor) => {
    editor.getBody().innerHTML = LegacyUnit.trimBrs(
      '<ol>' +
      '<li>a</li>' +
      '<ol>' +
      '<li>b</li>' +
      '<li>c</li>' +
      '<li>d</li>' +
      '</ol>' +
      '</ol>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'ol ol li:nth-child(2)', 1);
    LegacyUnit.execCommand(editor, 'Outdent');

    LegacyUnit.equal(editor.getContent(),
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

    LegacyUnit.equal(editor.selection.getNode().nodeName, 'LI');
  });

  suite.test('TestCase-TBA: Lists: Outdent inside first/last LI in inner OL', (editor) => {
    editor.getBody().innerHTML = LegacyUnit.trimBrs(
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

    editor.focus();
    LegacyUnit.setSelection(editor, 'ol ol li:nth-child(1)', 0, 'ol ol li:nth-child(2)', 1);
    LegacyUnit.execCommand(editor, 'Outdent');

    LegacyUnit.equal(editor.getContent(),
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

  suite.test('TestCase-TBA: Lists: Outdent inside first LI in inner OL where OL is single child of parent LI', (editor) => {
    editor.getBody().innerHTML = LegacyUnit.trimBrs(
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

    editor.focus();
    LegacyUnit.setSelection(editor, 'ol ol li:first', 0);
    LegacyUnit.execCommand(editor, 'Outdent');

    LegacyUnit.equal(editor.getContent(),
      '<ol>' +
      '<li>a</li>' +
      '<li>b' +
      '<ol>' +
      '<li>c</li>' +
      '</ol>' +
      '</li>' +
      '</ol>'
    );

    LegacyUnit.equal(editor.selection.getNode().nodeName, 'LI');
  });

  suite.test('TestCase-TBA: Lists: Outdent inside LI in end of OL in OL', (editor) => {
    editor.getBody().innerHTML = LegacyUnit.trimBrs(
      '<ol>' +
      '<li>a</li>' +
      '<ol>' +
      '<li>b</li>' +
      '<li>c</li>' +
      '</ol>' +
      '</ol>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'ol ol li:last', 1);
    LegacyUnit.execCommand(editor, 'Outdent');

    LegacyUnit.equal(editor.getContent(),
      '<ol>' +
      '<li>a' +
      '<ol>' +
      '<li>b</li>' +
      '</ol>' +
      '</li>' +
      '<li>c</li>' +
      '</ol>'
    );

    LegacyUnit.equal(editor.selection.getNode().nodeName, 'LI');
  });

  suite.test('TestCase-TBA: Lists: Outdent inside only child LI in OL in OL', (editor) => {
    editor.getBody().innerHTML = LegacyUnit.trimBrs(
      '<ol>' +
      '<li>a' +
      '<ol>' +
      '<li>b</li>' +
      '</ol>' +
      '</li>' +
      '</ol>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'ol ol li', 0);
    LegacyUnit.execCommand(editor, 'Outdent');

    LegacyUnit.equal(editor.getContent(),
      '<ol>' +
      '<li>a</li>' +
      '<li>b</li>' +
      '</ol>'
    );

    LegacyUnit.equal(editor.selection.getNode().nodeName, 'LI');
  });

  suite.test('TestCase-TBA: Lists: Outdent multiple LI in OL and nested OL', (editor) => {
    editor.getBody().innerHTML = LegacyUnit.trimBrs(
      '<ol>' +
      '<li>a' +
      '<ol>' +
      '<li>b</li>' +
      '</ol>' +
      '</li>' +
      '</ol>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'li', 0, 'li li', 1);
    LegacyUnit.execCommand(editor, 'Outdent');

    LegacyUnit.equal(editor.getContent(),
      '<p>a</p>' +
      '<ol>' +
      '<li>b</li>' +
      '</ol>'
    );
  });

  suite.test('TestCase-TBA: Lists: Outdent on li with inner block element', (editor) => {
    editor.getBody().innerHTML = LegacyUnit.trimBrs(
      '<ul>' +
      '<li><p>a</p></li>' +
      '<li><p>b</p></li>' +
      '<li><p>c</p></li>' +
      '</ul>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'ul li:nth-child(2) p', 0);
    LegacyUnit.execCommand(editor, 'Outdent');

    LegacyUnit.equal(editor.getContent(),
      '<ul>' +
        '<li><p>a</p></li>' +
      '</ul>' +
      '<p>b</p>' +
      '<ul>' +
        '<li><p>c</p></li>' +
      '</ul>'
    );
  });

  suite.test('TestCase-TBA: Lists: Outdent on nested li with inner block element', (editor) => {
    editor.getBody().innerHTML = LegacyUnit.trimBrs(
      '<ul>' +
        '<li>' +
          '<p>a</p>' +
          '<ul><li><p>b</p></li></ul>' +
        '</li>' +
        '<li><p>c</p></li>' +
      '</ul>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'ul li:nth-child(1) li p', 0);
    LegacyUnit.execCommand(editor, 'Outdent');

    LegacyUnit.equal(editor.getContent(),
      '<ul>' +
      '<li><p>a</p></li>' +
      '<li><p>b</p></li>' +
      '<li><p>c</p></li>' +
      '</ul>'
    );
  });

  suite.test('Outdent nested ul in ol', (editor) => {
    editor.getBody().innerHTML = LegacyUnit.trimBrs(
      '<ol>' +
        '<li style="list-style-type: none;">' +
          '<ul>' +
            '<li>a</li>' +
          '</ul>' +
        '</li>' +
      '</ol>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'ul', 0);
    LegacyUnit.execCommand(editor, 'Outdent');

    LegacyUnit.equal(editor.getContent(),
      '<ul>' +
        '<li>a</li>' +
      '</ul>'
    );
  });

  suite.test('Outdenting an item should not affect its attributes', (editor) => {
    editor.getBody().innerHTML = LegacyUnit.trimBrs(
      '<ul>' +
        '<li style="color: red;" class="xyz">a' +
          '<ul>' +
            '<li style="color: blue;">b</li>' +
          '</ul>' +
        '</li>' +
      '</ul>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'ul ul li', 0);
    LegacyUnit.execCommand(editor, 'Outdent');

    LegacyUnit.equal(editor.getContent(),
      '<ul>' +
        '<li style="color: red;" class="xyz">a</li>' +
        '<li style="color: blue;">b</li>' +
      '</ul>'
    );
  });

  suite.test('TestCase-TBA: Lists: Outdent inside LI in beginning of OL in LI with start attribute', (editor) => {
    editor.getBody().innerHTML = LegacyUnit.trimBrs(
      '<ol>' +
      '<li>a' +
      '<ol start="5">' +
      '<li>b</li>' +
      '<li>c</li>' +
      '</ol>' +
      '</li>' +
      '</ol>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'li li', 1);
    LegacyUnit.execCommand(editor, 'Outdent');

    LegacyUnit.equal(editor.getContent(),
      '<ol>' +
      '<li>a</li>' +
      '<li>b' +
      '<ol start="5">' +
      '<li>c</li>' +
      '</ol>' +
      '</li>' +
      '</ol>'
    );

    LegacyUnit.equal(editor.selection.getNode().nodeName, 'LI');
  });

  suite.test('TestCase-TBA: Lists: Outdent inside LI in beginning of OL in LI with start attribute on both OL', (editor) => {
    editor.getBody().innerHTML = LegacyUnit.trimBrs(
      '<ol start="2">' +
      '<li>a' +
      '<ol start="5">' +
      '<li>b</li>' +
      '<li>c</li>' +
      '</ol>' +
      '</li>' +
      '</ol>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'li li', 1);
    LegacyUnit.execCommand(editor, 'Outdent');

    LegacyUnit.equal(editor.getContent(),
      '<ol start="2">' +
      '<li>a</li>' +
      '<li>b' +
      '<ol start="5">' +
      '<li>c</li>' +
      '</ol>' +
      '</li>' +
      '</ol>'
    );

    LegacyUnit.equal(editor.selection.getNode().nodeName, 'LI');
  });

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    Pipeline.async({}, Log.steps('TBA', 'Lists: Outdent tests', suite.toSteps(editor)), onSuccess, onFailure);
  }, {
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
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
