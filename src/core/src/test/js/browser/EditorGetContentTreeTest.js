asynctest(
  'browser.tinymce.core.EditorGetContentTreeTest',
  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.mcagar.api.TinyApis',
    'ephox.mcagar.api.TinyLoader',
    'tinymce.core.html.Serializer',
    'tinymce.themes.modern.Theme'
  ],
  function (Assertions, GeneralSteps, Logger, Pipeline, Step, TinyApis, TinyLoader, Serializer, Theme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    Theme();

    var toHtml = function (node) {
      var htmlSerializer = new Serializer({});
      return htmlSerializer.serialize(node);
    };

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      var tinyApis = TinyApis(editor);

      Pipeline.async({}, [
        Logger.t('Get content as tree', GeneralSteps.sequence([
          tinyApis.sSetContent('<p>a</p>'),
          Step.sync(function () {
            var html = toHtml(editor.getContent({ format: 'tree' }));
            Assertions.assertHtml('Should be expected html', '<p>a</p>', html);
          })
        ])),
        Logger.t('Get selection as tree', GeneralSteps.sequence([
          tinyApis.sSetContent('<p>ab<em>c</em></p>'),
          tinyApis.sSetSelection([0, 0], 1, [0, 1, 0], 1),
          Step.sync(function () {
            var html = toHtml(editor.selection.getContent({ format: 'tree' }));
            Assertions.assertHtml('Should be expected selection html', 'b<em>c</em>', html);
          })
        ])),
        Logger.t('Get selection as tree with whitespace', GeneralSteps.sequence([
          tinyApis.sSetContent('<p>a b c</p>'),
          tinyApis.sSetSelection([0, 0], 1, [0, 0], 4),
          Step.sync(function () {
            var html = toHtml(editor.selection.getContent({ format: 'tree' }));
            Assertions.assertHtml('Should be expected selection html', ' b ', html);
          })
        ]))
      ], onSuccess, onFailure);
    }, {
      skin_url: '/project/src/skins/lightgray/dist/lightgray',
      inline: true
    }, success, failure);
  }
);