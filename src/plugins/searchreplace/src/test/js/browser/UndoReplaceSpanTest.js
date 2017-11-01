asynctest(
  'browser.tinymce.plugins.searchreplace.UndoReplaceSpanTest',
  [
    'ephox.agar.api.Chain',
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Mouse',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.agar.api.UiControls',
    'ephox.agar.api.UiFinder',
    'ephox.mcagar.api.TinyApis',
    'ephox.mcagar.api.TinyLoader',
    'ephox.mcagar.api.TinyUi',
    'tinymce.plugins.searchreplace.Plugin',
    'tinymce.themes.modern.Theme'
  ],
  function (Chain, GeneralSteps, Logger, Mouse, Pipeline, Step, UiControls, UiFinder, TinyApis, TinyLoader, TinyUi, SearchreplacePlugin, ModernTheme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    ModernTheme();
    SearchreplacePlugin();

    var sUndo = function (editor) {
      return Step.sync(function () {
        editor.undoManager.undo();
      });
    };

    var sRedo = function (editor) {
      return Step.sync(function () {
        editor.undoManager.redo();
      });
    };

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      var tinyApis = TinyApis(editor);
      var tinyUi = TinyUi(editor);

      Pipeline.async({}, [
        Logger.t('replace on of three found, undo and redo and there be no matcher spans in editor', GeneralSteps.sequence([
          tinyApis.sSetContent('<p>cats cats cats</p>'),
          tinyUi.sClickOnToolbar('click on searchreplace button', 'div[aria-label="Find and replace"] button'),
          Chain.asStep({}, [
            Chain.fromParent(tinyUi.cWaitForPopup('wait for dialog', 'div[role="dialog"]'), [
              Chain.fromChains([
                UiFinder.cFindIn('label:contains("Find") + input'),
                UiControls.cSetValue('cats')
              ]),
              Chain.fromChains([
                UiFinder.cFindIn('label:contains("Replace with") + input'),
                UiControls.cSetValue('dogs')
              ]),
              Chain.fromChains([
                UiFinder.cFindIn('button:contains("Find")'),
                Mouse.cClick
              ]),
              Chain.fromChains([
                UiFinder.cWaitFor('wait for button to be enabled', 'div[aria-disabled="false"] span:contains("Replace")')
              ]),
              Chain.fromChains([
                UiFinder.cFindIn('button:contains("Replace")'),
                Mouse.cClick
              ]),
              Chain.fromChains([
                UiFinder.cFindIn('button.mce-close'),
                Mouse.cClick
              ])
            ])
          ]),
          sUndo(editor),
          tinyApis.sAssertContent('<p>cats cats cats</p>'),
          sRedo(editor),
          tinyApis.sAssertContentPresence({ 'span.mce-match-marker': 0 }),
          tinyApis.sAssertContent('<p>dogs cats cats</p>')
        ]))
      ], onSuccess, onFailure);
    }, {
      plugins: 'searchreplace',
      toolbar: 'searchreplace',
      skin_url: '/project/src/skins/lightgray/dist/lightgray'
    }, success, failure);
  }
);