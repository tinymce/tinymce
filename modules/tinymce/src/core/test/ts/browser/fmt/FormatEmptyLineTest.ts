import { Keys } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Type, Unicode } from '@ephox/katamari';
import { TinyAssertions, TinyContentActions, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

interface TestConfig {
  readonly selector: string;
  readonly selectorCount: number;
  readonly html: string;
  readonly rawHtml?: boolean;
  readonly expectedHtml?: string;
  readonly expectedRawHtml?: string;
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

  const tagHTML = (tag: string) => `<${tag}>a</${tag}>\n<${tag}>&nbsp;</${tag}>\n<${tag}>b</${tag}>`;

  const toggleInlineStyle = (style: string) => (editor: Editor) => {
    TinyUiActions.clickOnToolbar(editor, `[aria-label="${style}"]`);
  };
  const applyCustomFormat = (format: string) => (editor: Editor) => editor.formatter.apply(format);
  const removeCustomFormat = (format: string) => (editor: Editor) => editor.formatter.remove(format);

  const selectAll = (editor: Editor) => editor.execCommand('SelectAll');

  const pAssertToolbarButtonState = (editor: Editor, selector: string, active: boolean) =>
    TinyUiActions.pWaitForUi(editor, `button[aria-label="${selector}"][aria-pressed="${active}"]`);

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

  const listHTML = `<ul>\n<li>b</li>\n<li>&nbsp;</li>\n</ul>`;

  const testFormat = (editor: Editor, config: TestConfig) => {
    const { selector, selectorCount, html, expectedHtml, expectedRawHtml, rawHtml } = config;
    const expectedPresence = { [selector]: selectorCount };
    const expectedPresenceOnRemove = { [selector]: 0 };

    editor.setContent(html, { format: rawHtml === true ? 'raw' : 'html' });
    editor.focus();
    config.select(editor);
    config.apply(editor);
    TinyAssertions.assertContentPresence(editor, expectedPresence);
    if (Type.isNonNullable(expectedHtml)) {
      TinyAssertions.assertContent(editor, expectedHtml);
    }
    if (Type.isNonNullable(expectedRawHtml)) {
      TinyAssertions.assertRawContent(editor, expectedRawHtml);
    }
    config.remove(editor);
    TinyAssertions.assertContentPresence(editor, expectedPresenceOnRemove);
  };

  const testInlineFormats = (editor: Editor, config: PartialTestConfig) => {
    testFormat(editor, {
      ...config,
      selector: 'strong',
      apply: toggleInlineStyle('Bold'),
      remove: toggleInlineStyle('Bold')
    });

    testFormat(editor, {
      ...config,
      selector: 'em',
      apply: toggleInlineStyle('Italic'),
      remove: toggleInlineStyle('Italic')
    });

    testFormat(editor, {
      ...config,
      selector: 'span[style*="text-decoration: underline;"]',
      apply: toggleInlineStyle('Underline'),
      remove: toggleInlineStyle('Underline')
    });

    testFormat(editor, {
      ...config,
      selector: 's',
      apply: toggleInlineStyle('Strikethrough'),
      remove: toggleInlineStyle('Strikethrough')
    });
  };

  const testBlockFormats = (editor: Editor, config: PartialTestConfig) => {
    testFormat(editor, {
      ...config,
      selector: 'h1',
      apply: applyCustomFormat('h1'),
      remove: removeCustomFormat('h1')
    });

    testFormat(editor, {
      ...config,
      selector: 'div',
      apply: applyCustomFormat('div'),
      remove: removeCustomFormat('div')
    });
  };

  context('Test inline formats on valid blocks', () => {
    it('TINY-6483: Check inline formats apply to valid empty block (paragraph)', () => {
      testInlineFormats(hook.editor(), {
        selectorCount: 3,
        html: tagHTML('p'),
        select: selectAll
      });
    });

    it('TINY-6483: Check inline formats apply to valid empty block (heading)', () => {
      testInlineFormats(hook.editor(), {
        selectorCount: 3,
        html: tagHTML('p'),
        select: selectAll
      });
    });

    it('TINY-6483: Check inline formats apply to valid empty block (preformat)', () => {
      testInlineFormats(hook.editor(), {
        selectorCount: 3,
        html: tagHTML('pre'),
        select: selectAll
      });
    });

    it('TINY-6483: Check inline formats apply to valid empty block (div)', () => {
      testInlineFormats(hook.editor(), {
        selectorCount: 3,
        html: tagHTML('div'),
        select: selectAll
      });
    });

    it('TINY-6483: Check inline formats apply to valid empty block (blockquote)', () => {
      testInlineFormats(hook.editor(), {
        selectorCount: 3,
        html: tagHTML('blockquote'),
        select: selectAll
      });
    });

    it('TINY-6483: Check inline formats apply to valid empty block (list - li)', () => {
      testInlineFormats(hook.editor(), {
        selectorCount: 4,
        html: `<p>a</p>\n${listHTML}\n<p>c</p>`,
        select: selectAll
      });
    });

    it('TINY-6483: Check inline formats apply to valid empty block (table - td,th)', () => {
      testInlineFormats(hook.editor(), {
        selectorCount: 5,
        html: `<p>a</p>${tableHTML}<p>c</p>`,
        select: selectAll
      });
    });
  });

  // Test that for a collapsed selection only the caret span is formatted and not the br
  it('TINY-6483: Check collapsed selection (paragraph)', () => {
    testInlineFormats(hook.editor(), {
      selectorCount: 1,
      html: tagHTML('p'),
      select: (editor) => TinySelections.setCursor(editor, [ 1, 0 ], 0)
    });
  });

  // Test inline format on br surrounded by inline block
  it('TINY-6483: Check inline format does not apply to empty inline block', () => {
    testFormat(hook.editor(), {
      selector: 'strong',
      selectorCount: 3,
      html: '<p><em>a</em></p>\n<p><em>&nbsp;</em></p>\n<p><em>b</em></p>',
      select: selectAll,
      apply: toggleInlineStyle('Bold'),
      remove: toggleInlineStyle('Bold')
    });
  });

  // Test cells can be formatted with internal table selections
  it('TINY-6483: Check inline formats apply to table cells with explicit cell selections', () => {
    testInlineFormats(hook.editor(), {
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
  });

  context('Test block formats', () => {
    it('TINY-6483: Check block formats converts valid blocks (paragraphs)', () => {
      testBlockFormats(hook.editor(), {
        selectorCount: 3,
        html: tagHTML('p'),
        select: selectAll
      });
    });

    it('TINY-6483: Check block formats do not apply to invalid empty block (list - li)', () => {
      testBlockFormats(hook.editor(), {
        selectorCount: 3,
        html: `<p>a</p>\n${listHTML}\n<p>c</p>`,
        select: selectAll
      });
    });

    it('TINY-6483: Check block formats do not apply to invalid empty block (table - td,th)', () => {
      testBlockFormats(hook.editor(), {
        selectorCount: 3,
        html: `<p>a</p>\n${tableHTML}<p>c</p>`,
        select: selectAll
      });
    });
  });

  context('Serializing empty inline format elements', () => {
    it('TINY-8639: Check inline format is correctly serialized (bold)', () => {
      testFormat(hook.editor(), {
        selector: 'strong',
        selectorCount: 3,
        html: '<p>a</p><p><br data-mce-bogus="1"></p><p>b</p>',
        rawHtml: true,
        expectedHtml:
          '<p><strong>a</strong></p>\n' +
          '<p><strong>&nbsp;</strong></p>\n' +
          '<p><strong>b</strong></p>',
        expectedRawHtml:
          '<p><strong>a</strong></p>' +
          '<p><strong><br data-mce-bogus="1"></strong></p>' +
          '<p><strong>b</strong></p>',
        select: selectAll,
        apply: toggleInlineStyle('Bold'),
        remove: toggleInlineStyle('Bold')
      });
    });

    it('TINY-8639: Check inline format is correctly serialized (strikethrough)', () => {
      testFormat(hook.editor(), {
        selector: 's',
        selectorCount: 3,
        html: '<p>a</p><p><br data-mce-bogus="1"></p><p>b</p>',
        rawHtml: true,
        expectedHtml:
          '<p><s>a</s></p>\n' +
          '<p><s>&nbsp;</s></p>\n' +
          '<p><s>b</s></p>',
        expectedRawHtml:
          '<p><s>a</s></p>' +
          '<p><s><br data-mce-bogus="1"></s></p>' +
          '<p><s>b</s></p>',
        select: selectAll,
        apply: toggleInlineStyle('Strikethrough'),
        remove: toggleInlineStyle('Strikethrough')
      });
    });

    it('TINY-8639: Check inline format is correctly serialized (underline)', () => {
      testFormat(hook.editor(), {
        selector: 'span[style="text-decoration: underline;"]',
        selectorCount: 3,
        html: '<p>a</p><p><br data-mce-bogus="1"></p><p>b</p>',
        rawHtml: true,
        expectedHtml:
          '<p><span style="text-decoration: underline;">a</span></p>\n' +
          '<p><span style="text-decoration: underline;">&nbsp;</span></p>\n' +
          '<p><span style="text-decoration: underline;">b</span></p>',
        expectedRawHtml:
          '<p><span style="text-decoration: underline;" data-mce-style="text-decoration: underline;">a</span></p>' +
          '<p><span style="text-decoration: underline;" data-mce-style="text-decoration: underline;"><br data-mce-bogus="1"></span></p>' +
          '<p><span style="text-decoration: underline;" data-mce-style="text-decoration: underline;">b</span></p>',
        select: selectAll,
        apply: toggleInlineStyle('Underline'),
        remove: toggleInlineStyle('Underline')
      });
    });

    it('TINY-8639: Check inline format is correctly serialized (bold and strikethrough)', () => {
      testFormat(hook.editor(), {
        selector: 'strong',
        selectorCount: 3,
        html: '<p>a</p><p><br data-mce-bogus="1"></p><p>b</p>',
        rawHtml: true,
        expectedHtml:
          '<p><s><strong>a</strong></s></p>\n' +
          '<p><s><strong>&nbsp;</strong></s></p>\n' +
          '<p><s><strong>b</strong></s></p>',
        expectedRawHtml:
          '<p><s><strong>a</strong></s></p>' +
          '<p><s><strong><br data-mce-bogus="1"></strong></s></p>' +
          '<p><s><strong>b</strong></s></p>',
        select: selectAll,
        apply: (editor) => {
          toggleInlineStyle('Bold')(editor);
          toggleInlineStyle('Strikethrough')(editor);
        },
        remove: (editor) => {
          toggleInlineStyle('Bold')(editor);
          toggleInlineStyle('Strikethrough')(editor);
        },
      });
    });

    it('TINY-8639: Check inline format is correctly serialized in list item', () => {
      testFormat(hook.editor(), {
        selector: 'strong',
        selectorCount: 2,
        html: '<p>a</p><ul><li><br data-mce-bogus="1"></li></ul>',
        rawHtml: true,
        expectedHtml:
          '<p><strong>a</strong></p>\n' +
          '<ul>\n<li style="font-weight: bold;"><strong>&nbsp;</strong></li>\n</ul>',
        expectedRawHtml:
          '<p><strong>a</strong></p>' +
          '<ul><li style="font-weight: bold;" data-mce-style="font-weight: bold;"><strong><br data-mce-bogus="1"></strong></li></ul>',
        select: selectAll,
        apply: toggleInlineStyle('Bold'),
        remove: toggleInlineStyle('Bold')
      });
    });

    it('TINY-8639: should be able to insert and type in serialized empty inline format element', async () => {
      const editor = hook.editor();
      editor.setContent('<p>a</p><p><br data-mce-bogus="1"></p>', { format: 'raw' });
      selectAll(editor);
      toggleInlineStyle('Bold')(editor);
      TinyAssertions.assertRawContent(editor, '<p><strong>a</strong></p><p><strong><br data-mce-bogus="1"></strong></p>');
      TinyAssertions.assertContent(editor, '<p><strong>a</strong></p>\n<p><strong>&nbsp;</strong></p>');

      TinySelections.setCursor(editor, [ 1, 0, 0 ], 0);
      await pAssertToolbarButtonState(editor, 'Bold', true);

      const content = editor.getContent();
      editor.setContent(content);
      TinyAssertions.assertRawContent(editor, '<p><strong>a</strong></p><p><strong>&nbsp;</strong></p>');
      TinySelections.setCursor(editor, [ 1, 0, 0 ], 0);
      await pAssertToolbarButtonState(editor, 'Bold', true);
      TinyContentActions.type(editor, 'abc');
      TinyAssertions.assertRawContent(editor, '<p><strong>a</strong></p><p><strong>abc&nbsp;</strong></p>');
    });

    it('TINY-8639: should be able to insert and remove serialized empty inline format element', async () => {
      const editor = hook.editor();
      editor.setContent('<p><strong>a</strong></p><p><strong>&nbsp;</strong></p>');
      TinySelections.setCursor(editor, [ 1, 0, 0 ], 0);
      await pAssertToolbarButtonState(editor, 'Bold', true);
      toggleInlineStyle('Bold')(editor);
      TinyAssertions.assertRawContent(editor, '<p><strong>a</strong></p><p>&nbsp;</p>');
    });

    it('TINY-8639: should serialize caret formatted empty line if the cursor has not moved', () => {
      const editor = hook.editor();
      editor.setContent('<p>a</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 1);
      TinyContentActions.keystroke(editor, Keys.enter());
      toggleInlineStyle('Bold')(editor);
      TinyAssertions.assertRawContent(
        editor,
        '<p>a</p>' +
        `<p><span id="_mce_caret" data-mce-bogus="1" data-mce-type="format-caret"><strong>${Unicode.zeroWidth}</strong></span><br data-mce-bogus="1"></p>`
      );
      TinyAssertions.assertContent(editor, '<p>a</p>\n<p><strong>&nbsp;</strong></p>');
    });
  });

  context('Parsing empty inline formatting elements', () => {
    it('TINY-8639: should be padded on an empty line', () => {
      const editor = hook.editor();
      editor.setContent('<p><strong></strong></p>');
      TinyAssertions.assertRawContent(editor, '<p><strong>&nbsp;</strong></p>');
      TinyAssertions.assertContent(editor, '<p><strong>&nbsp;</strong></p>');
    });

    it('TINY-8639: should be padded when in an empty block', () => {
      const editor = hook.editor();
      editor.setContent('<div>test<div><strong></strong></div></div>');
      TinyAssertions.assertRawContent(editor, '<div>test<div><strong>&nbsp;</strong></div></div>');
      TinyAssertions.assertContent(editor, '<div>test\n<div><strong>&nbsp;</strong></div>\n</div>');
    });

    it('TINY-8639: should not be padded when in an non-empty line', () => {
      const editor = hook.editor();
      editor.setContent('<p>te<strong></strong>s<s></s>t<span style="text-decoration: underline;"></span>ing</p>');
      TinyAssertions.assertRawContent(editor, '<p>testing</p>');
      TinyAssertions.assertContent(editor, '<p>testing</p>');
    });

    it('TINY-8639: should not be padded when in an non-empty block', () => {
      const editor = hook.editor();
      editor.setContent('<div><div>te<strong></strong>st</div></div>');
      TinyAssertions.assertRawContent(editor, '<div><div>test</div></div>');
      TinyAssertions.assertContent(editor, '<div>\n<div>test</div>\n</div>');
    });
  });
});
