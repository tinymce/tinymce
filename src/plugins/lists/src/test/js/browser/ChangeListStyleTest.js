asynctest(
  'browser.tinymce.plugins.lists.ChangeListStyleTest',
  [
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.mcagar.api.TinyApis',
    'ephox.mcagar.api.TinyLoader',
    'ephox.mcagar.api.TinyUi',
    'tinymce.plugins.lists.Plugin',
    'tinymce.themes.modern.Theme'
  ],
  function (GeneralSteps, Logger, Pipeline, Step, TinyApis, TinyLoader, TinyUi, ListsPlugin, ModernTheme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    ModernTheme();
    ListsPlugin();

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      var tinyApis = TinyApis(editor);
      var tinyUi = TinyUi(editor);

      Pipeline.async({}, [
        Logger.t('ul to ol', GeneralSteps.sequence([
          tinyApis.sSetContent('<ul><li>a</li><ul><li>b</li></ul></ul>'),
          tinyApis.sSetSelection([0, 0, 0], 0, [0, 0, 0], 1),
          tinyUi.sClickOnToolbar('click numlist button', 'div[aria-label="Numbered list"] > button'),
          tinyApis.sAssertContent('<ol><li>a</li><ol><li>b</li></ol></ol>')
        ])),
        Logger.t('ol to ul', GeneralSteps.sequence([
          tinyApis.sSetContent('<ol><li>a</li><ol><li>b</li></ol></ol>'),
          tinyApis.sSetSelection([0, 0, 0], 0, [0, 0, 0], 1),
          tinyUi.sClickOnToolbar('click bullist button', 'div[aria-label="Bullet list"] > button'),
          tinyApis.sAssertContent('<ul><li>a</li><ul><li>b</li></ul></ul>')
        ])),
        Logger.t('alpha to ol', GeneralSteps.sequence([
          tinyApis.sSetContent('<ol style="list-style-type: lower-alpha;"><li>a</li><ol style="list-style-type: lower-alpha;"><li>b</li></ol></ol>'),
          tinyApis.sSetSelection([0, 0, 0], 0, [0, 0, 0], 1),
          tinyUi.sClickOnToolbar('click bullist button', 'div[aria-label="Numbered list"] > button'),
          tinyApis.sAssertContent('<ol><li>a</li><ol><li>b</li></ol></ol>')
        ])),
        Logger.t('alpha to ul', GeneralSteps.sequence([
          tinyApis.sSetContent('<ol style="list-style-type: lower-alpha;"><li>a</li><ol style="list-style-type: lower-alpha;"><li>b</li></ol></ol>'),
          tinyApis.sSetSelection([0, 0, 0], 0, [0, 0, 0], 1),
          tinyUi.sClickOnToolbar('click bullist button', 'div[aria-label="Bullet list"] > button'),
          tinyApis.sAssertContent('<ul><li>a</li><ul><li>b</li></ul></ul>')
        ]))
      ], onSuccess, onFailure);
    }, {
      indent: false,
      plugins: 'lists',
      toolbar: 'numlist bullist',
      skin_url: '/project/src/skins/lightgray/dist/lightgray'
    }, success, failure);
  }
);