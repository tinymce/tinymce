asynctest(
  'browser.tinymce.plugins.textpattern.TrailingPunctuationTest',
  [
    'ephox.agar.api.ApproxStructure',
    'ephox.agar.api.Keys',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.mcagar.api.TinyActions',
    'ephox.mcagar.api.TinyApis',
    'ephox.mcagar.api.TinyDom',
    'ephox.mcagar.api.TinyLoader',
    'ephox.mcagar.api.TinyUi',
    'tinymce.plugins.textpattern.Plugin',
    'tinymce.themes.modern.Theme',
    'tinymce.plugins.textpattern.test.Utils'
  ],
  function (ApproxStructure, Keys, Logger, Pipeline, Step, TinyActions, TinyApis, TinyDom, TinyLoader, TinyUi, TextpatternPlugin, ModernTheme, Utils) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    ModernTheme();
    TextpatternPlugin();

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      var tinyUi = TinyUi(editor);
      var tinyApis = TinyApis(editor);
      var tinyActions = TinyActions(editor);

      Pipeline.async({}, [
        Step.wait(100),
        Utils.sSetContentAndPressKey(tinyApis, tinyActions, '*test*.', Keys.space()),
        tinyApis.sAssertContentStructure(ApproxStructure.build(function (s, str) {
          return s.element('body', {
            children: [
              s.element('p', {
                children: [
                  s.element('em', {}),
                  s.text(str.is('.'))
                ]
              })
            ]
          });
        })),
        Step.wait(50000)
      ], onSuccess, onFailure);
    }, {
      plugins: 'textpattern',
      skin_url: '/project/src/skins/lightgray/dist/lightgray'
    }, success, failure);
  }
);