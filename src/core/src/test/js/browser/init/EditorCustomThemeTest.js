asynctest(
  'browser.tinymce.core.init.EditorCustomThemeTest',
  [
    'ephox.agar.api.Pipeline',
    'ephox.mcagar.api.LegacyUnit',
    'ephox.mcagar.api.TinyLoader',
    'global!document'
  ],
  function (Pipeline, LegacyUnit, TinyLoader, document) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];
    var suite = LegacyUnit.createSuite();

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
      skin_url: '/project/src/skins/lightgray/dist/lightgray',
      theme: function (editor, targetnode) {
        var editorContainer = document.createElement('div');
        editorContainer.id = 'editorContainer';

        var iframeContainer = document.createElement('div');
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
          iframeContainer: iframeContainer,
          editorContainer: editorContainer
        };
      }
    }, success, failure);
  }
);
