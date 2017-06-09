asynctest(
  'browser.tinymce.core.EditorViewIframeTest',
  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.mcagar.api.TinyApis',
    'ephox.mcagar.api.TinyLoader',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.properties.Css',
    'ephox.sugar.api.search.Selectors',
    'tinymce.core.EditorView',
    'tinymce.themes.modern.Theme'
  ],
  function (Assertions, GeneralSteps, Logger, Pipeline, Step, TinyApis, TinyLoader, Element, Css, Selectors, EditorView, Theme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    Theme();

    var isPhantomJs = function () {
      return /PhantomJS/.test(window.navigator.userAgent);
    };

    var getIframeClientRect = function (editor) {
      return Selectors.one('iframe', Element.fromDom(editor.getContentAreaContainer())).map(function (elm) {
        return elm.dom().getBoundingClientRect();
      }).getOrDie();
    };

    var sSetBodyStyles = function (editor, css) {
      return Step.sync(function () {
        Css.setAll(Element.fromDom(editor.getBody()), css);
      });
    };

    var sTestIsXYInContentArea = function (editor) {
      return Step.sync(function () {
        var rect = getIframeClientRect(editor);

        Assertions.assertEq(
          'Should be inside the area since the scrollbars are excluded',
          true,
          EditorView.isXYInContentArea(editor, rect.width - 25, rect.height - 25)
        );

        Assertions.assertEq(
          'Should be outside the area since the cordinate is on the scrollbars',
          false,
          EditorView.isXYInContentArea(editor, rect.width - 5, rect.height - 5)
        );
      });
    };

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      var tinyApis = TinyApis(editor);

      Pipeline.async({}, isPhantomJs() ? [] : [
        Logger.t('isXYInContentArea without borders, margin', GeneralSteps.sequence([
          sSetBodyStyles(editor, { border: '0', margin: '0' }),
          tinyApis.sSetContent('<div style="width: 5000px; height: 5000px">X</div>'),
          sTestIsXYInContentArea(editor)
        ])),

        Logger.t('isXYInContentArea with borders, margin', GeneralSteps.sequence([
          sSetBodyStyles(editor, { border: '5px', margin: '15px' }),
          tinyApis.sSetContent('<div style="width: 5000px; height: 5000px">X</div>'),
          sTestIsXYInContentArea(editor)
        ]))
      ], onSuccess, onFailure);
    }, {
      skin_url: '/project/src/skins/lightgray/dist/lightgray'
    }, success, failure);
  }
);
