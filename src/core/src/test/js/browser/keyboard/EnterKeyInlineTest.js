asynctest(
  'browser.tinymce.core.keyboard.EnterKeyInlineTest',
  [
    'ephox.agar.api.Chain',
    'ephox.agar.api.Keys',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Pipeline',
    'ephox.katamari.api.Merger',
    'ephox.mcagar.api.ActionChains',
    'ephox.mcagar.api.ApiChains',
    'ephox.mcagar.api.Editor',
    'tinymce.themes.modern.Theme'
  ],
  function (Chain, Keys, Logger, Pipeline, Merger, ActionChains, ApiChains, Editor, Theme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    Theme();

    var settings = {
      skin_url: '/project/src/skins/lightgray/dist/lightgray',
      inline: true
    };

    Pipeline.async({}, [
      Logger.t('Pressing shift+enter in brMode inside a h1 should insert a br', Chain.asStep({}, [
        Editor.cFromHtml('<h1>ab</h1>', Merger.merge(settings, { forced_root_block: false })),
        ApiChains.cFocus,
        ApiChains.cSetCursor([0], 1),
        ActionChains.cContentKeystroke(Keys.enter(), { shift: true }),
        ApiChains.cAssertContent('a<br />b'),
        Editor.cRemove
      ]))
    ], function () {
      success();
    }, failure);
  }
);