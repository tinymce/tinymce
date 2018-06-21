import { Pipeline } from '@ephox/agar';
import { LegacyUnit } from '@ephox/mcagar';
import DomQuery from 'tinymce/core/api/dom/DomQuery';
import EditorManager from 'tinymce/core/api/EditorManager';
import Plugin from 'tinymce/plugins/lists/Plugin';
import ModernTheme from 'tinymce/themes/modern/Theme';
import { UnitTest } from '@ephox/bedrock';
import { document } from '@ephox/dom-globals';

UnitTest.asynctest('tinymce.lists.browser.BackspaceDeleteInlineTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];
  const suite = LegacyUnit.createSuite();

  Plugin();
  ModernTheme();

  suite.test('Backspace at beginning of LI on body UL', function (editor) {
    editor.focus();
    editor.selection.setCursorLocation(editor.getBody().firstChild.firstChild, 0);
    editor.plugins.lists.backspaceDelete();
    LegacyUnit.equal(DomQuery('#lists ul').length, 3);
    LegacyUnit.equal(DomQuery('#lists li').length, 3);
  });

  suite.test('Delete at end of LI on body UL', function (editor) {
    editor.focus();
    editor.selection.setCursorLocation(editor.getBody().firstChild.firstChild, 1);
    editor.plugins.lists.backspaceDelete(true);
    LegacyUnit.equal(DomQuery('#lists ul').length, 3);
    LegacyUnit.equal(DomQuery('#lists li').length, 3);
  });

  const teardown = function (editor, div) {
    editor.remove();
    div.parentNode.removeChild(div);
  };

  const setup = function (success, failure) {
    const div = document.createElement('div');

    div.innerHTML = (
      '<div id="lists">' +
      '<ul><li>before</li></ul>' +
      '<ul id="inline"><li>x</li></ul>' +
      '<ul><li>after</li></ul>' +
      '</div>'
    );

    document.body.appendChild(div);

    EditorManager.init({
      selector: '#inline',
      inline: true,
      add_unload_trigger: false,
      skin: false,
      plugins: 'lists',
      disable_nodechange: true,
      init_instance_callback (editor) {
        Pipeline.async({}, suite.toSteps(editor), function () {
          teardown(editor, div);
          success();
        }, failure);
      },
      valid_styles: {
        '*': 'color,font-size,font-family,background-color,font-weight,font-style,text-decoration,float,' +
        'margin,margin-top,margin-right,margin-bottom,margin-left,display,position,top,left,list-style-type'
      }
    });
  };

  setup(success, failure);
});
