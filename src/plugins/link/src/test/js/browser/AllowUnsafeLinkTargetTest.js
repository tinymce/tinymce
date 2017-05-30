asynctest(
  'browser.tinymce.plugins.link.AllowUnsafeLinkTargetTest',
  [
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.mcagar.api.TinyApis',
    'ephox.mcagar.api.TinyLoader',
    'ephox.mcagar.api.TinyUi',
    'tinymce.core.dom.DOMUtils',
    'tinymce.plugins.link.Plugin',
    'tinymce.themes.modern.Theme'
  ],
  function (Pipeline, Step, TinyApis, TinyLoader, TinyUi, DOMUtils, LinkPlugin, ModernTheme) {
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

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      var tinyUi = TinyUi(editor);
      var tinyApis = TinyApis(editor);

      Pipeline.async({}, [
        // doesn't add rel noopener stuff with allow_unsafe_link_target: true
        tinyUi.sClickOnToolbar('click link button', 'div[aria-label="Insert/edit link"] > button'),
        tinyUi.sWaitForPopup('wait for link dialog', 'div[aria-label="Insert link"][role="dialog"]'),
        sEnterUrl('http://www.google.com'),
        tinyUi.sClickOnUi('click ok button', 'button:contains("Ok")'),
        tinyApis.sAssertContentPresence({ 'a[rel="noopener"]': 0, 'a': 1 }),
        tinyApis.sSetContent(''),

        // adds if allow_unsafe_link_target: false
        tinyApis.sSetSetting('allow_unsafe_link_target', false),
        tinyUi.sClickOnToolbar('click link button', 'div[aria-label="Insert/edit link"] > button'),
        tinyUi.sWaitForPopup('wait for link dialog', 'div[aria-label="Insert link"][role="dialog"]'),
        sEnterUrl('http://www.google.com'),
        tinyUi.sClickOnUi('click ok button', 'button:contains("Ok")'),
        tinyApis.sAssertContentPresence({ 'a[rel="noopener"]': 1 }),
        tinyApis.sSetContent(''),

        // and if it's undefined
        tinyApis.sSetSetting('allow_unsafe_link_target', undefined),
        tinyUi.sClickOnToolbar('click link button', 'div[aria-label="Insert/edit link"] > button'),
        tinyUi.sWaitForPopup('wait for link dialog', 'div[aria-label="Insert link"][role="dialog"]'),
        sEnterUrl('http://www.google.com'),
        tinyUi.sClickOnUi('click ok button', 'button:contains("Ok")'),
        tinyApis.sAssertContentPresence({ 'a[rel="noopener"]': 1 })
      ], onSuccess, onFailure);
    }, {
      plugins: 'link',
      toolbar: 'link',
      skin_url: '/project/src/skins/lightgray/dist/lightgray',
      allow_unsafe_link_target: true,
      target_list: [
        { title: 'New page', value: '_blank' }
      ]
    }, success, failure);
  }
);