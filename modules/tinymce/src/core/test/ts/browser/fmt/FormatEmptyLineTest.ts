import { Log, Pipeline, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Obj } from '@ephox/katamari';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';
import Editor from 'tinymce/core/api/Editor';
import SilverTheme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.core.fmt.FormatEmptyLineTest', (success, failure) => {
  SilverTheme();

  TinyLoader.setupLight((editor: Editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);
    const tinyUi = TinyUi(editor);

    const tagHTML = (tag: string) => `<${tag}>a</${tag}><${tag}>&nbsp;</${tag}><${tag}>b</${tag}>`;

    const sToggleInlineStyle = (style: string) => tinyUi.sClickOnToolbar(`click ${style}`, `[aria-label="${style}"]`);
    const sApplyCustomFormat = (format: string) => Step.sync(() => editor.formatter.apply(format));
    const sRemoveCustomFormat = (format: string) => Step.sync(() => editor.formatter.remove(format));

    const sSelectAll = Step.sync(() => editor.execCommand('SelectAll'));

    const tableHTML = `<table style="border-collapse: collapse; width: 100%;" border="1">
    <tbody>
    <tr>
    <th scope="row">&nbsp;</th>
    </tr>
    <tr>
    <td>b</td>
    </tr>
    <tr>
    <td>&nbsp;</td>
    </tr>
    </tbody>
    </table>`;

    const listHTML = `<ul>
    <li>b</li>
    <li>&nbsp;</li>
    </ul>`;

    const sTestFormat = (label: string, styleSelector: string, selectorCount: number, html: string, sSelect: Step<any, any>, sApplyFormat: Step<any, any>, sRemoveFormat: Step<any, any>) => {
      const expectedPresence: Record<string, number> = {};
      expectedPresence[styleSelector] = selectorCount;
      const expectedPresenceOnRemove = Obj.map(expectedPresence, (val, key) => key === styleSelector ? 0 : val);

      return Log.stepsAsStep('TINY-6483', `Test format: ${label}`, [
        tinyApis.sSetContent(html),
        tinyApis.sFocus(),
        sSelect,
        sApplyFormat,
        tinyApis.sAssertContentPresence(expectedPresence),
        sRemoveFormat,
        tinyApis.sAssertContentPresence(expectedPresenceOnRemove)
      ]);
    };

    const sTestInlineFormats = (label: string, html: string, sSelectAll: Step<any, any>, selectorCount: number) =>
      Log.stepsAsStep('TINY-6483', `Test inline formats: ${label}`, [
        sTestFormat('Bold', 'strong', selectorCount, html, sSelectAll, sToggleInlineStyle('Bold'), sToggleInlineStyle('Bold')),
        sTestFormat('Italic', 'em', selectorCount, html, sSelectAll, sToggleInlineStyle('Italic'), sToggleInlineStyle('Italic')),
        sTestFormat('Underline', 'span[style*="text-decoration: underline;"]', selectorCount, html, sSelectAll, sToggleInlineStyle('Underline'), sToggleInlineStyle('Underline')),
        sTestFormat('Strikethrough', 'span[style*="text-decoration: line-through;"]', selectorCount, html, sSelectAll, sToggleInlineStyle('Strikethrough'), sToggleInlineStyle('Strikethrough'))
      ]);

    const sTestBlockFormats = (label: string, html: string, sSelectAll: Step<any, any>, selectorCount: number) =>
      Log.stepsAsStep('TINY-6483', `Test block formats: ${label}`, [
        sTestFormat('h1', 'h1', selectorCount, html, sSelectAll, sApplyCustomFormat('h1'), sRemoveCustomFormat('h1')),
        sTestFormat('div', 'div', selectorCount, html, sSelectAll, sApplyCustomFormat('div'), sRemoveCustomFormat('div'))
      ]);

    Pipeline.async({}, [
      tinyApis.sFocus(),
      // Test inline formats on valid blocks
      sTestInlineFormats('Check inline formats apply to valid empty block (paragraph)', tagHTML('p'), sSelectAll, 3),
      sTestInlineFormats('Check inline formats apply to valid empty block (heading)', tagHTML('h1'), sSelectAll, 3),
      sTestInlineFormats('Check inline formats apply to valid empty block (preformat)', tagHTML('pre'), sSelectAll, 3),
      sTestInlineFormats('Check inline formats apply to valid empty block (div)', tagHTML('div'), sSelectAll, 3),
      sTestInlineFormats('Check inline formats apply to valid empty block (blockquote)', tagHTML('blockquote'), sSelectAll, 3),
      sTestInlineFormats('Check inline formats apply to valid empty block (list - li)', `<p>a</p>${listHTML}<p>c</p>`, sSelectAll, 4),
      sTestInlineFormats('Check inline formats apply to valid empty block (table - td,th)', `<p>a</p>${tableHTML}<p>c</p>`, sSelectAll, 5),

      // Test inline format on br surrounded by inline block
      sTestFormat(
        'Check inline format does not apply to empty inline block',
        'strong',
        3,
        '<p><em>a</em></p><p><em>&nbsp;<em></p><p><em>b</em></p>',
        sSelectAll,
        sToggleInlineStyle('Bold'),
        sToggleInlineStyle('Bold')
      ),

      // Test cells can be formatted with internal table selections
      sTestInlineFormats(
        'Check inline formats apply to table cells with explicit cell selections',
        `<table style="border-collapse: collapse; width: 100%;" border="1" data-mce-selected="1">
          <tbody>
          <tr>
          <th scope="row" data-mce-selected="1" data-mce-first-selected="1">&nbsp;</th>
          </tr>
          <tr>
          <td data-mce-selected="1">b</td>
          </tr>
          <tr>
          <td data-mce-selected="1" data-mce-last-selected="1">&nbsp;</td>
          </tr>
          </tbody>
          </table>`,
        tinyApis.sSetCursor([ 0, 0, 0, 0, 0 ], 0),
        3
      ),

      // Test block formats
      sTestBlockFormats('Check block formats converts valid blocks (paragraphs)', tagHTML('p'), sSelectAll, 3),
      sTestBlockFormats('Check block formats do not apply to invalid empty block (list - li)', `<p>a</p>${listHTML}<p>c</p>`, sSelectAll, 3),
      sTestBlockFormats('Check block formats do not apply to invalid empty block (table - td,th)', `<p>a</p>${tableHTML}<p>c</p>`, sSelectAll, 3)
    ], onSuccess, onFailure);
  }, {
    plugins: '',
    toolbar: 'forecolor backcolor | bold italic underline strikethrough | alignleft',
    format_empty_lines: true,
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
