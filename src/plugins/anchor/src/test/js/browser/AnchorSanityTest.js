asynctest(
  'Browser Test: .AnchorSanityTest.js',

  [
    'ephox.agar.api.ApproxStructure',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.agar.api.Waiter',
    'ephox.mcagar.api.TinyApis',
    'ephox.mcagar.api.TinyLoader',
    'ephox.mcagar.api.TinyUi',
    'tinymce.plugins.anchor.Plugin',
    'tinymce.themes.modern.Theme'
  ],

  function (
    ApproxStructure, Pipeline, Step, Waiter, TinyApis, TinyLoader, TinyUi, AchorPlugin,
    ModernTheme
  ) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    AchorPlugin();
    ModernTheme();

    var sType = function (text) {
      return Step.sync(function () {
        var elm = document.querySelector('div[aria-label="Anchor"].mce-floatpanel input');
        elm.value = text;
      });
    };

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      var tinyUi = TinyUi(editor);
      var tinyApis = TinyApis(editor);

      Pipeline.async({}, [
        tinyApis.sSetContent('abc'),
        tinyUi.sClickOnToolbar('click anchor button', 'div[aria-label="Anchor"] button'),
        tinyUi.sWaitForPopup('wait for window', 'div[role="dialog"].mce-floatpanel  input'),
        sType('abc'),
        tinyUi.sClickOnUi('click on OK btn', 'div.mce-primary > button'),
        Waiter.sTryUntil('wait for anchor',
          tinyApis.sAssertContentStructure(ApproxStructure.build(function (s, str) {
            return s.element('body', {
              children: [
                s.element('p', {
                  children: [
                    s.anything(),
                    s.element('a', {
                      attrs: {
                        id: str.is('abc')
                      }
                    }),
                    s.anything(),
                    s.anything()
                  ]
                })
              ]
            });
          })), 100, 4000
        )
      ], onSuccess, onFailure);
    }, {
      plugins: 'anchor',
      toolbar: 'anchor',
      skin_url: '/project/src/skins/lightgray/dist/lightgray'
    }, success, failure);
  }
);
