asynctest(
  'browser.tinymce.core.init.InitIframeEditorWithCustomAttrsTest',
  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.mcagar.api.TinyLoader',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.properties.Attr',
    'global!document',
    'tinymce.themes.modern.Theme'
  ],
  function (Assertions, Logger, Pipeline, Step, TinyLoader, Element, Attr, document, Theme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    Theme();

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      Pipeline.async({}, [
        Logger.t('Check if iframe has the right custom attributes', Step.sync(function () {
          var ifr = Element.fromDom(editor.iframeElement);

          Assertions.assertEq('Id should not be the defined x', true, Attr.get(ifr, 'id') !== 'x');
          Assertions.assertEq('Custom attribute whould have the right value', 'a', Attr.get(ifr, 'data-custom1'));
          Assertions.assertEq('Custom attribute whould have the right value', 'b', Attr.get(ifr, 'data-custom2'));
        }))
      ], onSuccess, onFailure);
    }, {
      skin_url: '/project/src/skins/lightgray/dist/lightgray',
      iframe_attrs: {
        id: 'x',
        'data-custom1': 'a',
        'data-custom2': 'b'
      }
    }, success, failure);
  }
);