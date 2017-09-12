asynctest(
  'browser.tinymce.selection.SetSelectionContentTest',
  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Chain',
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.mcagar.api.TinyApis',
    'ephox.mcagar.api.TinyLoader',
    'tinymce.core.selection.SetSelectionContent',
    'tinymce.themes.modern.Theme'
  ],
  function (Assertions, Chain, GeneralSteps, Logger, Pipeline, Step, TinyApis, TinyLoader, SetSelectionContent, Theme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    Theme();

    var sSetContent = function (editor, content, args) {
      return Step.sync(function () {
        SetSelectionContent.setContent(editor, content, args);
      });
    };

    var sSetContentOverride = function (editor, content, overrideContent, args) {
      return Step.sync(function () {
        var handler = function (e) {
          if (e.selection === true) {
            e.preventDefault();
            editor.getBody().innerHTML = overrideContent;
          }
        };

        editor.on('BeforeSetContent', handler);
        SetSelectionContent.setContent(editor, content, args);
        editor.off('BeforeSetContent', handler);
      });
    };

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      var tinyApis = TinyApis(editor);

      Pipeline.async({}, [
        Logger.t('Should insert a before b', GeneralSteps.sequence([
          tinyApis.sSetContent('<p>b</p>'),
          tinyApis.sSetSelection([0, 0], 0, [0, 0], 0),
          sSetContent(editor, 'a', {}),
          tinyApis.sAssertContent('<p>ab</p>')
        ])),
        Logger.t('Should fill the body with x h1 instead of a before b in a paragraph', GeneralSteps.sequence([
          tinyApis.sSetContent('<p>b</p>'),
          tinyApis.sSetSelection([0, 0], 0, [0, 0], 0),
          sSetContentOverride(editor, 'a', '<h1>x</h1>', {}),
          tinyApis.sAssertContent('<h1>x</h1>')
        ]))
      ], onSuccess, onFailure);
    }, {
      selector: 'textarea',
      indent: false,
      skin_url: '/project/src/skins/lightgray/dist/lightgray'
    }, success, failure);
  }
);
