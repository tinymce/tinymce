asynctest(
  'browser.tinymce.plugins.visualblocks.PreviewFormatsTest',
  [
    'ephox.agar.api.ApproxStructure',
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.mcagar.api.TinyApis',
    'ephox.mcagar.api.TinyLoader',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.properties.Class',
    'tinymce.plugins.visualblocks.Plugin',
    'tinymce.themes.modern.Theme'
  ],
  function (ApproxStructure, Assertions, Pipeline, Step, TinyApis, TinyLoader, Element, Class, VisualBlocksPlugin, ModernTheme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    ModernTheme();
    VisualBlocksPlugin();

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      var tinyApis = TinyApis(editor);

      Pipeline.async({}, [
        tinyApis.sExecCommand('mceVisualBlocks'),
        Step.sync(function () {
          Assertions.assertEq('Visual blocks class should exist', true, Class.has(Element.fromDom(editor.getBody()), 'mce-visualblocks'));
          Assertions.assertEq('Should not have a background property', true, editor.formatter.getCssText('h1').indexOf('background') === -1);
        }),
        tinyApis.sExecCommand('mceVisualBlocks'),
        Step.sync(function () {
          Assertions.assertEq('Visual blocks class should not exist', false, Class.has(Element.fromDom(editor.getBody()), 'mce-visualblocks'));
          Assertions.assertEq('Should not have a background property', true, editor.formatter.getCssText('h1').indexOf('background') === -1);
          Assertions.assertEq('Visual blocks class should still not exist', false, Class.has(Element.fromDom(editor.getBody()), 'mce-visualblocks'));
        })
      ], onSuccess, onFailure);
    }, {
      plugins: 'visualblocks',
      toolbar: 'visualblocks',
      skin_url: '/project/src/skins/lightgray/dist/lightgray'
    }, success, failure);
  }
);