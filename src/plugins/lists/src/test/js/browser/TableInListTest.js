asynctest(
  'browser.tinymce.plugins.lists.TableInListTest',
  [
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.agar.api.UiFinder',
    'ephox.mcagar.api.TinyApis',
    'ephox.mcagar.api.TinyDom',
    'ephox.mcagar.api.TinyLoader',
    'ephox.mcagar.api.TinyUi',
    'tinymce.plugins.lists.Plugin',
    'tinymce.themes.modern.Theme'
  ],
  function (GeneralSteps, Logger, Pipeline, Step, UiFinder, TinyApis, TinyDom, TinyLoader, TinyUi, ListsPlugin, ModernTheme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    ModernTheme();
    ListsPlugin();

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      var tinyApis = TinyApis(editor);
      var tinyUi = TinyUi(editor);

      Pipeline.async({}, [
        Logger.t('unlist table in list then add list inside table', GeneralSteps.sequence([
          tinyApis.sSetContent('<ul><li><table><tbody><tr><td>a</td><td>b</td></tr></tbody></table></li></ul>'),
          tinyApis.sSetCursor([0, 0, 0, 0, 0, 0, 0], 0),
          tinyUi.sClickOnToolbar('click list button', 'div[aria-label="Bullet list"] button'),
          tinyApis.sAssertContent('<ul><li><table><tbody><tr><td><ul><li>a</li></ul></td><td>b</td></tr></tbody></table></li></ul>'),
          tinyUi.sClickOnToolbar('click list button', 'div[aria-label="Bullet list"] button'),
          tinyApis.sAssertContent('<ul><li><table><tbody><tr><td><p>a</p></td><td>b</td></tr></tbody></table></li></ul>')
        ])),
        Logger.t('delete list in table test', GeneralSteps.sequence([
          tinyApis.sSetContent('<ul><li><table><tbody><tr><td><ul><li><p>a</p></li></ul></td><td><p>b</p></td></tr></tbody></table></li></ul>'),
          tinyApis.sSetSelection([0, 0, 0, 0, 0, 0, 0, 0, 0], 0, [0, 0, 0, 0, 0, 0, 0, 0, 0], 1),
          Step.sync(function () {
            editor.plugins.lists.backspaceDelete();
            editor.plugins.lists.backspaceDelete();
          }),
          tinyApis.sAssertSelection([0, 0, 0, 0, 0, 0, 0], 0, [0, 0, 0, 0, 0, 0, 0], 0),
          tinyApis.sAssertContent('<ul><li><table><tbody><tr><td><p>&nbsp;</p></td><td><p>b</p></td></tr></tbody></table></li></ul>')
        ])),
        Logger.t('focus on table cell in list does not activate button', GeneralSteps.sequence([
          tinyApis.sSetContent('<ul><li><table><tbody><tr><td>a</td><td>b</td></tr></tbody></table></li></ul>'),
          tinyApis.sSetCursor([0, 0, 0, 0, 0, 0, 0], 0),
          UiFinder.sNotExists(TinyDom.fromDom(editor.getContainer()), 'div[aria-label="Bullet list"][aria-pressed="true"]')
        ]))
      ], onSuccess, onFailure);
    }, {
      plugins: 'lists',
      toolbar: 'bullist',
      indent: false,
      skin_url: '/project/src/skins/lightgray/dist/lightgray'
    }, success, failure);
  }
);