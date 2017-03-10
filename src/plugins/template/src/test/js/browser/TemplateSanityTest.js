asynctest(
  'browser.tinymce.plugins.template.TemplateSanityTest',
  [
    'ephox.agar.api.ApproxStructure',
    'ephox.agar.api.Pipeline',
    'ephox.mcagar.api.TinyApis',
    'ephox.mcagar.api.TinyLoader',
    'ephox.mcagar.api.TinyUi',
    'tinymce.plugins.template.Plugin',
    'tinymce.themes.modern.Theme'
  ],
  function (ApproxStructure, Pipeline, TinyApis, TinyLoader, TinyUi, TemplatePlugin, ModernTheme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    ModernTheme();
    TemplatePlugin();

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      var tinyUi = TinyUi(editor);
      var tinyApis = TinyApis(editor);

      Pipeline.async({}, [
        tinyUi.sClickOnToolbar('click on template button', 'div[aria-label="Insert template"] > button'),
        tinyUi.sWaitForPopup('wait for popup', 'div[role="dialog"][aria-label="Insert template"]'),
        tinyUi.sClickOnUi('click on ok button', 'div.mce-primary button'),
        tinyApis.sAssertContentStructure(ApproxStructure.build(function (s, str) {
          return s.element('body', {
            children: [
              s.element('p', {
                children: [
                  s.element('strong', {
                    children: [
                      s.text(str.is('c'))
                    ]
                  })
                ]
              })
            ]
          });
        }))
      ], onSuccess, onFailure);
    }, {
      plugins: 'template',
      toolbar: 'template',
      templates: [
        {
          title: 'a',
          description: 'b',
          content: '<strong>c</strong>'
        }
      ],
      skin_url: '/project/src/skins/lightgray/dist/lightgray'
    }, success, failure);
  }
);