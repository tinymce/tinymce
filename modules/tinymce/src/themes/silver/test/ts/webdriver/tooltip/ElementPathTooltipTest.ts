import { FocusTools, RealKeys, RealMouse, UiFinder } from '@ephox/agar';
import { Assert, before, context, describe, it } from '@ephox/bedrock-client';
import { Arr, Type } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { Attribute, SugarBody, SugarDocument } from '@ephox/sugar';
import { TinyContentActions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import I18n from 'tinymce/core/api/util/I18n';

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

describe('browser.tinymce.themes.silver.editor.ElementPathTooltipTest', () => {
  const doc = SugarDocument.getDocument();
  const browser = PlatformDetection.detect().browser;
  const hook = TinyHooks.bddSetup<Editor>({
    base_url: '/project/tinymce/js/tinymce'
  });

  Arr.each([
    { label: 'no translations', expectedString: (elementName: string) => `Select the ${elementName} element`, setup: () => I18n.setCode('en') },
    { label: 'translations', expectedString: (elementName: string) => `Zort the ${elementName} frum`,
      setup: () => {
        I18n.add('test', { 'Select the {0} element': 'Zort the {0} frum' });
        I18n.setCode('test');
      }
    }], (scenario: ElementPathTranslationScenario) => {
    context(scenario.label, () => {
      before(() => scenario.setup());

      it(`TINY-10891: Should show only single tooltip when navigating between elememt path with keyboard`, async () => {
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
          TinyContentActions.keystroke(editor, 122, { alt: true });
          await FocusTools.pTryOnSelector('Assert element path is focused', doc, 'div[role=navigation] .tox-statusbar__path-item');
          await RealKeys.pSendKeysOn('div[role=navigation] .tox-statusbar__path-item', [ RealKeys.text('arrowright') ]);
          return Promise.resolve();
        }, scenario.expectedString('tbody'));

        await TooltipUtils.pAssertTooltip(editor, async () => {
          await RealKeys.pSendKeysOn('.tox-statusbar__path-item=tbody', [ RealKeys.text('arrowright') ]);
          await FocusTools.pTryOnSelector('Assert element path is focused', doc, '.tox-statusbar__path-item:contains(tr)');
          return Promise.resolve();
        }, scenario.expectedString('tr'));

        await TooltipUtils.pAssertTooltip(editor, async () => {
          await RealKeys.pSendKeysOn('.tox-statusbar__path-item=tr', [ RealKeys.text('arrowright') ]);
          await FocusTools.pTryOnSelector('Assert element path is focused', doc, '.tox-statusbar__path-item:contains(td)');
          return Promise.resolve();
        }, scenario.expectedString('td'));

        await TooltipUtils.pAssertTooltip(editor, async () => {
          await RealKeys.pSendKeysOn('.tox-statusbar__path-item=td', [ RealKeys.text('arrowleft') ]);
          await FocusTools.pTryOnSelector('Assert element path is focused', doc, '.tox-statusbar__path-item:contains(tr)');
          return Promise.resolve();
        }, scenario.expectedString('tr'));

        await TooltipUtils.pAssertTooltip(editor, async () => {
          await RealKeys.pSendKeysOn('.tox-statusbar__path-item=tr', [ RealKeys.text('arrowleft') ]);
          await FocusTools.pTryOnSelector('Assert element path is focused', doc, '.tox-statusbar__path-item:contains(tbody)');
          return Promise.resolve();
        }, scenario.expectedString('tbody'));

        await TooltipUtils.pAssertTooltip(editor, async () => {
          await RealKeys.pSendKeysOn('.tox-statusbar__path-item=tbody', [ RealKeys.text('arrowleft') ]);
          await FocusTools.pTryOnSelector('Assert element path is focused', doc, '.tox-statusbar__path-item:contains(table)');
          return Promise.resolve();
        }, scenario.expectedString('table'));

        await TooltipUtils.pCloseTooltip(editor, buttonSelector);
      });

      (browser.isSafari() ? it.skip : it)(`TINY-10891: Should show only single tooltip when navigating between elememt path with mouse`, async () => {
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
          await RealMouse.pMoveToOn('.tox-statusbar__path-item=tbody');
          await UiFinder.pWaitFor('Waiting for label to be changed', SugarBody.body(), `.tox-silver-sink .tox-tooltip__body:contains(${scenario.expectedString('tbody')})`);
          return Promise.resolve();
        }, scenario.expectedString('tbody'));

        await TooltipUtils.pAssertTooltip(editor, async () => {
          await RealMouse.pMoveToOn('.tox-statusbar__path-item=table');
          await UiFinder.pWaitFor('Waiting for label to be changed', SugarBody.body(), `.tox-silver-sink .tox-tooltip__body:contains(${scenario.expectedString('table')})`);
          return Promise.resolve();
        }, scenario.expectedString('table'));

        await TooltipUtils.pAssertTooltip(editor, async () => {
          await RealMouse.pMoveToOn('.tox-statusbar__path-item=tr');
          await UiFinder.pWaitFor('Waiting for label to be changed', SugarBody.body(), `.tox-silver-sink .tox-tooltip__body:contains(${scenario.expectedString('tr')})`);
          return Promise.resolve();
        }, scenario.expectedString('tr'));

        await TooltipUtils.pAssertTooltip(editor, async () => {
          await RealMouse.pMoveToOn('.tox-statusbar__path-item=td');
          await UiFinder.pWaitFor('Waiting for label to be changed', SugarBody.body(), `.tox-silver-sink .tox-tooltip__body:contains(${scenario.expectedString('td')})`);
          return Promise.resolve();
        }, scenario.expectedString('td'));

        await RealMouse.pMoveToOn('iframe => body');
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
          TinyContentActions.keystroke(editor, 122, { alt: true });
          await FocusTools.pTryOnSelector('Assert element path is focused', doc, 'div[role=navigation] .tox-statusbar__path-item');
          await RealKeys.pSendKeysOn('.tox-statusbar__path-item=table', [ RealKeys.text('arrowright') ]);
          await FocusTools.pTryOnSelector('Assert element path is focused', doc, '.tox-statusbar__path-item:contains(tbody)');
          return Promise.resolve();
        }, scenario.expectedString('tbody'));

        const tooltip = UiFinder.findIn<HTMLElement>(SugarDocument.getDocument(), '.tox-silver-sink .tox-tooltip').getOrDie();
        const elementPath = UiFinder.findIn<HTMLElement>(SugarDocument.getDocument(), `.tox-statusbar__path-item:contains(tbody)`).getOrDie();

        Assert.eq('Element path aria-describedby matches the tooltip id', Attribute.get(tooltip, 'id'), Attribute.get(elementPath, 'aria-describedby'));

        await TooltipUtils.pAssertTooltip(editor, async () => {
          await RealKeys.pSendKeysOn('.tox-statusbar__path-item=tbody', [ RealKeys.text('arrowright') ]);
          await FocusTools.pTryOnSelector('Assert element path is focused', doc, '.tox-statusbar__path-item:contains(tr)');
          return Promise.resolve();
        }, scenario.expectedString('tr'));

        const tooltip2 = UiFinder.findIn<HTMLElement>(SugarDocument.getDocument(), '.tox-silver-sink .tox-tooltip').getOrDie();
        const tbodyElementPath = UiFinder.findIn<HTMLElement>(SugarDocument.getDocument(), '.tox-statusbar__path-item:contains(tbody)').getOrDie();
        const trElementPath = UiFinder.findIn<HTMLElement>(SugarDocument.getDocument(), '.tox-statusbar__path-item:contains(tr)').getOrDie();

        Assert.eq('Element path aria-describedby matches the tooltip id 2', Attribute.get(tooltip2, 'id'), Attribute.get(trElementPath, 'aria-describedby'));
        Assert.eq('Element path should not contain aria-describedby attribute after tooltip is removed ', undefined, Attribute.get(tbodyElementPath, 'aria-describedby'));

        await RealMouse.pMoveToOn('iframe => body');
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
            TinyContentActions.keystroke(editor, 122, { alt: true });
            await FocusTools.pTryOnSelector('Assert element path is focused', doc, 'div[role=navigation] .tox-statusbar__path-item');
            await RealKeys.pSendKeysOn('div[role=navigation] .tox-statusbar__path-item', [ RealKeys.text('arrowright') ]);
            return Promise.resolve();
          }, scenario.expectedString(tagScenario.expectedTag));
          await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.text('escape') ]);
        });
      });
    });
  });
});
