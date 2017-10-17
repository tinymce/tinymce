asynctest(
  'Browser Test: .AnchorInlineTest',
  [
    'ephox.agar.api.Chain',
    'ephox.agar.api.Keys',
    'ephox.agar.api.Mouse',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.UiControls',
    'ephox.agar.api.UiFinder',
    'ephox.mcagar.api.TinyActions',
    'ephox.mcagar.api.TinyApis',
    'ephox.mcagar.api.TinyLoader',
    'ephox.sugar.api.node.Element',
    'global!document',
    'tinymce.plugins.anchor.Plugin',
    'tinymce.themes.modern.Theme'
  ],
  function (Chain, Keys, Mouse, Pipeline, UiControls, UiFinder, TinyActions, TinyApis, TinyLoader, Element, document, AnchorPlugin, ModernTheme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    ModernTheme();
    AnchorPlugin();

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      var tinyApis = TinyApis(editor);
      var tinyActions = TinyActions(editor);

      Pipeline.async({}, [
        tinyApis.sFocus,
        tinyApis.sSetContent('<p>abc 123</p>'),
        tinyApis.sSetSelection([0, 0], 4, [0, 0], 7),
        tinyActions.sContentKeystroke(Keys.space(), {}),
        tinyApis.sExecCommand('mceanchor'),
        Chain.asStep(Element.fromDom(document.body), [
          Chain.fromParent(UiFinder.cWaitForVisible('wait for dialog', 'div[aria-label="Anchor"][role="dialog"]'),
            [
              Chain.fromChains([
                UiFinder.cFindIn('input'),
                UiControls.cSetValue('abc')
              ]),
              Chain.fromChains([
                UiFinder.cFindIn('button:contains("Ok")'),
                Mouse.cClick
              ])
            ]
          )
        ]),
        tinyApis.sAssertContent('<p>abc <a id="abc"></a>123</p>')

      ], onSuccess, onFailure);
    }, {
      inline: true,
      plugins: 'anchor',
      toolbar: 'anchor',
      skin_url: '/project/src/skins/lightgray/dist/lightgray'
    }, success, failure);
  }
);