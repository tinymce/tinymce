import { Log, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { LegacyUnit, TinyLoader } from '@ephox/mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/lists/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.plugins.lists.RemoveTest', (success, failure) => {
  const suite = LegacyUnit.createSuite<Editor>();

  Plugin();
  Theme();

  suite.test('TestCase-TBA: Lists: Remove UL at single LI', (editor) => {
    editor.getBody().innerHTML = LegacyUnit.trimBrs(
      '<ul>' +
      '<li>a</li>' +
      '</ul>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'li', 0);
    LegacyUnit.execCommand(editor, 'InsertUnorderedList');

    LegacyUnit.equal(editor.getContent(),
      '<p>a</p>'
    );
    LegacyUnit.equal(editor.selection.getStart().nodeName, 'P');
  });

  suite.test('TestCase-TBA: Lists: Remove UL at start LI', (editor) => {
    editor.getBody().innerHTML = LegacyUnit.trimBrs(
      '<ul>' +
      '<li>a</li>' +
      '<li>b</li>' +
      '<li>c</li>' +
      '</ul>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'li', 0);
    LegacyUnit.execCommand(editor, 'InsertUnorderedList');

    LegacyUnit.equal(editor.getContent(),
      '<p>a</p>' +
      '<ul>' +
      '<li>b</li>' +
      '<li>c</li>' +
      '</ul>'
    );
    LegacyUnit.equal(editor.selection.getStart().nodeName, 'P');
  });

  suite.test('TestCase-TBA: Lists: Remove UL at start empty LI', (editor) => {
    editor.getBody().innerHTML = LegacyUnit.trimBrs(
      '<ul>' +
      '<li><br></li>' +
      '<li>b</li>' +
      '<li>c</li>' +
      '</ul>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'li', 0);
    LegacyUnit.execCommand(editor, 'InsertUnorderedList');

    LegacyUnit.equal(editor.getContent(),
      '<p>\u00a0</p>' +
      '<ul>' +
      '<li>b</li>' +
      '<li>c</li>' +
      '</ul>'
    );
    LegacyUnit.equal(editor.selection.getNode().nodeName, 'P');
  });

  suite.test('TestCase-TBA: Lists: Remove UL at middle LI', (editor) => {
    editor.getBody().innerHTML = LegacyUnit.trimBrs(
      '<ul>' +
      '<li>a</li>' +
      '<li>b</li>' +
      '<li>c</li>' +
      '</ul>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'li:nth-child(2)', 1);
    LegacyUnit.execCommand(editor, 'InsertUnorderedList');

    LegacyUnit.equal(editor.getContent(),
      '<ul>' +
      '<li>a</li>' +
      '</ul>' +
      '<p>b</p>' +
      '<ul>' +
      '<li>c</li>' +
      '</ul>'
    );
    LegacyUnit.equal(editor.selection.getStart().nodeName, 'P');
  });

  suite.test('TestCase-TBA: Lists: Remove UL at middle empty LI', (editor) => {
    editor.getBody().innerHTML = LegacyUnit.trimBrs(
      '<ul>' +
      '<li>a</li>' +
      '<li><br></li>' +
      '<li>c</li>' +
      '</ul>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'li:nth-child(2)', 0);
    LegacyUnit.execCommand(editor, 'InsertUnorderedList');

    LegacyUnit.equal(editor.getContent(),
      '<ul>' +
      '<li>a</li>' +
      '</ul>' +
      '<p>\u00a0</p>' +
      '<ul>' +
      '<li>c</li>' +
      '</ul>'
    );
    LegacyUnit.equal(editor.selection.getNode().nodeName, 'P');
  });

  suite.test('TestCase-TBA: Lists: Remove UL at end LI', (editor) => {
    editor.getBody().innerHTML = LegacyUnit.trimBrs(
      '<ul>' +
      '<li>a</li>' +
      '<li>b</li>' +
      '<li>c</li>' +
      '</ul>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'li:last', 1);
    LegacyUnit.execCommand(editor, 'InsertUnorderedList');

    LegacyUnit.equal(editor.getContent(),
      '<ul>' +
      '<li>a</li>' +
      '<li>b</li>' +
      '</ul>' +
      '<p>c</p>'
    );
    LegacyUnit.equal(editor.selection.getStart().nodeName, 'P');
  });

  suite.test('TestCase-TBA: Lists: Remove UL at end empty LI', (editor) => {
    editor.getBody().innerHTML = LegacyUnit.trimBrs(
      '<ul>' +
      '<li>a</li>' +
      '<li>b</li>' +
      '<li><br></li>' +
      '</ul>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'li:last', 0);
    LegacyUnit.execCommand(editor, 'InsertUnorderedList');

    LegacyUnit.equal(editor.getContent(),
      '<ul>' +
      '<li>a</li>' +
      '<li>b</li>' +
      '</ul>' +
      '<p>\u00a0</p>'
    );
    LegacyUnit.equal(editor.selection.getNode().nodeName, 'P');
  });

  suite.test('TestCase-TBA: Lists: Remove UL at middle LI inside parent OL', (editor) => {
    editor.getBody().innerHTML = LegacyUnit.trimBrs(
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

    editor.focus();
    LegacyUnit.setSelection(editor, 'ul li:nth-child(2)', 1);
    LegacyUnit.execCommand(editor, 'InsertUnorderedList');

    LegacyUnit.equal(editor.getContent(),
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
    LegacyUnit.equal(editor.selection.getStart().nodeName, 'P');
  });

  suite.test('TestCase-TBA: Lists: Remove UL at middle LI inside parent OL (html5)', (editor) => {
    editor.getBody().innerHTML = LegacyUnit.trimBrs(
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

    editor.focus();
    LegacyUnit.setSelection(editor, 'ul li:nth-child(2)', 1);
    LegacyUnit.execCommand(editor, 'InsertUnorderedList');

    LegacyUnit.equal(editor.getContent(),
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
    LegacyUnit.equal(editor.selection.getStart().nodeName, 'P');
  });

  suite.test('TestCase-TBA: Lists: Remove OL on a deep nested LI', (editor) => {
    editor.getBody().innerHTML = LegacyUnit.trimBrs(
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

    editor.focus();
    LegacyUnit.setSelection(editor, 'ol ol ol li:nth-child(2)', 1);
    LegacyUnit.execCommand(editor, 'InsertOrderedList');

    LegacyUnit.equal(editor.getContent(),
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

    LegacyUnit.equal(editor.selection.getStart().nodeName, 'P');
  });

  suite.test('TestCase-TBA: Lists: Remove empty UL between two textblocks', (editor) => {
    editor.getBody().innerHTML = LegacyUnit.trimBrs(
      '<div>a</div>' +
      '<ul>' +
      '<li></li>' +
      '</ul>' +
      '<div>b</div>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'li:first', 0);
    LegacyUnit.execCommand(editor, 'InsertUnorderedList');

    LegacyUnit.equal(editor.getContent(),
      '<div>a</div>' +
      '<p>\u00a0</p>' +
      '<div>b</div>'
    );
    LegacyUnit.equal(editor.selection.getNode().nodeName, 'P');
  });

  suite.test('TestCase-TBA: Lists: Remove indented list with single item', (editor) => {
    editor.getBody().innerHTML = LegacyUnit.trimBrs(
      '<ul>' +
      '<li>a' +
      '<ul>' +
      '<li>b</li>' +
      '</ul>' +
      '</li>' +
      '<li>c</li>' +
      '</ul>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'li li', 0, 'li li', 1);
    LegacyUnit.execCommand(editor, 'InsertUnorderedList');

    LegacyUnit.equal(editor.getContent(),
      '<ul>' +
      '<li>a</li>' +
      '</ul>' +
      '<p>b</p>' +
      '<ul>' +
      '<li>c</li>' +
      '</ul>'
    );
    LegacyUnit.equal(editor.selection.getNode().nodeName, 'P');
  });

  suite.test('TestCase-TBA: Lists: Remove indented list with multiple items', (editor) => {
    editor.getBody().innerHTML = LegacyUnit.trimBrs(
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

    editor.focus();
    LegacyUnit.setSelection(editor, 'li li:first', 0, 'li li:last', 1);
    LegacyUnit.execCommand(editor, 'InsertUnorderedList');

    LegacyUnit.equal(editor.getContent(),
      '<ul>' +
      '<li>a</li>' +
      '</ul>' +
      '<p>b</p>' +
      '<p>c</p>' +
      '<ul>' +
      '<li>d</li>' +
      '</ul>'
    );
    LegacyUnit.equal((editor.selection.getStart().firstChild as Text).data, 'b');
    LegacyUnit.equal((editor.selection.getEnd().firstChild as Text).data, 'c');
  });

  suite.test('TestCase-TBA: Lists: Remove indented list with multiple items', (editor) => {
    editor.getBody().innerHTML = LegacyUnit.trimBrs(
      '<ul>' +
        '<li>a</li>' +
        '<li><p>b</p></li>' +
        '<li>c</li>' +
      '</ul>'
    );

    editor.focus();
    LegacyUnit.setSelection(editor, 'p', 0);
    LegacyUnit.execCommand(editor, 'InsertUnorderedList');

    LegacyUnit.equal(editor.getContent(),
      '<ul>' +
        '<li>a</li>' +
      '</ul>' +
      '<p>b</p>' +
      '<ul>' +
        '<li>c</li>' +
      '</ul>'
    );
  });

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    Pipeline.async({}, Log.steps('TBA', 'Link: Remove tests', suite.toSteps(editor)), onSuccess, onFailure);
  }, {
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
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
