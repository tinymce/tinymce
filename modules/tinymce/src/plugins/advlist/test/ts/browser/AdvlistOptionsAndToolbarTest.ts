import { ApproxStructure, Assertions, UiFinder, Waiter } from '@ephox/agar';
import { before, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { SugarBody } from '@ephox/sugar';
import { McEditor, TinyAssertions, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import AdvListPlugin from 'tinymce/plugins/advlist/Plugin';
import ListsPlugin from 'tinymce/plugins/lists/Plugin';

interface SplitBtns {
  readonly number: boolean;
  readonly bullet: boolean;
}

type ListType = 'bullet' | 'number';

interface Scenario {
  readonly label: string;
  readonly options: Record<string, any>;
  readonly splitBtns: SplitBtns;
  readonly type: ListType;
  readonly expectedContent: string;
  readonly initialContent?: string;
  readonly finalExpectedContent?: string;
}

describe('browser.tinymce.plugins.advlist.AdvlistOptionsAndToolbarTest', () => {
  before(() => {
    AdvListPlugin();
    ListsPlugin();
  });

  const baseOptions = {
    plugins: 'lists advlist',
    toolbar: 'numlist bullist',
    menubar: false,
    statusbar: false,
    base_url: '/project/tinymce/js/tinymce',
  };

  const clickListBtn = (editor: Editor, type: ListType, isSplitBtn: boolean) => {
    const title = `${type === 'number' ? 'Numbered' : 'Bullet'} list`;
    if (isSplitBtn) {
      TinyUiActions.clickOnToolbar(editor, `[aria-label="${title}"] > .tox-tbtn`);
    } else {
      TinyUiActions.clickOnToolbar(editor, `[aria-label="${title}"]`);
    }
  };

  const pAssertListBtnStructures = async (splitBtns: SplitBtns) => {
    const toolbarGroup = UiFinder.findIn(SugarBody.body(), '.tox-editor-header .tox-toolbar .tox-toolbar__group').getOrDie();
    await Waiter.pTryUntil('Wait for toolbar', () => Assertions.assertStructure(
      'Check lists toolbar button structures',
      ApproxStructure.build((s, str, arr) => s.element('div', {
        classes: [ arr.has('tox-toolbar__group') ],
        children: [
          s.element(splitBtns.number ? 'div' : 'button', {
            classes: splitBtns.number ?
              [ arr.not('tox-tbtn'), arr.has('tox-split-button') ] :
              [ arr.has('tox-tbtn'), arr.not('tox-split-button') ],
            attrs: {
              title: str.is('Numbered list')
            }
          }),
          s.element(splitBtns.bullet ? 'div' : 'button', {
            classes: splitBtns.bullet ?
              [ arr.not('tox-tbtn'), arr.has('tox-split-button') ] :
              [ arr.has('tox-tbtn'), arr.not('tox-split-button') ],
            attrs: {
              title: str.is('Bullet list')
            }
          })
        ]
      })),
      toolbarGroup
    ));
  };

  Arr.each([
    {
      label: 'TBA: Test default advlist_number_styles option behaviour',
      options: {},
      splitBtns: { number: true, bullet: true },
      type: 'number',
      expectedContent: '<ol>\n<li>a</li>\n</ol>'
    },
    {
      label: 'TBA: Test default advlist_bullet_styles option behaviour',
      options: {},
      splitBtns: { number: true, bullet: true },
      type: 'bullet',
      expectedContent: '<ul>\n<li>a</li>\n</ul>'
    },
    {
      label: 'TINY-8721: Test not including default in advlist_number_styles option',
      options: {
        advlist_number_styles: 'lower-alpha,lower-greek'
      },
      splitBtns: { number: true, bullet: true },
      type: 'number',
      expectedContent: '<ol>\n<li>a</li>\n</ol>'
    },
    {
      label: 'TINY-8721: Test not including default in advlist_bullet_styles option',
      options: {
        advlist_bullet_styles: 'square,circle'
      },
      splitBtns: { number: true, bullet: true },
      type: 'bullet',
      expectedContent: '<ul>\n<li>a</li>\n</ul>'
    },
    {
      label: 'TINY-8721: Test providing empty string for advlist_number_styles option',
      options: {
        advlist_number_styles: ''
      },
      splitBtns: { number: false, bullet: true },
      type: 'number',
      expectedContent: '<ol>\n<li>a</li>\n</ol>'
    },
    {
      label: 'TINY-8721: Test providing empty string for advlist_bullet_styles option',
      options: {
        advlist_bullet_styles: ''
      },
      splitBtns: { number: true, bullet: false },
      type: 'bullet',
      expectedContent: '<ul>\n<li>a</li>\n</ul>'
    },
    {
      label: 'TINY-8721: Test providing single default value for advlist_number_styles option',
      options: {
        advlist_number_styles: 'default'
      },
      splitBtns: { number: false, bullet: true },
      type: 'number',
      expectedContent: '<ol>\n<li>a</li>\n</ol>'
    },
    {
      label: 'TINY-8721: Test providing single default value for advlist_bullet_styles option',
      options: {
        advlist_bullet_styles: 'default'
      },
      splitBtns: { number: true, bullet: false },
      type: 'bullet',
      expectedContent: '<ul>\n<li>a</li>\n</ul>'
    },
    {
      label: 'TINY-8721: Test providing single non-default value for advlist_number_styles option',
      options: {
        advlist_number_styles: 'lower-alpha'
      },
      splitBtns: { number: false, bullet: true },
      type: 'number',
      expectedContent: '<ol style="list-style-type: lower-alpha;">\n<li>a</li>\n</ol>'
    },
    {
      label: 'TINY-8721: Test providing single non-default value for advlist_bullet_styles option',
      options: {
        advlist_bullet_styles: 'square'
      },
      splitBtns: { number: true, bullet: false },
      type: 'bullet',
      expectedContent: '<ul style="list-style-type: square;">\n<li>a</li>\n</ul>'
    },
    {
      label: 'TINY-8721: Test that a bullet list with a different bullet style can be removed and applied',
      options: {
        advlist_bullet_styles: 'square'
      },
      splitBtns: { number: true, bullet: false },
      type: 'bullet',
      initialContent: '<ul><li>a</li></ul>',
      expectedContent: '<p>a</p>',
      finalExpectedContent: '<ul style="list-style-type: square;">\n<li>a</li>\n</ul>'
    },
    {
      label: 'TINY-8721: Test that a number list with a different number style can be removed and applied',
      options: {
        advlist_number_styles: 'lower-alpha'
      },
      splitBtns: { number: false, bullet: true },
      type: 'number',
      initialContent: '<ol><li>a</li></ol>',
      expectedContent: '<p>a</p>',
      finalExpectedContent: '<ol style="list-style-type: lower-alpha;">\n<li>a</li>\n</ol>'
    },
    {
      label: 'TINY-8721: Test that a number list can be converted to a bullet list',
      options: {
        advlist_bullet_styles: 'circle'
      },
      splitBtns: { number: true, bullet: false },
      type: 'bullet',
      initialContent: '<ol><li>a</li></ol>',
      expectedContent: '<ul style="list-style-type: circle;">\n<li>a</li>\n</ul>',
      finalExpectedContent: '<p>a</p>',
    },
    {
      label: 'TINY-8721: Test that a bullet list can be converted to a number list',
      options: {
        advlist_number_styles: 'upper-roman'
      },
      splitBtns: { number: false, bullet: true },
      type: 'number',
      initialContent: '<ul><li>a</li></ul>',
      expectedContent: '<ol style="list-style-type: upper-roman;">\n<li>a</li>\n</ol>',
      finalExpectedContent: '<p>a</p>',
    },
  ] as Scenario[], (scenario) => {
    const { splitBtns, type } = scenario;

    it(scenario.label, async () => {
      const editor = await McEditor.pFromSettings<Editor>({
        ...baseOptions,
        ...scenario.options
      });
      const initialContent = scenario.initialContent || '<p>a</p>';
      const finalContent = scenario.finalExpectedContent || initialContent;

      await pAssertListBtnStructures(splitBtns);
      editor.setContent(initialContent);
      editor.focus();

      clickListBtn(editor, type, splitBtns[type]);
      TinyAssertions.assertContent(editor, scenario.expectedContent);
      clickListBtn(editor, type, splitBtns[type]);
      TinyAssertions.assertContent(editor, finalContent);

      McEditor.remove(editor);
    });
  });
});
