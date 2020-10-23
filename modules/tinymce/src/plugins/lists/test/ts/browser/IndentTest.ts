import { Log, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { LegacyUnit, TinyLoader } from '@ephox/mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/lists/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('tinymce.lists.browser.IndentTest', (success, failure) => {
  const suite = LegacyUnit.createSuite<Editor>();

  Plugin();
  Theme();

  suite.test('TestCase-TBA: Lists: Indent single LI in OL', function (editor) {
    editor.getBody().innerHTML = LegacyUnit.trimBrs(
      '<ol>' +
      '<li>a</li>' +
      '</ol>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'li', 0);
    LegacyUnit.execCommand(editor, 'Indent');

    LegacyUnit.equal(editor.getContent(),
      '<ol>' +
      '<li style="list-style-type: none;">' +
      '<ol>' +
      '<li>a</li>' +
      '</ol>' +
      '</li>' +
      '</ol>'
    );

    LegacyUnit.equal(editor.selection.getNode().nodeName, 'LI');
  });

  suite.test('TestCase-TBA: Lists: Indent middle LI in OL', function (editor) {
    editor.getBody().innerHTML = LegacyUnit.trimBrs(
      '<ol>' +
      '<li>a</li>' +
      '<li>b</li>' +
      '<li>c</li>' +
      '</ol>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'li:nth-child(2)', 0);
    LegacyUnit.execCommand(editor, 'Indent');

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

  suite.test('TestCase-TBA: Lists: Indent single LI in OL and retain OLs list style in the new OL', function (editor) {
    editor.getBody().innerHTML = LegacyUnit.trimBrs(
      '<ol style="list-style-type: lower-alpha;">' +
      '<li>a</li>' +
      '<li>b</li>' +
      '</ol>'
    );

    editor.focus();

    LegacyUnit.setSelection(editor, 'li:nth-child(2)', 0);
    LegacyUnit.execCommand(editor, 'Indent');

    LegacyUnit.equal(editor.getContent(),
      '<ol style="list-style-type: lower-alpha;">' +
      '<li>a' +
      '<ol style="list-style-type: lower-alpha;">' +
      '<li>b</li>' +
      '</ol>' +
      '</li>' +
      '</ol>'
    );
  });

  suite.test('TestCase-TBA: Lists: Indent last LI in OL', function (editor) {
    editor.getBody().innerHTML = LegacyUnit.trimBrs(
      '<ol>' +
      '<li>a</li>' +
      '<li>b</li>' +
      '</ol>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'li:last', 0);
    LegacyUnit.execCommand(editor, 'Indent');

    LegacyUnit.equal(editor.getContent(),
      '<ol>' +
      '<li>a' +
      '<ol>' +
      '<li>b</li>' +
      '</ol>' +
      '</li>' +
      '</ol>'
    );

    LegacyUnit.equal(editor.selection.getNode().nodeName, 'LI');
  });

  suite.test('TestCase-TBA: Lists: Indent in table cell in table inside of list should not do anything', function (editor) {
    editor.getBody().innerHTML = LegacyUnit.trimBrs(
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

    editor.focus();
    LegacyUnit.setSelection(editor, 'td', 0);
    LegacyUnit.execCommand(editor, 'Indent');

    LegacyUnit.equal(editor.getContent(),
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

    LegacyUnit.equal(editor.selection.getNode().nodeName, 'TD');
  });

  suite.test('TestCase-TBA: Lists: Indent last LI to same level as middle LI', function (editor) {
    editor.getBody().innerHTML = LegacyUnit.trimBrs(
      '<ol>' +
      '<li>a' +
      '<ol>' +
      '<li>b</li>' +
      '</ol>' +
      '</li>' +
      '<li>c</li>' +
      '</ol>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'li:last', 1);
    LegacyUnit.execCommand(editor, 'Indent');

    LegacyUnit.equal(editor.getContent(),
      '<ol>' +
      '<li>a' +
      '<ol>' +
      '<li>b</li>' +
      '<li>c</li>' +
      '</ol>' +
      '</li>' +
      '</ol>'
    );

    LegacyUnit.equal(editor.selection.getNode().nodeName, 'LI');
  });

  suite.test('TestCase-TBA: Lists: Indent first LI and nested LI OL', function (editor) {
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
    LegacyUnit.setSelection(editor, 'li', 0, 'li li', 0);
    LegacyUnit.execCommand(editor, 'Indent');

    LegacyUnit.equal(editor.getContent(),
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

    LegacyUnit.equal(editor.selection.getNode().nodeName, 'LI');
  });

  suite.test('TestCase-TBA: Lists: Indent second LI to same level as nested LI', function (editor) {
    editor.getBody().innerHTML = LegacyUnit.trimBrs(
      '<ul>' +
      '<li>a</li>' +
      '<li>b' +
      '<ul>' +
      '<li>c</li>' +
      '</ul>' +
      '</li>' +
      '</ul>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'li:nth-child(2)', 0);
    LegacyUnit.execCommand(editor, 'Indent');

    LegacyUnit.equal(editor.getContent(),
      '<ul>' +
      '<li>a' +
      '<ul>' +
      '<li>b</li>' +
      '<li>c</li>' +
      '</ul>' +
      '</li>' +
      '</ul>'
    );

    LegacyUnit.equal(editor.selection.getNode().nodeName, 'LI');
  });

  suite.test('TestCase-TBA: Lists: Indent second LI to same level as nested LI 2', function (editor) {
    editor.getBody().innerHTML = LegacyUnit.trimBrs(
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

    editor.focus();
    LegacyUnit.setSelection(editor, 'li:nth-child(2)', 1);
    LegacyUnit.execCommand(editor, 'Indent');

    LegacyUnit.equal(editor.getContent(),
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

    LegacyUnit.equal(editor.selection.getNode().nodeName, 'LI');
  });

  suite.test('TestCase-TBA: Lists: Indent second and third LI', function (editor) {
    editor.getBody().innerHTML = LegacyUnit.trimBrs(
      '<ul>' +
      '<li>a</li>' +
      '<li>b</li>' +
      '<li>c</li>' +
      '</ul>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'li:nth-child(2)', 0, 'li:last', 0);
    LegacyUnit.execCommand(editor, 'Indent');

    LegacyUnit.equal(editor.getContent(),
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

  suite.test('TestCase-TBA: Lists: Indent second second li with next sibling to nested li', function (editor) {
    editor.getBody().innerHTML = LegacyUnit.trimBrs(
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

    editor.focus();
    LegacyUnit.setSelection(editor, 'ul > li:nth-child(2)', 1);
    LegacyUnit.execCommand(editor, 'Indent');

    LegacyUnit.equal(editor.getContent(),
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

  suite.test('TestCase-TBA: Lists: Indent on second li with inner block element', function (editor) {
    editor.getBody().innerHTML = LegacyUnit.trimBrs(
      '<ul>' +
      '<li><p>a</p></li>' +
      '<li><p>b</p></li>' +
      '<li><p>c</p></li>' +
      '</ul>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'ul > li:nth-child(2) > p', 0);
    LegacyUnit.execCommand(editor, 'Indent');

    LegacyUnit.equal(editor.getContent(),
      '<ul>' +
        '<li>' +
          '<p>a</p>' +
          '<ul><li><p>b</p></li></ul>' +
        '</li>' +
        '<li><p>c</p></li>' +
      '</ul>'
    );
  });

  suite.test('Indent already indented last li, ul in ol', function (editor) {
    editor.getBody().innerHTML = LegacyUnit.trimBrs(
      '<ol>' +
        '<li>a' +
          '<ul>' +
            '<li>b</li>' +
          '</ul>' +
        '</li>' +
      '</ol>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'ul li', 0);
    LegacyUnit.execCommand(editor, 'Indent');

    LegacyUnit.equal(editor.getContent(),
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

  suite.test('TestCase-TBA: Lists: Indent single LI in OL with start attribute', (editor) => {
    editor.getBody().innerHTML = LegacyUnit.trimBrs(
      '<ol start="5">' +
      '<li>a</li>' +
      '</ol>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'li', 0);
    LegacyUnit.execCommand(editor, 'Indent');

    LegacyUnit.equal(editor.getContent(),
      '<ol>' +
      '<li style="list-style-type: none;">' +
      '<ol>' +
      '<li>a</li>' +
      '</ol>' +
      '</li>' +
      '</ol>'
    );

    LegacyUnit.equal(editor.selection.getNode().nodeName, 'LI');
  });

  suite.test('TestCase-TBA: Lists: Indent first LI and nested LI OL with start attributes', function (editor) {
    editor.getBody().innerHTML = LegacyUnit.trimBrs(
      '<ol start="2">' +
      '<li>a</li>' +
      '<li>' +
      '<ol start="5">' +
      '<li>b</li>' +
      '</ol>' +
      '</li>' +
      '</ol>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'li', 0);
    LegacyUnit.execCommand(editor, 'Indent');

    LegacyUnit.equal(editor.getContent(),
      '<ol>' +
      '<li style="list-style-type: none;">' +
      '<ol start="5">' +
      '<li>a</li>' +
      '<li>b</li>' +
      '</ol>' +
      '</li>' +
      '</ol>'
    );

    LegacyUnit.equal(editor.selection.getNode().nodeName, 'LI');
  });

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    Pipeline.async({}, Log.steps('TBA', 'Lists: List indent tests', suite.toSteps(editor)), onSuccess, onFailure);
  }, {
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
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
