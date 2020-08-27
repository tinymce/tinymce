import { Assertions, Chain, Log, Pipeline, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Arr, Fun, Strings } from '@ephox/katamari';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { SugarElement, TextContent } from '@ephox/sugar';
import Theme from 'tinymce/themes/silver/Theme';
import Editor from 'tinymce/core/api/Editor';

interface Sel {
  startPath: number[];
  soffset: number;
  finishPath: number[];
  foffset: number;
}

const selObj = (startPath: number[], soffset: number, finishPath: number[], foffset: number): Sel =>
  ({
    startPath,
    soffset,
    finishPath,
    foffset
  });

UnitTest.asynctest('browser.tinymce.core.FontSelectTest', function (success, failure) {
  Theme();

  const systemFontStackVariants = [
    `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;`, // Oxide
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";', // Bootstrap
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;' // Wordpress
  ];

  const sAssertSelectBoxDisplayValue = (title: string, expectedValue: string) =>
    Chain.asStep(SugarElement.fromDom(document.body), [
      UiFinder.cFindIn('*[title="' + title + '"]'),
      Chain.mapper(Fun.compose(Strings.trim, TextContent.get)),
      Assertions.cAssertEq('Should be the expected display value', expectedValue)
    ]);

  TinyLoader.setupLight((editor: Editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);

    const sAssertFontsForSelections = (description: string, selections: Sel[], expectedFontSize: string, expectedFontFamily: string) =>
      Log.stepsAsStep('TBA', description, Arr.bind(selections, (selection) => [
        tinyApis.sSetSelection(selection.startPath, selection.soffset, selection.finishPath, selection.foffset),
        tinyApis.sNodeChanged(),
        sAssertSelectBoxDisplayValue('Font sizes', expectedFontSize),
        sAssertSelectBoxDisplayValue('Fonts', expectedFontFamily)
      ]));

    Pipeline.async({}, [
      Log.stepsAsStep('TBA', 'Font family and font size on initial page load', [
        sAssertSelectBoxDisplayValue('Font sizes', '12px'),
        sAssertSelectBoxDisplayValue('Fonts', 'Arial')
      ]),

      Log.stepsAsStep('TBA', 'Font family and font size on paragraph with no styles', [
        tinyApis.sSetContent('<p>a</p>'),
        tinyApis.sFocus(),
        tinyApis.sSetCursor([ 0, 0 ], 0),
        tinyApis.sNodeChanged(),
        // p content style is 12px which does not match any pt values in the font size select values
        sAssertSelectBoxDisplayValue('Font sizes', '12px'),
        sAssertSelectBoxDisplayValue('Fonts', 'Arial')
      ]),

      Log.stepsAsStep('TBA', 'Font family and font size on heading with no styles', [
        tinyApis.sSetContent('<h1>a</h1>'),
        tinyApis.sFocus(),
        tinyApis.sSetCursor([ 0, 0 ], 0),
        tinyApis.sNodeChanged(),
        // h1 content style is 32px which matches 24pt in the font size select values so it should be converted
        sAssertSelectBoxDisplayValue('Font sizes', '24pt'),
        sAssertSelectBoxDisplayValue('Fonts', 'Arial')
      ]),

      Log.stepsAsStep('TBA', 'Font family and font size on paragraph with styles that do match font size select values', [
        tinyApis.sSetContent('<p style="font-family: Times; font-size: 17px;">a</p>'),
        tinyApis.sFocus(),
        tinyApis.sSetCursor([ 0, 0 ], 0),
        tinyApis.sNodeChanged(),
        // the following should be converted and pick up 12.75pt, although there's a rounded 13pt in the dropdown as well
        sAssertSelectBoxDisplayValue('Font sizes', '12.75pt'),
        sAssertSelectBoxDisplayValue('Fonts', 'Times')
      ]),

      Log.stepsAsStep('TBA', 'Font family and font size on paragraph with styles that do not match font size select values', [
        tinyApis.sSetContent('<p style="font-family: Times; font-size: 18px;">a</p>'),
        tinyApis.sFocus(),
        tinyApis.sSetCursor([ 0, 0 ], 0),
        tinyApis.sNodeChanged(),
        // the following should stay as 18px because there's no matching pt value in the font size select values
        sAssertSelectBoxDisplayValue('Font sizes', '18px'),
        sAssertSelectBoxDisplayValue('Fonts', 'Times')
      ]),

      Log.stepsAsStep('TBA', 'Font family and font size on paragraph with legacy font elements', [
        tinyApis.sSetRawContent('<p><font face="Times" size="1">a</font></p>'),
        tinyApis.sFocus(),
        tinyApis.sSetCursor([ 0, 0, 0 ], 0),
        tinyApis.sNodeChanged(),
        sAssertSelectBoxDisplayValue('Font sizes', '8pt'),
        sAssertSelectBoxDisplayValue('Fonts', 'Times')
      ]),

      Log.stepsAsStep('TBA', 'System font stack variants on a paragraph show "System Font" as the font name', [
        tinyApis.sSetContent(Arr.foldl(systemFontStackVariants, (acc, font) => acc + '<p style="font-family: ' + font.replace(/"/g, `'`) + '"></p>', '')),
        tinyApis.sFocus(),
        ...Arr.bind(systemFontStackVariants, (_, idx) => [
          tinyApis.sSetCursor([ idx, 0 ], 0),
          tinyApis.sNodeChanged(),
          sAssertSelectBoxDisplayValue('Fonts', 'System Font')
        ])
      ]),

      Log.stepsAsStep('TINY-6207', 'Font family and font size on paragraph with words of different families and sizes', [
        tinyApis.sSetContent(`<p>font1 <span style="font-family: 'arial black', sans-serif; font-size: 24pt;">font2 </span> font3</p>`),
        tinyApis.sFocus(),
        // Check first font is detected
        sAssertFontsForSelections('Check font family and font size are found (0)', [ selObj([ 0, 0 ], 1, [ 0, 0 ], 1) ], '12px', 'Arial'),
        // Check second font is detected
        sAssertFontsForSelections('Check font family and fontsize are found (1)', [ selObj([ 0, 1, 0 ], 1, [ 0, 1, 0 ], 1) ], '24pt', 'Arial Black'),
        // Check no font is found when multiple fonts are selected
        sAssertFontsForSelections(
          'Check no font family or font size is found for multi font selections',
          [
            selObj([ 0, 0 ], 1, [ 0, 1, 0 ], 1),
            selObj([ 0, 1, 0 ], 1, [ 0, 2 ], 1),
            selObj([], 0, [], 0)
          ], '', '')
      ]),

      Log.stepsAsStep('TINY-6207', 'Font family and font size on paragraph with nested families and sizes', [
        tinyApis.sSetContent(`<p>a<span style="font-family: 'arial black', sans-serif;">b<span style="font-family: impact, sans-serif; font-size: 12pt;">c</span>d</span>e</p>`),
        tinyApis.sFocus(),
        // a
        sAssertFontsForSelections('Check font family and font size are found (0)', [ selObj([ 0, 0 ], 1, [ 0, 0 ], 1) ], '12px', 'Arial'),
        // b
        sAssertFontsForSelections('Check font family and font size are found (1)', [ selObj([ 0, 1, 0 ], 1, [ 0, 1, 0 ], 1) ], '12px', 'Arial Black'),
        // c
        sAssertFontsForSelections('Check font family and font size are found (2)', [ selObj([ 0, 1, 1, 0 ], 1, [ 0, 1, 1, 0 ], 1) ], '12pt', 'Impact'),
        // d
        sAssertFontsForSelections('Check font family and font size are found (3)', [ selObj([ 0, 1, 2 ], 1, [ 0, 1, 2 ], 1) ], '12px', 'Arial Black'),
        // e
        sAssertFontsForSelections('Check font family and font size are found (4)', [ selObj([ 0, 2 ], 1, [ 0, 2 ], 1) ], '12px', 'Arial'),
        // |ab|cde
        sAssertFontsForSelections('Check font size is found', [ selObj([ 0, 0 ], 0, [ 0, 1, 0 ], 1) ], '12px', ''),
        // Multi font selection
        sAssertFontsForSelections(
          'Check no font family or font size is found for multi font selections',
          [
            selObj([ 0, 1, 1, 0 ], 0, [ 0, 1, 2 ], 1), // ab|cd|e
            selObj([], 0, [], 0)
          ], '', '')
      ]),

      Log.stepsAsStep('TINY-6207', 'Font family and font size on empty span', [
        tinyApis.sSetContent(`<p>abc<span style="font-family: 'arial black', sans-serif; font-size: 13pt;"><br></span></p>`),
        tinyApis.sFocus(),
        sAssertFontsForSelections('Check computed font family and font size are found', [ selObj([ 0, 0 ], 1, [ 0, 0 ], 1) ], '12px', 'Arial'),
        sAssertFontsForSelections('Check font family and font size are found in empty span', [ selObj([ 0, 1, 0 ], 0, [ 0, 1, 0 ], 0) ], '13pt', 'Arial Black'),
        sAssertFontsForSelections(
          'Check no font family or font size is found for multi font selections',
          [
            selObj([ 0, 0 ], 0, [ 0, 1, 0 ], 0),
            selObj([], 0, [], 0)
          ], '', '')
      ]),

      Log.stepsAsStep('TINY-6207', 'Font family and font size with multiple paragraphs', [
        tinyApis.sSetContent(
          `<p>test1</p>` +
          `<p>tes<span style="font-size: 13pt;">t2</span></p>` +
          `<p><span style="font-family: 'arial black', sans-serif; font-size: 13pt;">test3</span></p>`
        ),
        tinyApis.sFocus(),
        // t|est1\nt|est2
        sAssertFontsForSelections('Check font family and font size are found', [ selObj([ 0, 0 ], 1, [ 1, 0 ], 1) ], '12px', 'Arial'),
        // t|est1\ntest|2
        sAssertFontsForSelections('Check font family is found', [ selObj([ 0, 0 ], 1, [ 1, 1, 0 ], 1) ], '', 'Arial'),
        // // test|2\nte|st3
        sAssertFontsForSelections('Check font size is found', [ selObj([ 1, 1, 0 ], 1, [ 2, 0, 0 ], 1) ], '13pt', ''),
        sAssertFontsForSelections(
          'Check no font family or font size is found for multi font selections',
          [
            selObj([ 1 ], 0, [ 2 ], 0)
          ], '', '')
      ])
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
