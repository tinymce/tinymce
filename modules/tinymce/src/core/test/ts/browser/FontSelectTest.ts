import { Assertions, Chain, GeneralSteps, Logger, Pipeline, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { document } from '@ephox/dom-globals';
import { Arr, Fun, Strings } from '@ephox/katamari';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { Element, TextContent } from '@ephox/sugar';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.core.FontSelectTest', function (success, failure) {
  Theme();

  const systemFontStackVariants = [
    '-apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Oxygen, Ubuntu, Cantarell, \'Open Sans\', \'Helvetica Neue\', sans-serif;', // Oxide
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";', // Bootstrap
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;' // Wordpress
  ];

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

      Logger.t('Font family and font size on paragraph with no styles', GeneralSteps.sequence([
        tinyApis.sSetContent('<p>a</p>'),
        tinyApis.sFocus(),
        tinyApis.sSetCursor([0, 0], 0),
        tinyApis.sNodeChanged(),
        // p content style is 12px which does not match any pt values in the font size select values
        sAssertSelectBoxDisplayValue(editor, 'Font sizes', '12px'),
        sAssertSelectBoxDisplayValue(editor, 'Fonts', 'Arial')
      ])),

      Logger.t('Font family and font size on heading with no styles', GeneralSteps.sequence([
        tinyApis.sSetContent('<h1>a</h1>'),
        tinyApis.sFocus(),
        tinyApis.sSetCursor([0, 0], 0),
        tinyApis.sNodeChanged(),
        // h1 content style is 32px which matches 24pt in the font size select values so it should be converted
        sAssertSelectBoxDisplayValue(editor, 'Font sizes', '24pt'),
        sAssertSelectBoxDisplayValue(editor, 'Fonts', 'Arial')
      ])),

      Logger.t('Font family and font size on paragraph with styles that do match font size select values', GeneralSteps.sequence([
        tinyApis.sSetContent('<p style="font-family: Times; font-size: 17px;">a</p>'),
        tinyApis.sFocus(),
        tinyApis.sSetCursor([0, 0], 0),
        tinyApis.sNodeChanged(),
        // the following should be converted and pick up 12.75pt, although there's a rounded 13pt in the dropdown as well
        sAssertSelectBoxDisplayValue(editor, 'Font sizes', '12.75pt'),
        sAssertSelectBoxDisplayValue(editor, 'Fonts', 'Times')
      ])),

      Logger.t('Font family and font size on paragraph with styles that do not match font size select values', GeneralSteps.sequence([
        tinyApis.sSetContent('<p style="font-family: Times; font-size: 18px;">a</p>'),
        tinyApis.sFocus(),
        tinyApis.sSetCursor([0, 0], 0),
        tinyApis.sNodeChanged(),
        // the following should stay as 18px because there's no matching pt value in the font size select values
        sAssertSelectBoxDisplayValue(editor, 'Font sizes', '18px'),
        sAssertSelectBoxDisplayValue(editor, 'Fonts', 'Times')
      ])),

      Logger.t('Font family and font size on paragraph with legacy font elements', GeneralSteps.sequence([
        tinyApis.sSetRawContent('<p><font face="Times" size="1">a</font></p>'),
        tinyApis.sFocus(),
        tinyApis.sSetCursor([0, 0, 0], 0),
        tinyApis.sNodeChanged(),
        sAssertSelectBoxDisplayValue(editor, 'Font sizes', '8pt'),
        sAssertSelectBoxDisplayValue(editor, 'Fonts', 'Times')
      ])),

      Logger.t('System font stack variants on a paragraph show "System Font" as the font name', GeneralSteps.sequence([
        tinyApis.sSetContent(Arr.foldl(systemFontStackVariants, (acc, font) => {
          return acc + '<p style="font-family: ' + font.replace(/"/g, '\'') + '"></p>';
        }, '')),
        tinyApis.sFocus(),
        ...Arr.bind(systemFontStackVariants, (_, idx) => {
          return [
            tinyApis.sSetCursor([idx, 0], 0),
            tinyApis.sNodeChanged(),
            sAssertSelectBoxDisplayValue(editor, 'Fonts', 'System Font')
          ];
        })
      ]))
    ], onSuccess, onFailure);
  }, {
    base_url: '/project/tinymce/js/tinymce',
    toolbar: 'fontsizeselect fontselect',
    content_style: [
      '.mce-content-body { font-family: Helvetica; font-size: 42px; }',
      '.mce-content-body p { font-family: Arial; font-size: 12px; }',
      '.mce-content-body h1 { font-family: Arial; font-size: 32px; }'
    ].join(''),
    fontsize_formats: '8pt=1 12pt 12.75pt 13pt 24pt 32pt'
  }, success, failure);
});
