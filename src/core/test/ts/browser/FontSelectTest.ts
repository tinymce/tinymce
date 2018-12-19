import { Assertions, Chain, GeneralSteps, Logger, Pipeline, UiFinder } from '@ephox/agar';
import { Fun, Strings } from '@ephox/katamari';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { Element, TextContent } from '@ephox/sugar';
import Theme from 'tinymce/themes/silver/Theme';
import { UnitTest } from '@ephox/bedrock';
import { document } from '@ephox/dom-globals';

UnitTest.asynctest('browser.tinymce.core.FontSelectTest', function (success, failure) {

  // TODO FIXME DISABLED-TEST TINY-2793
  // Reason for disabling:
  // Unable to identify buttons as they do not have any distinguishing features (like aria-label)
  success();
  return;

  Theme();

  const sAssertSelectBoxDisplayValue = function (editor, title, expectedValue) {
    return Chain.asStep(Element.fromDom(document.body), [
      UiFinder.cFindIn('*[aria-label="' + title + '"]'),
      Chain.mapper(Fun.compose(Strings.trim, TextContent.get)),
      Assertions.cAssertEq('Should be the expected display value', expectedValue)
    ]);
  };

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      Logger.t('Font family and font size on initial page load', GeneralSteps.sequence([
        sAssertSelectBoxDisplayValue(editor, 'Font Sizes', '24pt'),
        sAssertSelectBoxDisplayValue(editor, 'Font Family', 'Arial')
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
        tinyApis.sSetContent('<p style="font-family: Times; font-size: 17px;">a</p>'),
        tinyApis.sFocus,
        tinyApis.sSetCursor([0, 0], 0),
        tinyApis.sNodeChanged,
        // the following one should pick up 12.75pt, although there's a rounded 13pt in the dropdown as well
        sAssertSelectBoxDisplayValue(editor, 'Font Sizes', '12.75pt'),
        sAssertSelectBoxDisplayValue(editor, 'Font Family', 'Times')
      ]))
    ], onSuccess, onFailure);
  }, {
    base_url: '/project/js/tinymce',
    toolbar: 'fontsizeselect fontselect',
    content_style: [
      '.mce-content-body { font-family: Helvetica; font-size: 42px; }',
      '.mce-content-body p { font-family: Arial; font-size: 32px; }'
    ].join(''),
    fontsize_formats: '12pt 12.75pt 13pt 32pt'
  }, success, failure);
});
