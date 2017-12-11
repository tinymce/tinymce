asynctest(
  'browser.tinymce.plugins.textcolor.TextcolorCommandsTest',
  [
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.RawAssertions',
    'ephox.agar.api.Step',
    'ephox.katamari.api.Cell',
    'ephox.mcagar.api.TinyApis',
    'ephox.mcagar.api.TinyLoader',
    'ephox.mcagar.api.TinyUi',
    'tinymce.plugins.textcolor.Plugin',
    'tinymce.themes.modern.Theme'
  ],
  function (GeneralSteps, Logger, Pipeline, RawAssertions, Step, Cell, TinyApis, TinyLoader, TinyUi, TextcolorPlugin, ModernTheme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    ModernTheme();
    TextcolorPlugin();

    var state = Cell(null);

    var sAssertState = function (expected) {
      return Step.sync(function () {
        RawAssertions.assertEq('should be same', expected, state.get());
      });
    };

    var sResetState = Step.sync(function () {
      state.set(null);
    });

    TinyLoader.setup(function (editor, onSuccess, onFailure) {

      editor.on('execCommand', function (e) {
        state.set(e.command);
      });

      var tinyUi = TinyUi(editor);
      var tinyApis = TinyApis(editor);

      Pipeline.async({}, [
        Logger.t('apply and remove forecolor and make sure of the right command has been executed', GeneralSteps.sequence([
          tinyApis.sSetContent('hello test'),
          tinyApis.sSetSelection([0, 0], 0, [0, 0], 5),
          tinyUi.sClickOnToolbar('click forecolor', 'div[aria-label="Text color"] > button.mce-open'),
          tinyUi.sClickOnUi('click green color', 'div[data-mce-color="#00FF00"]:first'),
          sAssertState('mceApplyTextcolor'),
          tinyApis.sSetSelection([0, 0, 0], 0, [0, 0, 0], 5),
          tinyUi.sClickOnToolbar('click forecolor', 'div[aria-label="Text color"] > button.mce-open'),
          tinyUi.sClickOnUi('click green color', 'div[data-mce-color="transparent"]:first'),
          sAssertState('mceRemoveTextcolor'),
          sResetState
        ])),
        Logger.t('apply and remove forecolor and make sure of the right command has been executed', GeneralSteps.sequence([
          tinyApis.sSetContent('hello test'),
          tinyApis.sSetSelection([0, 0], 0, [0, 0], 5),
          tinyUi.sClickOnToolbar('click backcolor', 'div[aria-label="Background color"] > button.mce-open'),
          tinyUi.sClickOnUi('click green color', 'div[data-mce-color="#00FF00"]:last'),
          sAssertState('mceApplyTextcolor'),
          tinyApis.sSetSelection([0, 0, 0], 0, [0, 0, 0], 5),
          tinyUi.sClickOnToolbar('click backcolor', 'div[aria-label="Background color"] > button.mce-open'),
          tinyUi.sClickOnUi('click green color', 'div[data-mce-color="transparent"]:first'),
          sAssertState('mceRemoveTextcolor'),
          sResetState
        ]))
      ], onSuccess, onFailure);
    }, {
      plugins: 'textcolor',
      toolbar: 'forecolor backcolor',
      skin_url: '/project/src/skins/lightgray/dist/lightgray'
    }, success, failure);
  }
);