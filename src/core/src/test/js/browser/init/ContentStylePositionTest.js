asynctest(
  'browser.tinymce.core.init.ContentStylePositionTest',
  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.mcagar.api.TinyLoader',
    'tinymce.themes.modern.Theme'
  ],
  function (Assertions, Pipeline, Step, TinyLoader, ModernTheme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    ModernTheme();

    var contentStyle = '.class {color: blue;}';

    TinyLoader.setup(function (editor, onSuccess, onFailure) {

      Pipeline.async({}, [
        Step.sync(function () {
          var head = editor.getDoc().head;

          Assertions.assertEq('last element in head should be content_style', contentStyle, head.lastChild.innerText);
        })
      ], onSuccess, onFailure);
    }, {
      content_style: contentStyle,
      skin_url: '/project/src/skins/lightgray/dist/lightgray'
    }, success, failure);
  }
);