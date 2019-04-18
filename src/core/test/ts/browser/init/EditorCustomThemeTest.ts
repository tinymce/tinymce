import { Pipeline } from '@ephox/agar';
import { LegacyUnit, TinyLoader } from '@ephox/mcagar';
import { UnitTest } from '@ephox/bedrock';
import { document } from '@ephox/dom-globals';

UnitTest.asynctest('browser.tinymce.core.init.EditorCustomThemeTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];
  const suite = LegacyUnit.createSuite();

  suite.test('getContainer/getContentAreaContainer', function (editor) {
    LegacyUnit.equal(editor.getContainer().id, 'editorContainer', 'Should be the new editorContainer element');
    LegacyUnit.equal(editor.getContainer().nodeType, 1, 'Should be an element');
    LegacyUnit.equal(editor.getContentAreaContainer().id, 'iframeContainer', 'Should be the new iframeContainer element');
    LegacyUnit.equal(editor.getContentAreaContainer().nodeType, 1, 'Should be an element');
  });

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    Pipeline.async({}, suite.toSteps(editor), onSuccess, onFailure);
  }, {
    add_unload_trigger: false,
    disable_nodechange: true,
    automatic_uploads: false,
    entities: 'raw',
    indent: false,
    base_url: '/project/tinymce/js/tinymce',
    theme (editor, targetnode) {
      const editorContainer = document.createElement('div');
      editorContainer.id = 'editorContainer';

      const iframeContainer = document.createElement('div');
      iframeContainer.id = 'iframeContainer';

      editorContainer.appendChild(iframeContainer);
      targetnode.parentNode.insertBefore(editorContainer, targetnode);

      if (editor.initialized) {
        editor.fire('SkinLoaded');
      } else {
        editor.on('init', function () {
          editor.fire('SkinLoaded');
        });
      }

      return {
        iframeContainer,
        editorContainer
      };
    }
  }, success, failure);
});
