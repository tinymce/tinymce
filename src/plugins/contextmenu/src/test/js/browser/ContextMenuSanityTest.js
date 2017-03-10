asynctest(
  'browser.tinymce.plugins.contextmenu.ContextMenuSanityTest',

  [
    'ephox.agar.api.ApproxStructure',
    'ephox.agar.api.Mouse',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.mcagar.api.TinyApis',
    'ephox.mcagar.api.TinyDom',
    'ephox.mcagar.api.TinyLoader',
    'ephox.mcagar.api.TinyUi',
    'tinymce.plugins.contextmenu.Plugin',
    'tinymce.themes.modern.Theme'
  ],

  function (
    ApproxStructure, Mouse, Pipeline, Step, TinyApis, TinyDom, TinyLoader, TinyUi, ContextMenuPlugin,
    ModernTheme
  ) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    ContextMenuPlugin();
    ModernTheme();

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      var tinyUi = TinyUi(editor);
      var tinyApis = TinyApis(editor);

      Pipeline.async({}, [
        tinyApis.sSetContent('<p>a</p>'),
        tinyApis.sSetSelection([0, 0], 0, [0, 0], 1),
        Mouse.sContextMenuOn(TinyDom.fromDom(editor.getBody()), 'p'),
        tinyUi.sWaitForUi('wait for context', 'div.mce-contextmenu'),
        tinyUi.sClickOnUi('click on link in context', 'div.mce-contextmenu span:contains("Bold")'),
        tinyApis.sAssertContentStructure(ApproxStructure.build(function (s, str) {
          return s.element('body', {
            children: [
              s.element('p', {
                children: [
                  s.element('strong', {
                    children: [
                      s.text(str.is('a'))
                    ]
                  })
                ]
              })
            ]
          });
        }))
      ], onSuccess, onFailure);
    }, {
      plugins: 'contextmenu',
      toolbar: 'contextmenu',
      contextmenu: 'bold',
      skin_url: '/project/src/skins/lightgray/dist/lightgray'
    }, success, failure);
  }
);
