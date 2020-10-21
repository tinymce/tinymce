import { Log, Pipeline, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';
import Editor from 'tinymce/core/api/Editor';
import SilverTheme from 'tinymce/themes/silver/Theme';

interface TestConfig {
  readonly selector: string;
  readonly selectorCount: number;
  readonly html: string;
  readonly select: Step<any, any>;
  readonly apply: Step<any, any>;
  readonly remove: Step<any, any>;
}

type PartialTestConfig = Omit<TestConfig, 'apply' | 'remove' | 'selector'>;

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

    const sTestFormat = (testId: string, label: string, config: TestConfig) => {
      const { selector, selectorCount, html } = config;
      const expectedPresence = { [selector]: selectorCount };
      const expectedPresenceOnRemove = { [selector]: 0 };

      return Log.stepsAsStep(testId, `Test format: ${label}`, [
        tinyApis.sSetContent(html),
        tinyApis.sFocus(),
        config.select,
        config.apply,
        tinyApis.sAssertContentPresence(expectedPresence),
        config.remove,
        tinyApis.sAssertContentPresence(expectedPresenceOnRemove)
      ]);
    };

    const sTestInlineFormats = (testId: string, label: string, config: PartialTestConfig) =>
      Log.stepsAsStep(testId, `Test inline formats: ${label}`, [
        sTestFormat(testId, 'Bold', {
          ...config,
          selector: 'strong',
          apply: sToggleInlineStyle('Bold'),
          remove: sToggleInlineStyle('Bold')
        }),
        sTestFormat(testId, 'Italic', {
          ...config,
          selector: 'em',
          apply: sToggleInlineStyle('Italic'),
          remove: sToggleInlineStyle('Italic')
        }),
        sTestFormat(testId, 'Underline', {
          ...config,
          selector: 'span[style*="text-decoration: underline;"]',
          apply: sToggleInlineStyle('Underline'),
          remove: sToggleInlineStyle('Underline')
        }),
        sTestFormat(testId, 'Strikethrough', {
          ...config,
          selector: 'span[style*="text-decoration: line-through;"]',
          apply: sToggleInlineStyle('Strikethrough'),
          remove: sToggleInlineStyle('Strikethrough')
        })
      ]);

    const sTestBlockFormats = (testId: string, label: string, config: PartialTestConfig) =>
      Log.stepsAsStep(testId, `Test block formats: ${label}`, [
        sTestFormat(testId, 'h1', {
          ...config,
          selector: 'h1',
          apply: sApplyCustomFormat('h1'),
          remove: sRemoveCustomFormat('h1')
        }),
        sTestFormat(testId, 'div', {
          ...config,
          selector: 'div',
          apply: sApplyCustomFormat('div'),
          remove: sRemoveCustomFormat('div')
        })
      ]);

    Pipeline.async({}, [
      tinyApis.sFocus(),
      // Test inline formats on valid blocks
      sTestInlineFormats('TINY-6483', 'Check inline formats apply to valid empty block (paragraph)', {
        selectorCount: 3,
        html: tagHTML('p'),
        select: sSelectAll
      }),
      sTestInlineFormats('TINY-6483', 'Check inline formats apply to valid empty block (heading)', {
        selectorCount: 3,
        html: tagHTML('p'),
        select: sSelectAll
      }),
      sTestInlineFormats('TINY-6483', 'Check inline formats apply to valid empty block (preformat)', {
        selectorCount: 3,
        html: tagHTML('pre'),
        select: sSelectAll
      }),
      sTestInlineFormats('TINY-6483', 'Check inline formats apply to valid empty block (div)', {
        selectorCount: 3,
        html: tagHTML('div'),
        select: sSelectAll
      }),
      sTestInlineFormats('TINY-6483', 'Check inline formats apply to valid empty block (blockquote)', {
        selectorCount: 3,
        html: tagHTML('blockquote'),
        select: sSelectAll
      }),
      sTestInlineFormats('TINY-6483', 'Check inline formats apply to valid empty block (list - li)', {
        selectorCount: 4,
        html: `<p>a</p>${listHTML}<p>c</p>`,
        select: sSelectAll
      }),
      sTestInlineFormats('TINY-6483', 'Check inline formats apply to valid empty block (table - td,th)', {
        selectorCount: 5,
        html: `<p>a</p>${tableHTML}<p>c</p>`,
        select: sSelectAll
      }),

      // Test that for a collapsed selection only the caret span is formatted and not the br
      sTestInlineFormats('TINY-6483', 'Check collapsed selection (paragraph)', {
        selectorCount: 1,
        html: tagHTML('p'),
        select: tinyApis.sSetCursor([ 1, 0 ], 0)
      }),

      // Test inline format on br surrounded by inline block
      sTestFormat('TINY-6483', 'Check inline format does not apply to empty inline block', {
        selector: 'strong',
        selectorCount: 3,
        html: '<p><em>a</em></p><p><em>&nbsp;<em></p><p><em>b</em></p>',
        select: sSelectAll,
        apply: sToggleInlineStyle('Bold'),
        remove: sToggleInlineStyle('Bold')
      }),

      // Test cells can be formatted with internal table selections
      sTestInlineFormats('TINY-6483', 'Check inline formats apply to table cells with explicit cell selections', {
        selectorCount: 3,
        html: `<table style="border-collapse: collapse; width: 100%;" border="1" data-mce-selected="1">
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
        select: tinyApis.sSetCursor([ 0, 0, 0, 0, 0 ], 0)
      }),

      // Test block formats
      sTestBlockFormats('TINY-6483', 'Check block formats converts valid blocks (paragraphs)', {
        selectorCount: 3,
        html: tagHTML('p'),
        select: sSelectAll
      }),
      sTestBlockFormats('TINY-6483', 'Check block formats do not apply to invalid empty block (list - li)', {
        selectorCount: 3,
        html: `<p>a</p>${listHTML}<p>c</p>`,
        select: sSelectAll
      }),
      sTestBlockFormats('TINY-6483', 'Check block formats do not apply to invalid empty block (table - td,th)', {
        selectorCount: 3,
        html: `<p>a</p>${tableHTML}<p>c</p>`,
        select: sSelectAll
      })
    ], onSuccess, onFailure);
  }, {
    plugins: '',
    menubar: false,
    toolbar: 'forecolor backcolor | bold italic underline strikethrough | alignleft',
    format_empty_lines: true,
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
