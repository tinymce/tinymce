asynctest(
  'browser.tinymce.core.FontSelectTest',
  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Chain',
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.UiFinder',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Strings',
    'ephox.mcagar.api.TinyApis',
    'ephox.mcagar.api.TinyLoader',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.properties.TextContent',
    'tinymce.themes.modern.Theme'
  ],
  function (Assertions, Chain, GeneralSteps, Logger, Pipeline, UiFinder, Fun, Strings, TinyApis, TinyLoader, Element, TextContent, Theme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    Theme();

    var sAssertSelectBoxDisplayValue = function (editor, title, expectedValue) {
      return Chain.asStep(Element.fromDom(document.body), [
        UiFinder.cFindIn('*[aria-label="' + title + '"]'),
        Chain.mapper(Fun.compose(Strings.trim, TextContent.get)),
        Assertions.cAssertEq('Should be the expected display value', expectedValue)
      ]);
    };

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      var tinyApis = TinyApis(editor);

      Pipeline.async({}, [
        Logger.t('Font family and font size on initial page load', GeneralSteps.sequence([
          sAssertSelectBoxDisplayValue(editor, 'Font Sizes', '32pt'),
          sAssertSelectBoxDisplayValue(editor, 'Font Family', 'Helvetica')
        ])),

        Logger.t('Font family and font size on paragraph', GeneralSteps.sequence([
          tinyApis.sSetContent('<p>a</p>'),
          tinyApis.sFocus,
          tinyApis.sSetCursor([0, 0], 0),
          tinyApis.sNodeChanged,
          sAssertSelectBoxDisplayValue(editor, 'Font Sizes', '24pt'),
          sAssertSelectBoxDisplayValue(editor, 'Font Family', 'Arial')
        ])),

        Logger.t('Font family and font size on paragraph with styles', GeneralSteps.sequence([
          tinyApis.sSetContent('<p style="font-family: Times; font-size: 16px;">a</p>'),
          tinyApis.sFocus,
          tinyApis.sSetCursor([0, 0], 0),
          tinyApis.sNodeChanged,
          sAssertSelectBoxDisplayValue(editor, 'Font Sizes', '12pt'),
          sAssertSelectBoxDisplayValue(editor, 'Font Family', 'Times')
        ]))
      ], onSuccess, onFailure);
    }, {
      skin_url: '/project/src/skins/lightgray/dist/lightgray',
      toolbar: 'fontsizeselect fontselect',
      content_style: [
        '.mce-content-body { font-family: Helvetica; font-size: 42px; }',
        '.mce-content-body p { font-family: Arial; font-size: 32px; }'
      ].join('')
    }, success, failure);
  }
);