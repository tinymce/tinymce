asynctest(
  'browser.tinymce.plugins.image.ImagePluginTest',
  [
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Chain',
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Logger',
    'tinymce.plugins.image.Plugin',
    'ephox.mcagar.api.TinyLoader',
    'ephox.mcagar.api.TinyApis',
    'ephox.mcagar.api.TinyUi',
    'tinymce.themes.modern.Theme'
  ],
  function (Pipeline, GeneralSteps, Chain, Assertions, Logger, Plugin, TinyLoader, TinyApis, TinyUi, Theme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    var src = 'http://moxiecode.cachefly.net/tinymce/v9/images/logo.png';

    Theme();
    Plugin();

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      var api = TinyApis(editor);
      var ui = TinyUi(editor);

      var sAssertImageTab = function (title, isPresent) {
        return GeneralSteps.sequence([
          ui.sClickOnToolbar("Trigger Image dialog", 'div[aria-label="Insert/edit image"]'),
          Chain.asStep({}, [
            ui.cWaitForPopup("Wait for Image dialog", 'div[role="dialog"][aria-label="Insert/edit image"]'),
            Chain.op(function (container) {
              var expected = {};
              expected['.mce-tab:contains("' + title + '")'] = isPresent ? 1 : 0;
              Assertions.assertPresence("Asserting presence", expected, container);
            })
          ]),
          ui.sClickOnUi("Close dialog", 'button:contains("Cancel")')
        ]);
      };

      Pipeline.async({}, [
        Logger.t("Upload tab should be present when images_upload_url is set to some truthy value", GeneralSteps.sequence([
          api.sSetContent('<p><img src="' + src + '" /></p>'),
          api.sSelect('img', []),
          api.sSetSetting('image_advtab', false), // make sure that Advanced tab appears separately
          api.sSetSetting('images_upload_url', 'postAcceptor.php'),
          sAssertImageTab('Upload', true),
          sAssertImageTab('Advanced', false),
          api.sSetSetting('image_advtab', true),
          api.sSetSetting('images_upload_url', null),
          sAssertImageTab('Upload', false),
          sAssertImageTab('Advanced', true)
        ]))
      ], onSuccess, onFailure);
    }, {
      plugins: 'image',
      indent: false,
      skin_url: '/project/src/skins/lightgray/dist/lightgray'
    }, success, failure);
  }
);