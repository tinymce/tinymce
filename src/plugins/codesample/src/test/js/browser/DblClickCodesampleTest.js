asynctest(
  'browser.tinymce.plugins.codesample.DblClickCodesampleTest',
  [
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.mcagar.api.TinyLoader',
    'ephox.mcagar.api.TinyUi',
    'global!document',
    'tinymce.plugins.codesample.Plugin',
    'tinymce.themes.modern.Theme'
  ],

  function (GeneralSteps, Logger, Pipeline, Step, TinyLoader, TinyUi, document, CodePlugin, ModernTheme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    CodePlugin();
    ModernTheme();

    var sInsertTextareaContent = function (value) {
      return Step.sync(function () {
        var textarea = document.querySelector('div[role="dialog"] textarea');
        textarea.value = value;
      });
    };

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      var tinyUi = TinyUi(editor);

      Pipeline.async({}, [
        Logger.t('doubleclick on codesample opens dialog', GeneralSteps.sequence([
          tinyUi.sClickOnToolbar('click code button', 'div[aria-label="Insert/Edit code sample"] button'),
          tinyUi.sWaitForPopup('wait for window', 'div[role="dialog"]'),
          sInsertTextareaContent('<p>a</p>'),
          tinyUi.sClickOnUi('click OK btn', 'div.mce-primary button'),
          Step.sync(function () {
            var pre = editor.getBody().querySelector('pre');
            editor.fire('dblclick', { target: pre });
          }),
          tinyUi.sWaitForPopup('wait for window', 'div[role="dialog"]')
        ]))
      ], onSuccess, onFailure);
    }, {
      plugins: 'codesample',
      toolbar: 'codesample',
      skin_url: '/project/src/skins/lightgray/dist/lightgray'
    }, success, failure);
  }
);
