asynctest(
  'browser.tinymce.plugins.image.ImageResizeTest',
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
    'ephox.mcagar.api.TinyLoader',
    'ephox.mcagar.api.TinyUi',
    'global!document',
    'global!window',
    'tinymce.core.dom.DOMUtils',
    'tinymce.plugins.image.Plugin',
    'tinymce.themes.modern.Theme'
  ],
  function (Assertions, Chain, GeneralSteps, Guard, Logger, Mouse, Pipeline, UiControls, UiFinder, TinyLoader, TinyUi, document, window, DOMUtils, ImagePlugin, ModernTheme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    ModernTheme();
    ImagePlugin();

    var cFakeEvent = function (name) {
      return Chain.op(function (elm) {
        DOMUtils.DOM.fire(elm.dom(), name);
      });
    };

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      var tinyUi = TinyUi(editor);

      Pipeline.async({}, [
        Logger.t('image proportion constrains should work directly', GeneralSteps.sequence([
          tinyUi.sClickOnToolbar('click image button', 'div[aria-label="Insert/edit image"] button'),
          Chain.asStep({}, [
            Chain.fromParent(tinyUi.cWaitForPopup('Wait for dialog', 'div[role="dialog"]'),
              [
                Chain.fromChains([
                  UiFinder.cFindIn('i.mce-i-browse'),
                  Mouse.cClick
                ]),
                Chain.fromChains([
                  Chain.control(
                    Chain.fromChains([
                      UiFinder.cFindIn('input[aria-label="Width"]'),
                      UiControls.cGetValue,
                      Assertions.cAssertEq('should be 1', '1')
                    ]),
                    Guard.tryUntil('did not find input with value 1', 10, 3000)
                  )
                ]),
                Chain.fromChains([
                  UiFinder.cFindIn('input[aria-label="Height"]'),
                  UiControls.cSetValue('5'),
                  cFakeEvent('change')
                ]),
                Chain.fromChains([
                  UiFinder.cFindIn('input[aria-label="Width"]'),
                  UiControls.cGetValue,
                  Assertions.cAssertEq('should have changed to 5', '5')
                ]),
                Chain.fromChains([
                  UiFinder.cFindIn('div.mce-primary button'),
                  Mouse.cClick
                ])
              ]
            )
          ])
        ]))

      ], onSuccess, onFailure);
    }, {
      plugins: 'image',
      toolbar: 'image',
      skin_url: '/project/src/skins/lightgray/dist/lightgray',
      file_picker_callback: function (callback) {
        callback('data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');
      }
    }, success, failure);
  }
);