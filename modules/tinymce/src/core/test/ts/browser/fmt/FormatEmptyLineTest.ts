import { context, describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

interface TestConfig {
  readonly selector: string;
  readonly selectorCount: number;
  readonly html: string;
  readonly select: (editor: Editor) => void;
  readonly apply: (editor: Editor) => void;
  readonly remove: (editor: Editor) => void;
}

type PartialTestConfig = Omit<TestConfig, 'apply' | 'remove' | 'selector'>;

describe('browser.tinymce.core.fmt.FormatEmptyLineTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    toolbar: 'forecolor backcolor | bold italic underline strikethrough | alignleft',
    format_empty_lines: true,
    base_url: '/project/tinymce/js/tinymce'
  }, [], true);

  const tagHTML = (tag: string) => `<${tag}>a</${tag}><${tag}>&nbsp;</${tag}><${tag}>b</${tag}>`;

  const toggleInlineStyle = (style: string) => (editor: Editor) => {
    TinyUiActions.clickOnToolbar(editor, `[aria-label="${style}"]`);
  };
  const applyCustomFormat = (format: string) => (editor: Editor) => editor.formatter.apply(format);
  const removeCustomFormat = (format: string) => (editor: Editor) => editor.formatter.remove(format);

  const selectAll = (editor: Editor) => editor.execCommand('SelectAll');

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

  const testFormat = (testId: string, label: string, config: TestConfig) => {
    const { selector, selectorCount, html } = config;
    const expectedPresence = { [selector]: selectorCount };
    const expectedPresenceOnRemove = { [selector]: 0 };

    it(`${testId}: Test format: ${label}`, () => {
      const editor = hook.editor();
      editor.setContent(html);
      editor.focus();
      config.select(editor);
      config.apply(editor);
      TinyAssertions.assertContentPresence(editor, expectedPresence);
      config.remove(editor);
      TinyAssertions.assertContentPresence(editor, expectedPresenceOnRemove);
    });
  };

  const sTestInlineFormats = (testId: string, label: string, config: PartialTestConfig) =>
    context(`${testId}: Test inline formats: ${label}`, () => {
      testFormat(testId, 'Bold', {
        ...config,
        selector: 'strong',
        apply: toggleInlineStyle('Bold'),
        remove: toggleInlineStyle('Bold')
      });

      testFormat(testId, 'Italic', {
        ...config,
        selector: 'em',
        apply: toggleInlineStyle('Italic'),
        remove: toggleInlineStyle('Italic')
      });

      testFormat(testId, 'Underline', {
        ...config,
        selector: 'span[style*="text-decoration: underline;"]',
        apply: toggleInlineStyle('Underline'),
        remove: toggleInlineStyle('Underline')
      });

      testFormat(testId, 'Strikethrough', {
        ...config,
        selector: 's',
        apply: toggleInlineStyle('Strikethrough'),
        remove: toggleInlineStyle('Strikethrough')
      });
    });

  const testBlockFormats = (testId: string, label: string, config: PartialTestConfig) =>
    context(`${testId}: Test block formats: ${label}`, () => {
      testFormat(testId, 'h1', {
        ...config,
        selector: 'h1',
        apply: applyCustomFormat('h1'),
        remove: removeCustomFormat('h1')
      });

      testFormat(testId, 'div', {
        ...config,
        selector: 'div',
        apply: applyCustomFormat('div'),
        remove: removeCustomFormat('div')
      });
    });

  // Test inline formats on valid blocks
  sTestInlineFormats('TINY-6483', 'Check inline formats apply to valid empty block (paragraph)', {
    selectorCount: 3,
    html: tagHTML('p'),
    select: selectAll
  });
  sTestInlineFormats('TINY-6483', 'Check inline formats apply to valid empty block (heading)', {
    selectorCount: 3,
    html: tagHTML('p'),
    select: selectAll
  });
  sTestInlineFormats('TINY-6483', 'Check inline formats apply to valid empty block (preformat)', {
    selectorCount: 3,
    html: tagHTML('pre'),
    select: selectAll
  });
  sTestInlineFormats('TINY-6483', 'Check inline formats apply to valid empty block (div)', {
    selectorCount: 3,
    html: tagHTML('div'),
    select: selectAll
  });
  sTestInlineFormats('TINY-6483', 'Check inline formats apply to valid empty block (blockquote)', {
    selectorCount: 3,
    html: tagHTML('blockquote'),
    select: selectAll
  });
  sTestInlineFormats('TINY-6483', 'Check inline formats apply to valid empty block (list - li)', {
    selectorCount: 4,
    html: `<p>a</p>${listHTML}<p>c</p>`,
    select: selectAll
  });
  sTestInlineFormats('TINY-6483', 'Check inline formats apply to valid empty block (table - td,th)', {
    selectorCount: 5,
    html: `<p>a</p>${tableHTML}<p>c</p>`,
    select: selectAll
  });

  // Test that for a collapsed selection only the caret span is formatted and not the br
  sTestInlineFormats('TINY-6483', 'Check collapsed selection (paragraph)', {
    selectorCount: 1,
    html: tagHTML('p'),
    select: (editor) => TinySelections.setCursor(editor, [ 1, 0 ], 0)
  });

  // Test inline format on br surrounded by inline block
  testFormat('TINY-6483', 'Check inline format does not apply to empty inline block', {
    selector: 'strong',
    selectorCount: 3,
    html: '<p><em>a</em></p><p><em>&nbsp;<em></p><p><em>b</em></p>',
    select: selectAll,
    apply: toggleInlineStyle('Bold'),
    remove: toggleInlineStyle('Bold')
  });

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
    select: (editor) => TinySelections.setCursor(editor, [ 0, 0, 0, 0, 0 ], 0)
  });

  // Test block formats
  testBlockFormats('TINY-6483', 'Check block formats converts valid blocks (paragraphs)', {
    selectorCount: 3,
    html: tagHTML('p'),
    select: selectAll
  });
  testBlockFormats('TINY-6483', 'Check block formats do not apply to invalid empty block (list - li)', {
    selectorCount: 3,
    html: `<p>a</p>${listHTML}<p>c</p>`,
    select: selectAll
  });
  testBlockFormats('TINY-6483', 'Check block formats do not apply to invalid empty block (table - td,th)', {
    selectorCount: 3,
    html: `<p>a</p>${tableHTML}<p>c</p>`,
    select: selectAll
  });
});
