asynctest(
  'browser.tinymce.core.dom.SelectionQuirksTest',
  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.mcagar.api.TinyApis',
    'ephox.mcagar.api.TinyLoader',
    'tinymce.themes.modern.Theme'
  ],
  function (Assertions, GeneralSteps, Pipeline, Step, TinyApis, TinyLoader, Theme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    Theme();

    var sTestFloatedImages = function (tinyApis, editor) {
      return GeneralSteps.sequence([
        tinyApis.sSetContent('<p>a<img src="about:blank" style="float: right"></p>'),
        tinyApis.sSetSelection([0], 1, [0], 2),
        Step.sync(function () {
          var selection = editor.selection.getSel();
          Assertions.assertEq('Anchor node should be the paragraph not the text node', 'P', selection.anchorNode.nodeName);
          Assertions.assertEq('Anchor offset should be the element index', 1, selection.anchorOffset);
        })
      ]);
    };

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      var tinyApis = TinyApis(editor);

      Pipeline.async({}, [
        sTestFloatedImages(tinyApis, editor)
      ], onSuccess, onFailure);
    }, {
      theme: 'modern',
      skin_url: '/project/src/skins/lightgray/dist/lightgray'
    }, success, failure);
  }
);
