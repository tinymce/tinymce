asynctest(
  'browser.tinymce.plugins.media.IsCachedResponseTest',
  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Chain',
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Guard',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Mouse',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.UiControls',
    'ephox.agar.api.UiFinder',
    'ephox.mcagar.api.TinyApis',
    'ephox.mcagar.api.TinyDom',
    'ephox.mcagar.api.TinyLoader',
    'ephox.mcagar.api.TinyUi',
    'ephox.sugar.api.properties.Html',
    'tinymce.plugins.media.Plugin',
    'tinymce.plugins.media.test.Utils',
    'tinymce.themes.modern.Theme'
  ],
  function (Assertions, Chain, GeneralSteps, Guard, Logger, Mouse, Pipeline, UiControls, UiFinder, TinyApis, TinyDom, TinyLoader, TinyUi, Html, MediaPlugin, Utils, ModernTheme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    ModernTheme();
    MediaPlugin();

    var cAssertEmbedValue = function (expected) {
      return Chain.control(
        Chain.fromChains([
          UiFinder.cFindIn('label:contains("Paste your embed code below:")'),
          Chain.mapper(function (elm) {
            return TinyDom.fromDom(document.getElementById(elm.dom().htmlFor));
          }),
          UiControls.cGetValue,
          Assertions.cAssertHtml('has expected html', expected)
        ]),
        Guard.tryUntil('did not get correct html', 10, 3000)
      );
    };

    var sWaitForAndAssertNotification = function (expected) {
      return Chain.asStep(TinyDom.fromDom(document.body), [
        UiFinder.cWaitFor('Could not find notification', 'div.mce-notification-inner'),
        Chain.mapper(Html.get),
        Assertions.cAssertHtml('Plugin list html does not match', expected)
      ]);
    };

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      var tinyUi = TinyUi(editor);
      var tinyApis = TinyApis(editor);

      Pipeline.async({}, [
        tinyApis.sFocus,
        Logger.t('test cached response', GeneralSteps.sequence([
          tinyUi.sClickOnToolbar('click media button', 'div[aria-label="Insert/edit media"] > button'),
          Chain.asStep({}, [
            Chain.fromParent(
              tinyUi.cWaitForPopup('wait for media dialog', 'div[role="dialog"]'), [
                Chain.fromChains([
                  Utils.cSetSourceInput(tinyUi, 'test'),
                  Utils.cFakeEvent('paste')
                ]),
                Chain.fromChains([
                  cAssertEmbedValue('<div>x</div>')
                ]),
                Chain.fromChains([
                  Utils.cSetSourceInput(tinyUi, 'XXX')
                ]),
                Chain.fromChains([
                  UiFinder.cFindIn('button:contains("Ok")'),
                  Mouse.cClick
                ])
              ])
          ]),
          sWaitForAndAssertNotification('Media embed handler threw unknown error.'),
          tinyApis.sAssertContent('')
        ]))
      ], onSuccess, onFailure);
    }, {
      plugins: 'media',
      toolbar: 'media',
      skin_url: '/project/src/skins/lightgray/dist/lightgray',
      media_url_resolver: function (data, resolve, reject) {
        if (data.url === 'test') {
          resolve({
            html: '<div>x</div>' });
        } else {
          reject('error');
        }
      }
    }, success, failure);
  }
);