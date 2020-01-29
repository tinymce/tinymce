import { Assertions, Chain, GeneralSteps, Logger, Pipeline, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { document } from '@ephox/dom-globals';
import { Fun, Strings } from '@ephox/katamari';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { Element, TextContent } from '@ephox/sugar';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.core.FontSelectCustomTest', function (success, failure) {
  Theme();

  const sAssertSelectBoxDisplayValue = function (editor, title, expectedValue) {
    return Chain.asStep(Element.fromDom(document.body), [
      UiFinder.cFindIn('*[title="' + title + '"]'),
      Chain.mapper(Fun.compose(Strings.trim, TextContent.get)),
      Assertions.cAssertEq('Should be the expected display value', expectedValue)
    ]);
  };

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      Logger.t('Font family and font size on initial page load', GeneralSteps.sequence([
        sAssertSelectBoxDisplayValue(editor, 'Font sizes', '12px'),
        sAssertSelectBoxDisplayValue(editor, 'Fonts', 'Arial')
      ])),

      Logger.t('Font family with spaces and numbers in the name with legacy font elements', GeneralSteps.sequence([
        tinyApis.sSetRawContent('<p><font face="\'bookshelf symbol 7\'" size="1">a</font></p>'),
        tinyApis.sFocus(),
        tinyApis.sSetCursor([0, 0, 0], 0),
        tinyApis.sNodeChanged(),
        sAssertSelectBoxDisplayValue(editor, 'Font sizes', '8pt'),
        sAssertSelectBoxDisplayValue(editor, 'Fonts', 'Bookshelf Symbol 7')
      ])),

      Logger.t('Font family with spaces and numbers in the name', GeneralSteps.sequence([
        tinyApis.sSetContent('<p style="font-family: \'bookshelf symbol 7\';" </p>'),
        tinyApis.sFocus(),
        tinyApis.sSetCursor([0, 0], 0),
        tinyApis.sNodeChanged(),
        sAssertSelectBoxDisplayValue(editor, 'Font sizes', '12px'),
        sAssertSelectBoxDisplayValue(editor, 'Fonts', 'Bookshelf Symbol 7'),
      ])),

      Logger.t('Font family with quoted font names', GeneralSteps.sequence([
        tinyApis.sSetContent('<p style="font-family: \'bauhaus 93\';" </p>'),
        tinyApis.sFocus(),
        tinyApis.sSetCursor([0, 0], 0),
        tinyApis.sNodeChanged(),
        sAssertSelectBoxDisplayValue(editor, 'Font sizes', '12px'),
        sAssertSelectBoxDisplayValue(editor, 'Fonts', 'Bauhaus 93'),
      ])),
    ], onSuccess, onFailure);
  }, {
    base_url: '/project/tinymce/js/tinymce',
    toolbar: 'fontsizeselect fontselect',
    content_style: [
      '.mce-content-body { font-family: Helvetica; font-size: 42px; }',
      '.mce-content-body p { font-family: Arial; font-size: 12px; }',
      '.mce-content-body h1 { font-family: Arial; font-size: 32px; }'
    ].join(''),
    font_formats: 'Arial=arial; Arial Black=arial black; Arial Narrow=arial narrow; Bauhaus 93="bauhaus 93"; Bookman Old Style=bookman old style; Bookshelf Symbol 7=bookshelf symbol 7; Times New Roman=times new roman, times;',
    fontsize_formats: '8pt=1 12pt 12.75pt 13pt 24pt 32pt'
  }, success, failure);
});
