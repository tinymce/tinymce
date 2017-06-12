asynctest(
  'browser.tinymce.plugins.link.AllowUnsafeLinkTargetTest',
  [
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.mcagar.api.TinyApis',
    'ephox.mcagar.api.TinyLoader',
    'ephox.mcagar.api.TinyUi',
    'tinymce.core.dom.DOMUtils',
    'tinymce.plugins.link.Plugin',
    'tinymce.themes.modern.Theme'
  ],
  function (GeneralSteps, Logger, Pipeline, Step, TinyApis, TinyLoader, TinyUi, DOMUtils, LinkPlugin, ModernTheme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    ModernTheme();
    LinkPlugin();

    var sEnterUrl = function (url) {
      return Step.sync(function () {
        var input = document.activeElement;

        input.value = url;
        DOMUtils.DOM.fire(input, 'change');
      });
    };

    var sInsertLink = function (ui, url) {
      return GeneralSteps.sequence([
        ui.sClickOnToolbar('click link button', 'div[aria-label="Insert/edit link"] > button'),
        ui.sWaitForPopup('wait for link dialog', 'div[aria-label="Insert link"][role="dialog"]'),
        sEnterUrl(url),
        ui.sClickOnUi('click ok button', 'button:contains("Ok")')
      ]);
    };

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      var ui = TinyUi(editor);
      var api = TinyApis(editor);

      Pipeline.async({}, [
        Logger.t("doesn't add rel noopener stuff with allow_unsafe_link_target: true", GeneralSteps.sequence([
          api.sSetSetting('allow_unsafe_link_target', true),
          sInsertLink(ui, 'http://www.google.com'),
          api.sAssertContentPresence({ 'a[rel="noopener"]': 0, 'a': 1 }),
          api.sSetContent('')
        ])),

        Logger.t("adds if allow_unsafe_link_target: false", GeneralSteps.sequence([
          api.sSetSetting('allow_unsafe_link_target', false),
          sInsertLink(ui, 'http://www.google.com'),
          api.sAssertContentPresence({ 'a[rel="noopener"]': 1 }),
          api.sSetContent('')
        ])),

        Logger.t("...and if it's undefined", GeneralSteps.sequence([
          api.sSetSetting('allow_unsafe_link_target', undefined),
          sInsertLink(ui, 'http://www.google.com'),
          api.sAssertContentPresence({ 'a[rel="noopener"]': 1 })
        ]))

      ], onSuccess, onFailure);
    }, {
      plugins: 'link',
      toolbar: 'link',
      skin_url: '/project/src/skins/lightgray/dist/lightgray',
      target_list: [
        { title: 'New page', value: '_blank' }
      ]
    }, success, failure);
  }
);