asynctest(
  'browser.tinymce.core.delete.DeleteElementTest',
  [
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.mcagar.api.TinyApis',
    'ephox.mcagar.api.TinyLoader',
    'ephox.sugar.api.node.Element',
    'tinymce.core.delete.DeleteElement',
    'tinymce.themes.modern.Theme'
  ],
  function (GeneralSteps, Pipeline, Step, TinyApis, TinyLoader, Element, DeleteElement, Theme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    Theme();

    var sDeleteElement = function (tinyApis, editor, selector, setupHtml, setupPath, setupOffset, expectedHtml, expectedPath, expectedOffet) {
      return GeneralSteps.sequence([
        tinyApis.sSetContent(setupHtml),
        tinyApis.sSetCursor(setupPath, setupOffset),
        Step.sync(function () {
          var elm = Element.fromDom(editor.dom.select(selector)[0]);
          DeleteElement.deleteElement(editor, false, elm);
        }),
        tinyApis.sAssertContent(expectedHtml),
        tinyApis.sAssertSelection(expectedPath, expectedOffet, expectedPath, expectedOffet)
      ]);
    };

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      var tinyApis = TinyApis(editor);

      Pipeline.async({}, [
        tinyApis.sFocus,
        sDeleteElement(tinyApis, editor, 'img', '<p><img src="#"></p>', [0], 1, '', [0], 0),
        sDeleteElement(tinyApis, editor, 'img:nth-child(1)', '<p><img src="#"><img src="#"></p>', [0], 2, '<p><img src="#" /></p>', [0], 0),
        sDeleteElement(tinyApis, editor, 'img:nth-child(2)', '<p><img src="#"><img src="#"></p>', [0], 2, '<p><img src="#" /></p>', [0], 1)
      ], onSuccess, onFailure);
    }, {
      add_unload_trigger: false,
      skin_url: '/project/src/skins/lightgray/dist/lightgray'
    }, success, failure);
  }
);