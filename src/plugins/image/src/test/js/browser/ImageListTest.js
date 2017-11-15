asynctest(
  'browser.tinymce.plugins.image.ImageListTest',
  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Chain',
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Mouse',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.UiControls',
    'ephox.agar.api.UiFinder',
    'ephox.mcagar.api.TinyApis',
    'ephox.mcagar.api.TinyDom',
    'ephox.mcagar.api.TinyLoader',
    'ephox.mcagar.api.TinyUi',
    'global!document',
    'tinymce.core.dom.DOMUtils',
    'tinymce.plugins.image.Plugin',
    'tinymce.themes.modern.Theme'
  ],
  function (Assertions, Chain, GeneralSteps, Logger, Mouse, Pipeline, UiControls, UiFinder, TinyApis, TinyDom, TinyLoader, TinyUi, document, DOMUtils, ImagePlugin, ModernTheme) {
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
      var tinyApis = TinyApis(editor);
      var tinyUi = TinyUi(editor);

      Pipeline.async({}, [
        Logger.t('click image list, check that source changes, change source and check that image list changes', GeneralSteps.sequence([
          tinyApis.sSetSetting('image_list', [
            { title: 'Dog', value: 'mydog.jpg' },
            { title: 'Cat', value: 'mycat.jpg' }
          ]),
          tinyUi.sClickOnToolbar('click image button', 'div[aria-label="Insert/edit image"] button'),
          Chain.asStep({}, [
            tinyUi.cWaitForPopup('wait for dialog', 'div[role="dialog"]'),
            UiFinder.cFindIn('label:contains("Image list") + div > button'),
            Mouse.cClick
          ]),
          Chain.asStep(TinyDom.fromDom(document.body), [
            UiFinder.cFindIn('div[role="menuitem"] > span:contains("Dog")'),
            Mouse.cClick
          ]),
          Chain.asStep({}, [
            Chain.fromParent(tinyUi.cWaitForPopup('wait for dialog', 'div[role="dialog"]'),
              [
                Chain.fromChains([
                  UiFinder.cFindIn('label:contains("Source") + div > input'),
                  UiControls.cGetValue,
                  Assertions.cAssertEq('should be dog', 'mydog.jpg')
                ]),
                Chain.fromChains([
                  UiFinder.cFindIn('label:contains("Source") + div > input'),
                  UiControls.cSetValue('mycat.jpg'),
                  cFakeEvent('change')
                ]),
                Chain.fromChains([
                  UiFinder.cFindIn('label:contains("Image list") + div > button > span:contains("Cat")')
                ])
              ]
            )
          ])
        ]))
      ], onSuccess, onFailure);
    }, {
      plugins: 'image',
      toolbar: 'image',
      skin_url: '/project/src/skins/lightgray/dist/lightgray'
    }, success, failure);
  }
);