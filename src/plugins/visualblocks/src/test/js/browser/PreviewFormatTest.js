asynctest(
  'browser.tinymce.plugins.visualblocks.PreviewFormatsTest',
  [
    'ephox.agar.api.ApproxStructure',
    'ephox.agar.api.Assertions',
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.agar.api.Waiter',
    'ephox.mcagar.api.TinyApis',
    'ephox.mcagar.api.TinyLoader',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.properties.Class',
    'ephox.sugar.api.properties.Css',
    'tinymce.plugins.visualblocks.Plugin',
    'tinymce.themes.modern.Theme'
  ],
  function (ApproxStructure, Assertions, GeneralSteps, Logger, Pipeline, Step, Waiter, TinyApis, TinyLoader, Element, Class, Css, VisualBlocksPlugin, ModernTheme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    ModernTheme();
    VisualBlocksPlugin();

    var sWaitForVisualBlocks = function (editor) {
      return Waiter.sTryUntil('Wait background css to be applied to first element', Step.sync(function () {
        var p = Element.fromDom(editor.getBody().firstChild);
        var background = Css.get(p, 'background-image');
        Assertions.assertEq('Paragraph should have a url background', true, background.indexOf('url(') === 0);
      }), 10, 1000);
    };

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      var tinyApis = TinyApis(editor);

      Pipeline.async({}, [
        Logger.t('Toggle on/off visualblocks and compute previews', GeneralSteps.sequence([
          tinyApis.sExecCommand('mceVisualBlocks'),
          sWaitForVisualBlocks(editor),
          Step.sync(function () {
            Assertions.assertEq('Visual blocks class should exist', true, Class.has(Element.fromDom(editor.getBody()), 'mce-visualblocks'));
            Assertions.assertEq('Should not have a border property', true, editor.formatter.getCssText('h1').indexOf('border:1px dashed') === -1);
          }),
          tinyApis.sExecCommand('mceVisualBlocks'),
          Step.sync(function () {
            Assertions.assertEq('Visual blocks class should not exist', false, Class.has(Element.fromDom(editor.getBody()), 'mce-visualblocks'));
            Assertions.assertEq('Should not have a border property', true, editor.formatter.getCssText('h1').indexOf('border:1px dashed') === -1);
            Assertions.assertEq('Visual blocks class should still not exist', false, Class.has(Element.fromDom(editor.getBody()), 'mce-visualblocks'));
          })
        ]))
      ], onSuccess, onFailure);
    }, {
      plugins: 'visualblocks',
      toolbar: 'visualblocks',
      visualblocks_content_css: '/project/src/plugins/visualblocks/dist/visualblocks/css/visualblocks.css',
      skin_url: '/project/src/skins/lightgray/dist/lightgray'
    }, success, failure);
  }
);