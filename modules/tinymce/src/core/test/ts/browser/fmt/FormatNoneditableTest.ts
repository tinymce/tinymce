import { Cursors } from '@ephox/agar';
import { after, before, context, describe, it } from '@ephox/bedrock-client';
import { Arr, Fun, Type } from '@ephox/katamari';
import { TinyAssertions, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

interface Action {
  readonly select: (editor: Editor) => void;
  readonly expectedHtml: string;
  readonly pAssertBefore?: (editor: Editor) => Promise<void>;
  readonly pAssertAfter?: (editor: Editor) => Promise<void>;
  readonly selectionAfter?: Cursors.CursorPath;
}

interface FormatInfo {
  readonly label: string;
  readonly tag: string;
  readonly html: string;
  readonly toggle: (editor: Editor) => void;
  readonly useToolbar: boolean;
}

describe('browser.tinymce.core.fmt.FormatNoneditableTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    toolbar: 'forecolor backcolor | bold italic underline strikethrough | alignleft',
    base_url: '/project/tinymce/js/tinymce'
  }, [], true);

  const selectionPath = (startPath: number[], soffset: number, finishPath: number[], foffset: number): Cursors.CursorPath => ({
    startPath,
    soffset,
    finishPath,
    foffset
  });

  const toggleInlineStyle = (style: string) => (editor: Editor) => {
    TinyUiActions.clickOnToolbar(editor, `[aria-label="${style}"]`);
  };
  const toggleCustomFormat = (format: string, vars?: Record<string, any>) => (editor: Editor) => editor.formatter.toggle(format, vars);

  const selectAll = (editor: Editor) => editor.execCommand('SelectAll');

  const pAssertToolbarButtonState = (selector: string, active: boolean) => async (editor: Editor) => {
    await TinyUiActions.pWaitForUi(editor, `button[aria-label="${selector}"][aria-pressed="${active}"]`);
  };

  const pTestFormat = (format: (editor: Editor) => void) => async (editor: Editor, actions: Action[]) => {
    for (const action of actions) {
      const { select, expectedHtml, pAssertBefore, pAssertAfter, selectionAfter } = action;
      select(editor);
      if (Type.isNonNullable(pAssertBefore)) {
        await pAssertBefore(editor);
      }

      format(editor);

      TinyAssertions.assertContent(editor, expectedHtml);
      if (Type.isNonNullable(pAssertAfter)) {
        pAssertAfter(editor);
      }
      if (Type.isNonNullable(selectionAfter)) {
        TinyAssertions.assertSelection(
          editor,
          selectionAfter.startPath,
          selectionAfter.soffset,
          selectionAfter.finishPath,
          selectionAfter.foffset
        );
      }
    }
  };

  const boldFormat: FormatInfo = {
    label: 'Bold',
    tag: 'strong',
    html: 'strong',
    toggle: toggleInlineStyle('Bold'),
    useToolbar: true
  };

  const underlineFormat: FormatInfo = {
    label: 'Underline',
    tag: 'span',
    html: 'span style="text-decoration: underline;"',
    toggle: toggleInlineStyle('Underline'),
    useToolbar: true
  };

  const forecolorFormat: FormatInfo = {
    label: 'Text color',
    tag: 'span',
    html: 'span style="color: rgb(255, 0, 0);"',
    toggle: toggleCustomFormat('forecolor', { value: '#ff0000' }),
    useToolbar: false
  };

  context('noneditable inline elements', () => {
    before(() => {
      const editor = hook.editor();
      editor.options.set('format_noneditable_selector', 'span[data-wrappable="true"]');
    });

    after(() => {
      const editor = hook.editor();
      editor.options.unset('format_noneditable_selector');
    });

    const selectNoneditableSpan = (editor: Editor) =>
      TinySelections.select(editor, 'span[contenteditable="false"]', []);

    // Make sure different inline formats are tested
    Arr.each([ boldFormat, underlineFormat, forecolorFormat ], (format) => {
      const pAssertToolbar = (state: boolean) =>
        format.useToolbar ? pAssertToolbarButtonState(format.label, state) : () => Promise.resolve();
      const pTest = pTestFormat(format.toggle);

      context('wrappable noneditable', () => {
        Arr.each([
          {
            label: 'wrappable noneditable span',
            noneditableHtml: '<span contenteditable="false" data-wrappable="true">second</span>'
          },
          {
            label: 'wrappable noneditable span with inner format',
            noneditableHtml: `<span contenteditable="false" data-wrappable="true">s<${format.html}>eco</${format.tag}>nd</span>`
          },
        ], (scenario) => {
          const { label, noneditableHtml } = scenario;
          const initialHtml = `<p>first ${noneditableHtml} third</p>`;

          context(label, () => {
            it(`TINY-8842: select noneditable, toggle ${format.label}, select noneditable, toggle ${format.label}`, async () => {
              const editor = hook.editor();
              editor.setContent(initialHtml);
              await pTest(editor, [
                {
                  select: selectNoneditableSpan,
                  expectedHtml: `<p>first <${format.html}>${noneditableHtml}</${format.tag}> third</p>`,
                  pAssertAfter: pAssertToolbar(true)
                },
                {
                  select: selectNoneditableSpan,
                  expectedHtml: initialHtml,
                  pAssertAfter: pAssertToolbar(false)
                },
              ]);
            });

            it(`TINY-8935: select noneditable, toggle ${format.label}, keep selection, toggle ${format.label}`, async () => {
              const editor = hook.editor();
              editor.setContent(initialHtml);
              await pTest(editor, [
                {
                  select: selectNoneditableSpan,
                  expectedHtml: `<p>first <${format.html}>${noneditableHtml}</${format.tag}> third</p>`,
                  pAssertAfter: async () => {
                    await pAssertToolbar(true)(editor);
                    TinyAssertions.assertContentPresence(editor, { 'span[contenteditable="false"][data-mce-selected]': 1 });
                  },
                  selectionAfter: selectionPath([ 0, 1 ], 0, [ 0, 1 ], 1)
                },
                {
                  select: Fun.noop,
                  expectedHtml: initialHtml,
                  pAssertAfter: async () => {
                    await pAssertToolbar(false)(editor);
                    TinyAssertions.assertContentPresence(editor, { 'span[contenteditable="false"][data-mce-selected]': 1 });
                  },
                  selectionAfter: selectionPath([ 0 ], 1, [ 0 ], 2)
                },
              ]);
            });

            it(`TINY-8842: select noneditable, toggle ${format.label}, select all, toggle ${format.label}`, async () => {
              const editor = hook.editor();
              editor.setContent(initialHtml);
              await pTest(editor, [
                {
                  select: selectNoneditableSpan,
                  expectedHtml: `<p>first <${format.html}>${noneditableHtml}</${format.tag}> third</p>`,
                  pAssertAfter: pAssertToolbar(true)
                },
                {
                  select: selectAll,
                  expectedHtml: `<p><${format.html}>first ${noneditableHtml} third</${format.tag}></p>`,
                  pAssertAfter: pAssertToolbar(true)
                },
              ]);
            });

            it(`TINY-8842: select all, toggle ${format.label}, select noneditable, toggle ${format.label}`, async () => {
              const editor = hook.editor();
              editor.setContent(initialHtml);
              await pTest(editor, [
                {
                  select: selectAll,
                  expectedHtml: `<p><${format.html}>first ${noneditableHtml} third</${format.tag}></p>`,
                  pAssertAfter: pAssertToolbar(true)
                },
                {
                  select: selectNoneditableSpan,
                  expectedHtml: `<p><${format.html}>first </${format.tag}>${noneditableHtml}<${format.html}> third</${format.tag}></p>`,
                  pAssertAfter: pAssertToolbar(false)
                },
              ]);
            });

            it(`TINY-8842: select all, toggle ${format.label}, select all, toggle ${format.label}`, async () => {
              const editor = hook.editor();
              editor.setContent(initialHtml);
              await pTest(editor, [
                {
                  select: selectAll,
                  expectedHtml: `<p><${format.html}>first ${noneditableHtml} third</${format.tag}></p>`,
                  pAssertAfter: pAssertToolbar(true)
                },
                {
                  // format.toggle for forecolor does not work properly with selectAll so manually setting selection
                  select: () => TinySelections.setSelection(editor, [ 0 ], 0, [], 1),
                  expectedHtml: initialHtml,
                  pAssertAfter: pAssertToolbar(false)
                },
              ]);
            });

            it(`TINY-8842: select all, toggle ${format.label}, keep selection, toggle ${format.label}`, async () => {
              const editor = hook.editor();
              editor.setContent(initialHtml);
              await pTest(editor, [
                {
                  select: selectAll,
                  expectedHtml: `<p><${format.html}>first ${noneditableHtml} third</${format.tag}></p>`,
                  pAssertAfter: pAssertToolbar(true)
                },
                {
                  select: Fun.noop,
                  expectedHtml: initialHtml,
                  pAssertAfter: pAssertToolbar(false)
                },
              ]);
            });
          });
        });
      });

      context('non-wrappble noneditable', () => {
        Arr.each([
          {
            label: 'noneditable span',
            noneditableHtml: '<span contenteditable="false">second</span>'
          },
          {
            label: 'noneditable span with inner format',
            noneditableHtml: `<span contenteditable="false">s<${format.html}>eco</${format.tag}>nd</span>`
          },
        ], (scenario) => {
          const { label, noneditableHtml } = scenario;
          const initialHtml = `<p>first ${noneditableHtml} third</p>`;

          context(label, () => {
            it(`TINY-8842: select noneditable, toggle ${format.label}`, async () => {
              const editor = hook.editor();
              editor.setContent(initialHtml);
              await pTest(editor, [
                {
                  select: selectNoneditableSpan,
                  expectedHtml: initialHtml,
                  pAssertAfter: async () => {
                    await pAssertToolbar(false)(editor);
                    TinyAssertions.assertContentPresence(editor, { 'span[contenteditable="false"][data-mce-selected]': 1 });
                  },
                  selectionAfter: selectionPath([ 0 ], 1, [ 0 ], 2)
                },
              ]);
            });

            it(`TINY-8842: select all, toggle ${format.label}`, async () => {
              const editor = hook.editor();
              editor.setContent(initialHtml);
              await pTest(editor, [
                {
                  select: selectAll,
                  expectedHtml: [
                    `<p><${format.html}>first </${format.tag}>` +
                    noneditableHtml,
                    `<${format.html}> third</${format.tag}></p>`,
                  ].join(''),
                  pAssertAfter: pAssertToolbar(true)
                },
              ]);
            });
          });
        });
      });

      // A wrappable noneditable should act the same as non-wrappable noneditable
      context('noneditable with nested editable text', () => {
        Arr.each([
          {
            label: 'wrappable noneditable span',
            noneditableBeforeHtml: '<span contenteditable="false" data-mce-cef-wrappable="true">a',
            noneditableAfterHtml: 'b</span>'
          },
          {
            label: 'non-wrappable noneditable span',
            noneditableBeforeHtml: '<span contenteditable="false">a',
            noneditableAfterHtml: 'b</span>'
          },
        ], (scenario) => {
          const { label, noneditableBeforeHtml, noneditableAfterHtml } = scenario;
          const editableHtml = `<span contenteditable="true">editable</span>`;
          const noneditableHtml = `${noneditableBeforeHtml}${editableHtml}${noneditableAfterHtml}`;
          const initialHtml = `<p>first ${noneditableHtml} third</p>`;

          context(label, () => {
            it(`TINY-8842: select noneditable, toggle ${format.label}`, async () => {
              const editor = hook.editor();
              editor.setContent(initialHtml);
              await pTest(editor, [
                {
                  select: selectNoneditableSpan,
                  expectedHtml: initialHtml,
                  pAssertAfter: async () => {
                    await pAssertToolbar(false)(editor);
                    TinyAssertions.assertContentPresence(editor, { 'span[contenteditable="false"][data-mce-selected]': 1 });
                  },
                  selectionAfter: selectionPath([ 0 ], 1, [ 0 ], 2)
                },
              ]);
            });

            it(`TINY-8842: select all, toggle ${format.label}, collapsed in editable, toggle ${format.label}`, async () => {
              const editor = hook.editor();
              editor.setContent(initialHtml);
              await pTest(editor, [
                {
                  select: selectAll,
                  expectedHtml: `<p><${format.html}>first </${format.tag}>${noneditableBeforeHtml}<span contenteditable="true"><${format.html}>editable</${format.tag}></span>${noneditableAfterHtml}<${format.html}> third</${format.tag}></p>`,
                  pAssertAfter: pAssertToolbar(true)
                },
                {
                  select: () => TinySelections.setCursor(editor, [ 0, 1, 1, 0, 0 ], 1),
                  expectedHtml: `<p><${format.html}>first</${format.tag}> ${noneditableBeforeHtml}<span contenteditable="true">editable</span>${noneditableAfterHtml} <${format.html}>third</${format.tag}></p>`,
                  pAssertAfter: pAssertToolbar(false)
                },
              ]);
            });

            it(`TINY-8842: collapsed in editable, toggle ${format.label}, collapsed in editable, toggle ${format.label}`, async () => {
              const editor = hook.editor();
              editor.setContent(initialHtml);
              await pTest(editor, [
                {
                  select: () => TinySelections.setCursor(editor, [ 0, 1, 1, 0 ], 1),
                  expectedHtml: `<p>first ${noneditableBeforeHtml}<span contenteditable="true"><${format.html}>editable</${format.tag}></span>${noneditableAfterHtml} third</p>`,
                  pAssertAfter: pAssertToolbar(true)
                },
                {
                  select: () => TinySelections.setCursor(editor, [ 0, 1, 1, 0, 0 ], 1),
                  expectedHtml: initialHtml,
                  pAssertAfter: pAssertToolbar(false)
                },
              ]);
            });

            it(`TINY-8842: collapsed selection in editable, toggle ${format.label}, select noneditable, toggle ${format.label}`, async () => {
              const editor = hook.editor();
              editor.setContent(initialHtml);
              await pTest(editor, [
                {
                  select: () => TinySelections.setCursor(editor, [ 0, 1, 1, 0 ], 1),
                  expectedHtml: `<p>first ${noneditableBeforeHtml}<span contenteditable="true"><${format.html}>editable</${format.tag}></span>${noneditableAfterHtml} third</p>`,
                  pAssertAfter: pAssertToolbar(true)
                },
                {
                  select: selectNoneditableSpan,
                  // Should remain the same
                  expectedHtml: `<p>first ${noneditableBeforeHtml}<span contenteditable="true"><${format.html}>editable</${format.tag}></span>${noneditableAfterHtml} third</p>`,
                  pAssertAfter: pAssertToolbar(false)
                },
              ]);
            });

            it(`TINY-8842: ranged selection in editable, toggle ${format.label}, select all in editable, toggle ${format.label}`, async () => {
              const editor = hook.editor();
              editor.setContent(initialHtml);
              await pTest(editor, [
                {
                  select: () => TinySelections.setSelection(editor, [ 0, 1, 1, 0 ], 1, [ 0, 1, 1, 0 ], 3),
                  expectedHtml: `<p>first ${noneditableBeforeHtml}<span contenteditable="true">e<${format.html}>di</${format.tag}>table</span>${noneditableAfterHtml} third</p>`,
                  pAssertAfter: pAssertToolbar(true)
                },
                {
                  select: selectAll,
                  expectedHtml: `<p>first ${noneditableBeforeHtml}<span contenteditable="true"><${format.html}>editable</${format.tag}></span>${noneditableAfterHtml} third</p>`,
                  pAssertAfter: pAssertToolbar(true)
                },
              ]);
            });
          });
        });
      });
    });

    context(`matching noneditable element and format tag`, () => {
      Arr.each([
        {
          format: boldFormat,
          noneditableHtml: `<${boldFormat.html} contenteditable="false" data-mce-cef-wrappable="true">s<${boldFormat.html}>econ</${boldFormat.tag}>d</${boldFormat.tag}>`
        },
        {
          format: underlineFormat,
          noneditableHtml: `<${underlineFormat.html} contenteditable="false" data-mce-cef-wrappable="true">s<${underlineFormat.html}>econ</${underlineFormat.tag}>d</${underlineFormat.tag}>`
        },
        {
          format: forecolorFormat,
          noneditableHtml: `<${forecolorFormat.html} contenteditable="false" data-mce-cef-wrappable="true">s<${forecolorFormat.html}>econ</${forecolorFormat.tag}>d</${forecolorFormat.tag}>`
        }
      ], (scenario) => {
        const { noneditableHtml, format } = scenario;

        const initialHtml = `<p>first ${noneditableHtml} third</p>`;
        const selectCEF = (editor: Editor) => TinySelections.select(editor, `${format.tag}[contenteditable="false"]`, []);
        const pAssertToolbar = (state: boolean) =>
          format.useToolbar ? pAssertToolbarButtonState(format.label, state) : () => Promise.resolve();
        const pTest = pTestFormat(format.toggle);

        it(`TINY-8842: select noneditable, toggle ${format.label}`, async () => {
          const editor = hook.editor();
          editor.setContent(initialHtml);
          await pTest(editor, [
            {
              select: selectCEF,
              expectedHtml: initialHtml,
              pAssertAfter: pAssertToolbar(true)
            },
          ]);
        });

        it(`TINY-8842: select all, toggle ${format.label}, select noneditable, toggle ${format.label}`, async () => {
          const editor = hook.editor();
          editor.setContent(initialHtml);
          await pTest(editor, [
            {
              select: selectAll,
              expectedHtml: `<p><${format.html}>first ${noneditableHtml} third</${format.tag}></p>`,
              pAssertAfter: pAssertToolbar(true)
            },
            {
              select: selectCEF,
              expectedHtml: `<p><${format.html}>first </${format.tag}>${noneditableHtml}<${format.html}> third</${format.tag}></p>`,
              pAssertAfter: pAssertToolbar(true)
            },
          ]);
        });
      });
    });

    context('toggling block formats', () => {
      it('TINY-8842: wrappable noneditable inline element should not affect toggling block format', async () => {
        const editor = hook.editor();
        const initialHtml = `<p>first <span contenteditable="false" data-mce-cef-wrappable="true">second</span> third</p>`;
        editor.setContent(initialHtml);
        await pTestFormat(toggleCustomFormat('h1'))(editor, [
          {
            select: selectNoneditableSpan,
            expectedHtml: `<h1>first <span contenteditable="false" data-mce-cef-wrappable="true">second</span> third</h1>`
          },
          {
            select: selectNoneditableSpan,
            expectedHtml: initialHtml
          },
          {
            select: () => TinySelections.setSelection(editor, [ 0, 0 ], 2, [ 0, 2 ], 4),
            expectedHtml: `<h1>first <span contenteditable="false" data-mce-cef-wrappable="true">second</span> third</h1>`
          },
        ]);
      });

      it('TINY-8842: wrappable noneditable inline element should not affect toggling wrapper block format', async () => {
        const editor = hook.editor();
        const initialHtml = `<p>first <span contenteditable="false" data-mce-cef-wrappable="true">second</span> third</p>`;
        editor.setContent(initialHtml);
        await pTestFormat(toggleCustomFormat('blockquote'))(editor, [
          {
            select: selectNoneditableSpan,
            expectedHtml: [
              '<blockquote>',
              initialHtml,
              '</blockquote>'
            ].join('\n')
          },
          {
            select: selectNoneditableSpan,
            expectedHtml: initialHtml
          },
          {
            select: () => TinySelections.setSelection(editor, [ 0, 0 ], 2, [ 0, 2 ], 4),
            expectedHtml: [
              '<blockquote>',
              initialHtml,
              '</blockquote>'
            ].join('\n')
          },
        ]);
      });
    });
  });

  context('noneditable blocks', () => {
    before(() => {
      const editor = hook.editor();
      editor.options.set('format_noneditable_selector', 'p[data-wrappable="true"]');
    });

    after(() => {
      const editor = hook.editor();
      editor.options.unset('format_noneditable_selector');
    });

    const toggleBlockquote = toggleCustomFormat('blockquote');
    const pTest = pTestFormat(toggleBlockquote);
    const selectCEF = (editor: Editor) => TinySelections.select(editor, 'p[contenteditable="false"]', []);

    it('TINY-8842: select noneditable, toggle wrapper format, select noneditable, toggle wrapper format', async () => {
      const editor = hook.editor();
      editor.setContent(`<p>before</p><p contenteditable="false" data-wrappable="true">noneditable</p><p>after</p>`);
      await pTest(editor, [
        {
          select: selectCEF,
          expectedHtml: [
            '<p>before</p>',
            '<blockquote>',
            '<p contenteditable="false" data-wrappable="true">noneditable</p>',
            '</blockquote>',
            '<p>after</p>'
          ].join('\n')
        },
        {
          select: selectCEF,
          expectedHtml: [
            '<p>before</p>',
            '<p contenteditable="false" data-wrappable="true">noneditable</p>',
            '<p>after</p>'
          ].join('\n')
        },
      ]);
    });

    it('TINY-8842: select all, toggle wrapper format, select all, toggle wrapper format', async () => {
      const editor = hook.editor();
      editor.setContent(`<p>before</p><p contenteditable="false" data-mce-cef-wrappable="true">noneditable</p><p>after</p>`);
      await pTest(editor, [
        {
          select: selectAll,
          expectedHtml: [
            '<blockquote>',
            '<p>before</p>',
            '<p contenteditable="false" data-mce-cef-wrappable="true">noneditable</p>',
            '<p>after</p>',
            '</blockquote>'
          ].join('\n')
        },
        {
          select: selectAll,
          expectedHtml: [
            '<p>before</p>',
            '<p contenteditable="false" data-mce-cef-wrappable="true">noneditable</p>',
            '<p>after</p>'
          ].join('\n')
        },
      ]);
    });

    it('TINY-8842: select all, toggle wrapper format, select noneditable, toggle wrapper format', async () => {
      const editor = hook.editor();
      editor.setContent(`<p>before</p><p contenteditable="false" data-mce-cef-wrappable="true">noneditable</p><p>after</p>`);
      await pTest(editor, [
        {
          select: selectAll,
          expectedHtml: [
            '<blockquote>',
            '<p>before</p>',
            '<p contenteditable="false" data-mce-cef-wrappable="true">noneditable</p>',
            '<p>after</p>',
            '</blockquote>'
          ].join('\n')
        },
        {
          select: selectCEF,
          expectedHtml: [
            '<blockquote>',
            '<p>before</p>',
            '</blockquote>',
            '<p contenteditable="false" data-mce-cef-wrappable="true">noneditable</p>',
            '<blockquote>',
            '<p>after</p>',
            '</blockquote>'
          ].join('\n')
        },
      ]);
    });

    it('TINY-8842: select noneditable, toggle wrapper format, select all, toggle wrapper format', async () => {
      const editor = hook.editor();
      editor.setContent(`<p>before</p><p contenteditable="false" data-mce-cef-wrappable="true">noneditable</p><p>after</p>`);
      await pTest(editor, [
        {
          select: selectCEF,
          expectedHtml: [
            '<p>before</p>',
            '<blockquote>',
            '<p contenteditable="false" data-mce-cef-wrappable="true">noneditable</p>',
            '</blockquote>',
            '<p>after</p>',
          ].join('\n')
        },
        {
          select: selectAll,
          expectedHtml: [
            '<blockquote>',
            '<p>before</p>',
            '<p contenteditable="false" data-mce-cef-wrappable="true">noneditable</p>',
            '<p>after</p>',
            '</blockquote>'
          ].join('\n')
        },
      ]);
    });

    it('TINY-8842: toggle wrapper format on editable blocks, select noneditable, toggle wrapper format', async () => {
      const editor = hook.editor();
      editor.setContent(`<p>before</p><p contenteditable="false" data-mce-cef-wrappable="true">noneditable</p><p>after</p>`);
      await pTest(editor, [
        {
          select: () => TinySelections.setCursor(editor, [ 0, 0 ], 1),
          expectedHtml: [
            '<blockquote>',
            '<p>before</p>',
            '</blockquote>',
            '<p contenteditable="false" data-mce-cef-wrappable="true">noneditable</p>',
            '<p>after</p>',
          ].join('\n')
        },
        {
          select: () => TinySelections.setCursor(editor, [ 2, 0 ], 1),
          expectedHtml: [
            '<blockquote>',
            '<p>before</p>',
            '</blockquote>',
            '<p contenteditable="false" data-mce-cef-wrappable="true">noneditable</p>',
            '<blockquote>',
            '<p>after</p>',
            '</blockquote>'
          ].join('\n')
        },
        {
          select: selectCEF,
          expectedHtml: [
            '<blockquote>',
            '<p>before</p>',
            '<p contenteditable="false" data-mce-cef-wrappable="true">noneditable</p>',
            '<p>after</p>',
            '</blockquote>'
          ].join('\n')
        },
      ]);
    });

    it('TINY-8842: should not be able to change noneditable block tag with block format', async () => {
      const editor = hook.editor();
      editor.setContent(`<p>before</p><p contenteditable="false" data-mce-cef-wrappable="true">noneditable</p><p>after</p>`);
      await pTestFormat(toggleCustomFormat('h1'))(editor, [
        {
          select: selectCEF,
          expectedHtml: [
            '<p>before</p>',
            '<p contenteditable="false" data-mce-cef-wrappable="true">noneditable</p>',
            '<p>after</p>'
          ].join('\n')
        },
        {
          select: selectAll,
          expectedHtml: [
            '<h1>before</h1>',
            '<p contenteditable="false" data-mce-cef-wrappable="true">noneditable</p>',
            '<h1>after</h1>'
          ].join('\n')
        },
      ]);
    });

    it('TINY-8842: should not be able to wrap noneditable block without a wrappable attribute', async () => {
      const editor = hook.editor();
      editor.setContent(`<p>before</p><p contenteditable="false">noneditable</p><p>after</p>`);
      await pTest(editor, [
        {
          select: selectCEF,
          expectedHtml: [
            '<p>before</p>',
            '<p contenteditable="false">noneditable</p>',
            '<p>after</p>'
          ].join('\n')
        },
        {
          select: selectAll,
          expectedHtml: [
            '<blockquote>',
            '<p>before</p>',
            '</blockquote>',
            '<p contenteditable="false">noneditable</p>',
            '<blockquote>',
            '<p>after</p>',
            '</blockquote>'
          ].join('\n')
        },
        {
          select: selectCEF,
          expectedHtml: [
            '<blockquote>',
            '<p>before</p>',
            '</blockquote>',
            '<p contenteditable="false">noneditable</p>',
            '<blockquote>',
            '<p>after</p>',
            '</blockquote>'
          ].join('\n')
        },
        {
          select: selectAll,
          expectedHtml: [
            '<p>before</p>',
            '<p contenteditable="false">noneditable</p>',
            '<p>after</p>',
          ].join('\n')
        },
      ]);
    });

    context('noneditable inline elements with selector formats', () => {
      // TODO: TINY-9142 Reenable when Jira is done
      it.skip('TINY-8687: should apply selector format to matching parent block when a noneditable inline element is selected', () => {
        const editor = hook.editor();
        editor.setContent(`<p>a<span contenteditable="false">CEF</span>b</p>`);
        TinySelections.select(editor, 'span', []);
        editor.formatter.apply('alignright');
        TinyAssertions.assertContent(editor, `<p style="text-align: right;">a<span contenteditable="false">CEF</span>b</p>`);
      });

      it('TINY-8687: should apply selector format to matching parent block when selection is within a nested noneditable inline element', () => {
        const editor = hook.editor();
        editor.setContent(`<p>a<span contenteditable="false">C<span contenteditable="true">E</span>F</span>b</p>`);
        TinySelections.select(editor, 'span', []);
        TinySelections.setCursor(editor, [ 0, 1, 1, 0 ], 0);
        editor.formatter.apply('alignright');
        TinyAssertions.assertContent(editor, `<p style="text-align: right;">a<span contenteditable="false">C<span contenteditable="true">E</span>F</span>b</p>`);
        TinyAssertions.assertCursor(editor, [ 0, 1, 1, 0 ], 0);
      });
    });
  });
});
