asynctest(
  'browser.core.EphoxEmbedTest',
  [
    'ephox.agar.api.ApproxStructure',
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.agar.api.Waiter',
    'ephox.mcagar.api.TinyApis',
    'ephox.mcagar.api.TinyLoader',
    'ephox.mcagar.api.TinyUi',
    'ephox.sugar.api.node.Element',
    'tinymce.plugins.media.Plugin',
    'tinymce.plugins.media.test.Utils',
    'tinymce.themes.modern.Theme'
  ],
  function (ApproxStructure, Assertions, Pipeline, Step, Waiter, TinyApis, TinyLoader, TinyUi, Element, Plugin, Utils, Theme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    Plugin();
    Theme();

    var ephoxEmbedStructure = ApproxStructure.build(function (s, str/*, arr*/) {
      return s.element('p', {
        children: [
          s.element('div', {
            children: [
              s.element('iframe', {
                attrs: {
                  src: str.is('about:blank')
                }
              })
            ],
            attrs: {
              'data-ephox-embed-iri': str.is('embed-iri'),
              'contenteditable': str.is('false')
            }
          })
        ]
      });
    });

    var sAssertDivStructure = function (editor, expected) {
      return Step.sync(function () {
        var div = editor.dom.select('div')[0];
        var actual = div ? Element.fromHtml(div.outerHTML) : Element.FromHtml('');
        return Assertions.sAssertStructure('Should be the same structure', expected, actual);
      });
    };

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      var ui = TinyUi(editor);
      var apis = TinyApis(editor);

      Pipeline.async({}, [
        apis.sFocus,
        apis.sSetContent('<div contenteditable="false" data-ephox-embed-iri="embed-iri"><iframe src="about:blank"></iframe></div>'),
        sAssertDivStructure(editor, ephoxEmbedStructure),
        apis.sSelect('div', []),
        Utils.sOpenDialog(ui),
        Utils.sAssertSourceValue(ui, 'embed-iri'),
        Utils.sAssertEmbedContent(ui,
          '<div contenteditable="false" data-ephox-embed-iri="embed-iri">' +
          '<iframe src="about:blank"></iframe>' +
          '</div>'
        ),
        Utils.sSubmitDialog(ui),
        Waiter.sTryUntil('wait for div struture', sAssertDivStructure(editor, ephoxEmbedStructure), 100, 3000)
      ], onSuccess, onFailure);
    }, {
      plugins: "media",
      toolbar: "media",
      media_url_resolver: function (data, resolve) {
        resolve({
          html: '<video width="300" height="150" ' +
            'controls="controls">\n<source src="' + data.url + '" />\n</video>'
        });
      },
      skin_url: '/project/src/skins/lightgray/dist/lightgray'
    }, success, failure);
  }
);
