asynctest(
  'browser.tinymce.plugins.media.DimensionsFalseEmbedTest',
  [
    'ephox.agar.api.ApproxStructure',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.agar.api.UiFinder',
    'ephox.agar.api.Waiter',
    'ephox.mcagar.api.TinyApis',
    'ephox.mcagar.api.TinyDom',
    'ephox.mcagar.api.TinyLoader',
    'ephox.mcagar.api.TinyUi',
    'tinymce.plugins.media.Plugin',
    'tinymce.plugins.media.test.Utils',
    'tinymce.themes.modern.Theme'
  ],
  function (ApproxStructure, Pipeline, Step, UiFinder, Waiter, TinyApis, TinyDom, TinyLoader, TinyUi, Plugin, Utils, Theme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    Plugin();
    Theme();

    var struct = ApproxStructure.build(function (s, str, arr) {
      return s.element('body', {
        children: [
          s.element('p', {
            children: [
              s.element('span', {
                attrs: {
                  'data-mce-object': str.is('iframe')
                },
                children: [
                  s.element('iframe', {
                    attrs: {
                      width: str.is('560'),
                      height: str.is('315')
                    }
                  }),
                  s.element('span', {
                    classes: [
                      arr.has('mce-shim')
                    ]
                  })
                ]
              }),
              s.element('span', {
                classes: [
                  arr.has('mce-shim')
                ]
              })
            ]
          })
        ]
      });
    });

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      var tinyUi = TinyUi(editor);
      var tinyApis = TinyApis(editor);

      Pipeline.async({}, [
        Utils.sOpenDialog(tinyUi),
        Utils.sPasteTextareaValue(
          tinyUi,
          '<iframe width="560" height="315" src="https://www.youtube.com/embed/1YhJQVutNA8" ' +
          ' frameborder="0" allowfullscreen></iframe>'
        ),
        Utils.sSubmitDialog(tinyUi),
        Waiter.sTryUntil(
          'wait for correct structure',
          tinyApis.sAssertContentStructure(struct),
          100,
          4000
        )
      ], onSuccess, onFailure);
    }, {
      plugins: ["media"],
      toolbar: "media",
      media_dimensions: false,
      skin_url: '/project/src/skins/lightgray/dist/lightgray'
    }, success, failure);
  }
);
