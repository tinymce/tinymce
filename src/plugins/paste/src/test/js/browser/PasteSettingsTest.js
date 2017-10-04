asynctest(
  'tinymce.plugins.paste.browser.PasteSettingsTest',
  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Chain',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Pipeline',
    'ephox.katamari.api.Merger',
    'tinymce.core.EditorManager',
    'tinymce.core.test.ViewBlock',
    'tinymce.plugins.paste.Plugin',
    'tinymce.themes.modern.Theme'
  ],
  function (Assertions, Chain, Logger, Pipeline, Merger, EditorManager, ViewBlock, Plugin, Theme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];
    var viewBlock = new ViewBlock();

    Theme();
    Plugin();

    var cCreateInlineEditor = function (settings) {
      return Chain.on(function (viewBlock, next, die) {
        viewBlock.update('<div id="inline-tiny"></div>');

        EditorManager.init(Merger.merge({
          selector: '#inline-tiny',
          inline: true,
          skin_url: '/project/src/skins/lightgray/dist/lightgray',
          setup: function (editor) {
            editor.on('SkinLoaded', function () {
              next(Chain.wrap(editor));
            });
          }
        }, settings));
      });
    };

    var cRemoveEditor = Chain.op(function (editor) {
      editor.remove();
    });

    viewBlock.attach();
    Pipeline.async({}, [
      Logger.t('paste_as_text setting', Chain.asStep(viewBlock, [
        cCreateInlineEditor({
          paste_as_text: true,
          plugins: 'paste'
        }),
        Chain.op(function (editor) {
          Assertions.assertEq('Should be text format', 'text', editor.plugins.paste.clipboard.pasteFormat);
        }),
        cRemoveEditor
      ]))
    ], function () {
      viewBlock.detach();
      success();
    }, failure);
  }
);