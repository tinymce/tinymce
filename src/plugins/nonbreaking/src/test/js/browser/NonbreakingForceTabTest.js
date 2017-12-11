asynctest(
  'browser.tinymce.plugins.nonbreaking.NonbreakingForceTabTest',
  [
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Keys',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.RawAssertions',
    'ephox.agar.api.Step',
    'ephox.mcagar.api.TinyActions',
    'ephox.mcagar.api.TinyApis',
    'ephox.mcagar.api.TinyLoader',
    'tinymce.core.util.VK',
    'tinymce.plugins.nonbreaking.Plugin',
    'tinymce.themes.modern.Theme'
  ],
  function (GeneralSteps, Keys, Logger, Pipeline, RawAssertions, Step, TinyActions, TinyApis, TinyLoader, VK, NonbreakingPlugin, ModernTheme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    ModernTheme();
    NonbreakingPlugin();

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      var tinyApis = TinyApis(editor);
      var tinyActions = TinyActions(editor);

      Pipeline.async({}, [
        Logger.t('Undo level on insert tab', GeneralSteps.sequence([
          tinyActions.sContentKeystroke(Keys.tab(), {}),
          tinyApis.sAssertContent('<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</p>'),
          Step.sync(function () {
            editor.undoManager.undo();
          }),
          tinyApis.sAssertContent('')
        ])),
        Logger.t('Prevent default and other handlers on insert tab', GeneralSteps.sequence([
          Step.sync(function () {
            var args = editor.fire('keydown', { keyCode: VK.TAB });
            RawAssertions.assertEq('Default should be prevented', true, args.isDefaultPrevented());
            RawAssertions.assertEq('Should not propagate', true, args.isImmediatePropagationStopped());
          })
        ]))
      ], onSuccess, onFailure);
    }, {
      plugins: 'nonbreaking',
      toolbar: 'nonbreaking',
      nonbreaking_force_tab: 5,
      skin_url: '/project/src/skins/lightgray/dist/lightgray'
    }, success, failure);
  }
);