import { ApproxStructure, Assertions, FocusTools, Keyboard, Keys, Mouse, type StructAssert, UiFinder, Waiter } from '@ephox/agar';
import { afterEach, Assert, before, context, describe, it } from '@ephox/bedrock-client';
import { Arr, Type } from '@ephox/katamari';
import { Attribute, SugarBody, SugarDocument, type SugarElement } from '@ephox/sugar';
import { McEditor, TinyContentActions, TinyDom, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import type Editor from 'tinymce/core/api/Editor';
import type { RawEditorOptions } from 'tinymce/core/api/OptionTypes';
import I18n from 'tinymce/core/api/util/I18n';
import WordcountPlugin from 'tinymce/plugins/wordcount/Plugin';

import * as TooltipUtils from '../../module/TooltipUtils';

interface ElementPathTranslationScenario {
  readonly label: string;
  readonly expectedString: (elementName: string) => string;
  readonly setup: () => void;
}

interface ElementPathTagScenario {
  readonly content: string;
  readonly expectedTag: string;
  readonly cursor?: [number, number];
  readonly selection?: [number[], number, number[], number];
}

describe('browser.tinymce.themes.silver.statusbar.StatusbarTest', () => {
  context('Statusbar structure', () => {
    before(() => {
      WordcountPlugin(5);
    });

    const elementPathSpec: ApproxStructure.Builder<StructAssert> = (s, str, arr) =>
      s.element('div', {
        classes: [ arr.has('tox-statusbar__path') ],
        children: [
          s.element('div', { children: [ s.text(str.is('p')) ], attrs: { 'aria-level': str.none() }}),
          s.element('div', { children: [ s.text(str.is(' › ')) ] }),
          s.element('div', { children: [ s.text(str.is('strong')) ], attrs: { 'aria-level': str.none() }}),
          s.element('div', { children: [ s.text(str.is(' › ')) ] }),
          s.element('div', { children: [ s.text(str.is('em')) ], attrs: { 'aria-level': str.none() }})
        ]
      });

    const brandingSpec: ApproxStructure.Builder<StructAssert> = (s, str, arr) =>
      s.element('span', {
        classes: [ arr.has('tox-statusbar__branding') ],
        children: [
          s.element('a', {
            attrs: {
              'aria-label': str.is('Build with TinyMCE')
            },
            children: [
              s.text(str.is('Build with ')),
              s.element('svg', {})
            ]
          })
        ]
      });

    const helpTextSpec: ApproxStructure.Builder<StructAssert> = (s, _, arr) =>
      s.element('div', {
        classes: [ arr.has('tox-statusbar__help-text') ]
      });

    const rightContainerSpec: ApproxStructure.Builder<StructAssert> = (s, str, arr) =>
      s.element('div', {
        classes: [ arr.has('tox-statusbar__right-container') ],
        children: [
          s.element('button', {
            classes: [ arr.has('tox-statusbar__wordcount') ],
            children: [ s.text(str.is('2 words')) ]
          }),
          brandingSpec(s, str, arr)
        ]
      });

    const fullStatusbarSpec: ApproxStructure.Builder<StructAssert[]> = (s, str, arr) => [
      s.element('div', {
        classes: [ arr.has('tox-statusbar__text-container') ],
        children: [
          elementPathSpec(s, str, arr),
          helpTextSpec(s, str, arr),
          rightContainerSpec(s, str, arr)
        ]
      }),
      s.element('div', {
        classes: [ arr.has('tox-statusbar__resize-handle') ]
      })
    ];

    const statusbarWithoutWordcountSpec: ApproxStructure.Builder<StructAssert[]> = (s, str, arr) => [
      s.element('div', {
        classes: [ arr.has('tox-statusbar__text-container') ],
        children: [
          elementPathSpec(s, str, arr),
          s.element('div', {
            classes: [ arr.has('tox-statusbar__right-container') ],
            children: [ brandingSpec(s, str, arr) ]
          })
        ]
      }),
      s.element('div', {
        classes: [ arr.has('tox-statusbar__resize-handle') ]
      })
    ];

    const statusbarWithoutResizeSpec: ApproxStructure.Builder<StructAssert[]> = (s, str, arr) => [
      s.element('div', {
        classes: [ arr.has('tox-statusbar__text-container') ],
        children: [
          elementPathSpec(s, str, arr),
          s.element('div', {
            classes: [ arr.has('tox-statusbar__right-container') ],
            children: [ brandingSpec(s, str, arr) ]
          })
        ]
      })
    ];

    const statusbarResizeHandleLabelSpec = (label: string): ApproxStructure.Builder<StructAssert> =>
      (s, str, arr) => s.element('div', {
        classes: [ arr.has('tox-tinymce') ],
        children: [
          s.anything(),
          s.anything(),
          s.element('div', {
            classes: [ arr.has('tox-statusbar') ],
            children: [
              s.anything(),
              s.element('div', {
                classes: [ arr.has('tox-statusbar__resize-handle') ],
                attrs: {
                  'aria-label': str.is(label)
                }
              })
            ]
          }),
          s.theRest()
        ]
      });

    const makeTest = (config: RawEditorOptions, structureLabel: string, editorStructure: StructAssert) => async () => {
      const editor = await McEditor.pFromSettings<Editor>({
        base_url: '/project/tinymce/js/tinymce',
        ...config
      });
      editor.focus();
      editor.setContent('<p><strong><em>hello world</em></strong></p>');
      await Waiter.pTryUntil('Wait for editor structure', () => Assertions.assertStructure(structureLabel, editorStructure, TinyDom.container(editor)));
      McEditor.remove(editor);
    };

    it('TBA: Full statusbar', makeTest(
      { plugins: 'wordcount help' },
      'Full statusbar structure',
      ApproxStructure.build((s, str, arr) => s.element('div', {
        classes: [ arr.has('tox-tinymce') ],
        children: [
          s.anything(),
          s.anything(),
          s.element('div', {
            classes: [ arr.has('tox-statusbar') ],
            children: fullStatusbarSpec(s, str, arr)
          }),
          s.theRest()
        ]
      }))
    ));

    it('TBA: Statusbar without wordcount', makeTest(
      { },
      'Statusbar structure without wordcount',
      ApproxStructure.build((s, str, arr) => s.element('div', {
        classes: [ arr.has('tox-tinymce') ],
        children: [
          s.anything(),
          s.anything(),
          s.element('div', {
            classes: [ arr.has('tox-statusbar') ],
            children: statusbarWithoutWordcountSpec(s, str, arr)
          }),
          s.theRest()
        ]
      }))
    ));

    it('TINY-9379: Full statusbar with help_accessibility option set to false', makeTest(
      { plugins: 'wordcount help', help_accessibility: false },
      'Full statusbar structure',
      ApproxStructure.build((s, str, arr) => s.element('div', {
        classes: [ arr.has('tox-tinymce') ],
        children: [
          s.anything(),
          s.anything(),
          s.element('div', {
            classes: [ arr.has('tox-statusbar') ],
            children: [
              s.element('div', {
                classes: [ arr.has('tox-statusbar__text-container') ],
                children: [
                  elementPathSpec(s, str, arr),
                  rightContainerSpec(s, str, arr)
                ]
              }),
              s.element('div', {
                classes: [ arr.has('tox-statusbar__resize-handle') ]
              })
            ]
          }),
          s.theRest()
        ]
      }))
    ));

    it('TBA: Statusbar without resize', makeTest(
      { resize: false },
      'Statusbar structure without resize',
      ApproxStructure.build((s, str, arr) => s.element('div', {
        classes: [ arr.has('tox-tinymce') ],
        children: [
          s.anything(),
          s.anything(),
          s.element('div', {
            classes: [ arr.has('tox-statusbar') ],
            children: statusbarWithoutResizeSpec(s, str, arr)
          }),
          s.theRest()
        ]
      }))
    ));

    it('TBA: Remove statusbar', makeTest(
      { statusbar: false },
      'Editor without statusbar',
      ApproxStructure.build((s, str, arr) => s.element('div', {
        classes: [ arr.has('tox-tinymce') ],
        children: [
          s.element('div', {
            classes: [ arr.has('tox-editor-container') ]
          }),
          s.element('div', {
            classes: [ arr.has('tox-view-wrap') ]
          }),
          s.element('div', {
            classes: [ arr.has('tox-throbber') ]
          })
        ]
      }))
    ));

    it('TBA: Full statusbar - check element path on content change', async () => {
      const editor = await McEditor.pFromSettings<Editor>({
        base_url: '/project/tinymce/js/tinymce',
        toolbar: 'bold',
        resize: false,
        branding: false
      });
      editor.focus();
      editor.setContent('<p><strong>hello world</strong></p>');
      const editorContainer = TinyDom.container(editor);

      await Waiter.pTryUntil('', () => Assertions.assertStructure(
        'Check p>strong element path',
        ApproxStructure.build((s, str, arr) => s.element('div', {
          classes: [ arr.has('tox-tinymce') ],
          children: [
            s.anything(),
            s.anything(),
            s.element('div', {
              classes: [ arr.has('tox-statusbar') ],
              children: [
                s.element('div', {
                  classes: [ arr.has('tox-statusbar__text-container') ],
                  children: [
                    s.element('div', {
                      classes: [ arr.has('tox-statusbar__path') ],
                      children: [
                        s.element('div', { children: [ s.text(str.is('p')) ] }),
                        s.element('div', { children: [ s.text(str.is(' › ')) ] }),
                        s.element('div', { children: [ s.text(str.is('strong')) ] })
                      ]
                    })
                  ]
                })
              ]
            }),
            s.theRest()
          ]
        })),
        editorContainer
      ));

      const button = UiFinder.findIn<HTMLButtonElement>(editorContainer, 'button[aria-label="Bold"]').getOrDie();
      Mouse.trueClick(button);
      await Waiter.pTryUntil('', () => Assertions.assertStructure(
        'Check p element path',
        ApproxStructure.build((s, str, arr) => s.element('div', {
          classes: [ arr.has('tox-tinymce') ],
          children: [
            s.anything(),
            s.anything(),
            s.element('div', {
              classes: [ arr.has('tox-statusbar') ],
              children: [
                s.element('div', {
                  classes: [ arr.has('tox-statusbar__text-container') ],
                  children: [
                    s.element('div', {
                      classes: [ arr.has('tox-statusbar__path') ],
                      children: [
                        s.element('div', { children: [ s.text(str.is('p')) ] })
                      ]
                    })
                  ]
                })
              ]
            }),
            s.theRest()
          ]
        })),
        editorContainer
      ));

      McEditor.remove(editor);
    });

    it('TINY-9793: Resize handle has correct announcement when true', makeTest(
      { resize: true },
      'Resize vertical only',
      ApproxStructure.build(statusbarResizeHandleLabelSpec(
        'Press the Up and Down arrow keys to resize the editor.'
      ))
    ));

    it('TINY-9793: Resize handle has correct announcement when both', makeTest(
      { resize: 'both' },
      'Resize both',
      ApproxStructure.build(statusbarResizeHandleLabelSpec(
        'Press the arrow keys to resize the editor.'
      ))
    ));
  });

  context('Element path tooltips', () => {
    const pMouseOverPathItem = async (name: string, first: boolean) => {
      const elm = UiFinder.findIn(SugarDocument.getDocument(), `.tox-statusbar__path-item:contains(${name})`).getOrDie();
      // Wait for a tick so event wiring/state is ready before synthetic mouseover
      await Waiter.pWait(0);
      Mouse.mouseOver(elm);
      // Wait past initial tooltip show delay
      const firstWait = first ? 350 : 0;
      await Waiter.pWait(firstWait);
    };

    const pFocusElementPath = async (editor: Editor, doc: SugarElement<Document>) => {
      TinyContentActions.keystroke(editor, 122, { alt: true });
      await FocusTools.pTryOnSelector( 'Assert element path is focused', doc, 'div[role=navigation] .tox-statusbar__path-item');
      // Wait so focus/tooltip handlers run after key action
      await Waiter.pWait(0);
    };

    const pArrowFromFocused = async (doc: SugarElement<Document>, dir: 'left' | 'right', expectFocusedContains?: string) => {
      const activeElm = FocusTools.getFocused(doc).getOrDie();
      Keyboard.keydown(dir === 'right' ? Keys.right() : Keys.left(), {}, activeElm);
      // Wait so arrow key handler can update focus/tooltip
      await Waiter.pWait(0);
      if (Type.isString(expectFocusedContains)) {
        await FocusTools.pTryOnSelector( 'Assert element path is focused', doc, `.tox-statusbar__path-item:contains(${expectFocusedContains})`);
      }
    };

    Arr.each([
      { label: 'no translations', expectedString: (elementName: string) => `Select the ${elementName} element`, setup: () => I18n.setCode('en') },
      { label: 'translations', expectedString: (elementName: string) => `Zort the ${elementName} frum`,
        setup: () => {
          I18n.add('test', { 'Select the {0} element': 'Zort the {0} frum' });
          I18n.setCode('test');
        }
      }], (scenario: ElementPathTranslationScenario) => {

      const doc = SugarDocument.getDocument();

      context(scenario.label, () => {
        const hook = TinyHooks.bddSetup<Editor>({
          base_url: '/project/tinymce/js/tinymce'
        });

        before(() => scenario.setup());
        afterEach(() => {
          const activeElm = FocusTools.getFocused(doc).getOrDie();
          Keyboard.keydown(Keys.escape(), {}, activeElm);
        });

        it(`TINY-10891: Should show only single tooltip when navigating between element path with keyboard`, async () => {
          const editor = hook.editor();
          editor.focus();
          editor.setContent(`
          <table style="border-collapse: collapse; width: 100%;" border="1"><colgroup><col style="width: 24.9816%;"><col style="width: 24.9816%;"><col style="width: 24.9816%;"><col style="width: 24.9816%;"></colgroup>
            <tbody>
            <tr>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
            </tr>
            </tbody>
            </table>
          `);
          const buttonSelector = '.tox-statusbar__path-item:contains(td)';
          TinySelections.setCursor(editor, [ 0, 1, 0, 0 ], 0);

          await TooltipUtils.pAssertTooltip(editor, async () => {
            await pFocusElementPath(editor, doc);
            await pArrowFromFocused(doc, 'right', 'tbody');
            return Promise.resolve();
          }, scenario.expectedString('tbody'));

          await TooltipUtils.pAssertTooltip(editor, async () => {
            await pArrowFromFocused(doc, 'right', 'tr');
            return Promise.resolve();
          }, scenario.expectedString('tr'));

          await TooltipUtils.pAssertTooltip(editor, async () => {
            await pArrowFromFocused(doc, 'right', 'td');
            return Promise.resolve();
          }, scenario.expectedString('td'));

          await TooltipUtils.pAssertTooltip(editor, async () => {
            await pArrowFromFocused(doc, 'left', 'tr');
            return Promise.resolve();
          }, scenario.expectedString('tr'));

          await TooltipUtils.pAssertTooltip(editor, async () => {
            await pArrowFromFocused(doc, 'left', 'tbody');
            return Promise.resolve();
          }, scenario.expectedString('tbody'));

          await TooltipUtils.pAssertTooltip(editor, async () => {
            await pArrowFromFocused(doc, 'left', 'table');
            return Promise.resolve();
          }, scenario.expectedString('table'));

          await TooltipUtils.pCloseTooltip(editor, buttonSelector);
        });

        it(`TINY-10891: Should have correct aria-describedby id when tooltip is shown`, async () => {
          const editor = hook.editor();
          editor.focus();
          editor.setContent(`
          <table style="border-collapse: collapse; width: 100%;" border="1"><colgroup><col style="width: 24.9816%;"><col style="width: 24.9816%;"><col style="width: 24.9816%;"><col style="width: 24.9816%;"></colgroup>
            <tbody>
            <tr>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
            </tr>
            </tbody>
            </table>
          `);
          TinySelections.setCursor(editor, [ 0, 1, 0, 0 ], 0);

          await TooltipUtils.pAssertTooltip(editor, async () => {
            await pFocusElementPath(editor, doc);
            await pArrowFromFocused(doc, 'right', 'tbody');
            return Promise.resolve();
          }, scenario.expectedString('tbody'));

          const tooltip = UiFinder.findIn<HTMLElement>(SugarDocument.getDocument(), '.tox-silver-sink .tox-tooltip').getOrDie();
          const elementPath = UiFinder.findIn<HTMLElement>(SugarDocument.getDocument(), `.tox-statusbar__path-item:contains(tbody)`).getOrDie();

          Assert.eq('Element path aria-describedby matches the tooltip id', Attribute.get(tooltip, 'id'), Attribute.get(elementPath, 'aria-describedby'));

          await TooltipUtils.pAssertTooltip(editor, async () => {
            await pArrowFromFocused(doc, 'right', 'tr');
            return Promise.resolve();
          }, scenario.expectedString('tr'));

          const tooltip2 = UiFinder.findIn<HTMLElement>(SugarDocument.getDocument(), '.tox-silver-sink .tox-tooltip').getOrDie();
          const tbodyElementPath = UiFinder.findIn<HTMLElement>(SugarDocument.getDocument(), '.tox-statusbar__path-item:contains(tbody)').getOrDie();
          const trElementPath = UiFinder.findIn<HTMLElement>(SugarDocument.getDocument(), '.tox-statusbar__path-item:contains(tr)').getOrDie();

          Assert.eq('Element path aria-describedby matches the tooltip id 2', Attribute.get(tooltip2, 'id'), Attribute.get(trElementPath, 'aria-describedby'));
          Assert.eq('Element path should not contain aria-describedby attribute after tooltip is removed ', undefined, Attribute.get(tbodyElementPath, 'aria-describedby'));

          const activeElm = FocusTools.getFocused(doc).getOrDie();
          Keyboard.keydown(Keys.escape(), {}, activeElm);
        });

        it(`TINY-10891: Should show only single tooltip when navigating between element path with mouse`, async () => {
          const editor = hook.editor();
          editor.focus();
          editor.setContent(`
          <table style="border-collapse: collapse; width: 100%;" border="1"><colgroup><col style="width: 24.9816%;"><col style="width: 24.9816%;"><col style="width: 24.9816%;"><col style="width: 24.9816%;"></colgroup>
            <tbody>
            <tr>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
            </tr>
            </tbody>
            </table>
          `);
          TinySelections.setCursor(editor, [ 0, 1, 0, 0 ], 0);

          await TooltipUtils.pAssertTooltip(editor, async () => {
            await pMouseOverPathItem('tbody', true);
            await UiFinder.pWaitFor('Waiting for label to be changed', SugarBody.body(), `.tox-silver-sink .tox-tooltip__body:contains(${scenario.expectedString('tbody')})`);
            return Promise.resolve();
          }, scenario.expectedString('tbody'));

          await TooltipUtils.pAssertTooltip(editor, async () => {
            await pMouseOverPathItem('table', false);
            await UiFinder.pWaitFor('Waiting for label to be changed', SugarBody.body(), `.tox-silver-sink .tox-tooltip__body:contains(${scenario.expectedString('table')})`);
            return Promise.resolve();
          }, scenario.expectedString('table'));

          await TooltipUtils.pAssertTooltip(editor, async () => {
            await pMouseOverPathItem('tr', false);
            await UiFinder.pWaitFor('Waiting for label to be changed', SugarBody.body(), `.tox-silver-sink .tox-tooltip__body:contains(${scenario.expectedString('tr')})`);
            return Promise.resolve();
          }, scenario.expectedString('tr'));

          await TooltipUtils.pAssertTooltip(editor, async () => {
            await pMouseOverPathItem('td', false);
            await UiFinder.pWaitFor('Waiting for label to be changed', SugarBody.body(), `.tox-silver-sink .tox-tooltip__body:contains(${scenario.expectedString('td')})`);
            return Promise.resolve();
          }, scenario.expectedString('td'));
        });

        Arr.each([
          { content: '<p><strong>Test</strong></p>', cursor: [ 0, 0 ], expectedTag: 'strong' },
          { content: '<p><img src="test"/></p>', selection: [[ 0 ], 0, [ 0 ], 1 ], expectedTag: 'img' },
          { content: '<ul><li>Test</li></ul>', cursor: [ 0, 0 ], expectedTag: 'li' },
          { content: '<p><span style="text-decoration: underline;">test</span></p>', cursor: [ 0, 0 ], expectedTag: 'span' },
          { content: '<p><a href="https://google.com">https://google.com</a></p>', cursor: [ 0, 0 ], expectedTag: 'a' },
          { content: '<p><iframe src="https://www.youtube.com/embed/b3XFjWInBog" width="560" height="314" allowfullscreen="allowfullscreen"></iframe></p>', selection: [[ 0 ], 0, [ 0 ], 1 ], expectedTag: 'iframe' },
        ], (tagScenario: ElementPathTagScenario) => {
          it(`TINY-10891: Tooltip should show correct tag name for ${tagScenario.expectedTag} element`, async () => {
            const editor = hook.editor();
            editor.setContent(tagScenario.content);

            if (Type.isNonNullable(tagScenario.selection)) {
              const [ startPath, soffset, finishPath, foffset ] = tagScenario.selection;
              TinySelections.setSelection(editor, startPath, soffset, finishPath, foffset);
            } else if (Type.isNonNullable(tagScenario.cursor)) {
              TinySelections.setCursor(editor, tagScenario.cursor, 0);
            }

            await TooltipUtils.pAssertTooltip(editor, async () => {
              await pFocusElementPath(editor, doc);
              await pArrowFromFocused(doc, 'right', tagScenario.expectedTag);
              return Promise.resolve();
            }, scenario.expectedString(tagScenario.expectedTag));
          });
        });
      });
    });
  });
});
