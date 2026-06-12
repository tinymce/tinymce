import { Assertions, Waiter } from '@ephox/agar';
import { Boxes } from '@ephox/alloy';
import { after, before, context, describe, it } from '@ephox/bedrock-client';
import { Arr, Fun } from '@ephox/katamari';
import { Css, Insert, Remove, SugarBody, SugarElement, SugarShadowDom } from '@ephox/sugar';
import { TinyDom, TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';

import type Editor from 'tinymce/core/api/Editor';

import * as TooltipUtils from '../../module/TooltipUtils';

describe('browser.tinymce.themes.silver.editor.TooltipInShadowDom', () => {
  const withinBounds = (innerBound: Boxes.Bounds, outerBound: Boxes.Bounds) =>
    innerBound.x >= outerBound.x
    && innerBound.y >= outerBound.y
    && innerBound.bottom <= outerBound.bottom
    && innerBound.right <= outerBound.right;

  const pAssertTooltipWithinEditorHostBound = async (editor: Editor) => {
    const tooltipSelector = '.tox-silver-sink .tox-tooltip__body';
    const buttonSelector = 'button[data-mce-name="first-button"]';
    await TooltipUtils.pTriggerTooltipWithMouse(editor, buttonSelector);
    const tooltip = await TinyUiActions.pWaitForUi(editor, tooltipSelector) as SugarElement<HTMLElement>;
    const tooltipBound = Boxes.box(tooltip);
    const rootNode = SugarShadowDom.getShadowRoot(TinyDom.container(editor));
    const rootBound = Boxes.box(SugarShadowDom.getShadowHost(rootNode.getOrDie()) as SugarElement<HTMLElement>);
    Assertions.assertEq('Tooltip should be positioned within the editor\'s host bound', true, withinBounds(tooltipBound, rootBound));
    await TooltipUtils.pCloseTooltip(editor, buttonSelector);
  };

  Arr.each([
    {
      label: 'split',
      settings: {
        ui_mode: 'split'
      }
    },
    {
      label: 'combined',
      settings: {
        ui_mode: 'combined'
      }
    }
  ], ({ label, settings }) => {
    context(`UI mode: ${label}`, () => {
      let containerRef: SugarElement<HTMLElement> | undefined;

      const hook = TinyHooks.bddSetupInShadowRoot<Editor>({
        base_url: '/project/tinymce/js/tinymce',
        toolbar: 'first-button second-button',
        width: 400,
        ...settings,
        setup: (ed: Editor) => {
          ed.ui.registry.addButton('first-button', {
            text: 'First button',
            tooltip: 'A very very long tooltip',
            onAction: Fun.noop
          });

          ed.ui.registry.addButton('second-button', {
            text: 'Second Button',
            tooltip: 'Second Button',
            onAction: Fun.noop
          });
        },
      }, []);

      before(async () => {
        const shadowRoot = hook.shadowRoot();
        const container = SugarElement.fromTag('div', document);
        containerRef = container;
        Css.setAll(container, { display: 'flex', width: '400px', height: '400px', overflow: 'scroll' });
        const hostContainer = SugarElement.fromTag('div', document);
        Css.setAll(hostContainer, { 'padding-left': '50px', 'overflow': 'auto' });

        const hostElement = SugarShadowDom.getShadowHost(shadowRoot);
        Insert.append(container, hostContainer);
        Insert.append(SugarBody.body(), container);
        Insert.append(hostContainer, hostElement);
        // wait for the UI to be updated
        await Waiter.pWait(100);
      });

      after(() => {
        Remove.remove(containerRef as any);
      });

      it('TINY-14384: Tooltip should be rendered within the boundary of the shadow dom host', async () => {
        await pAssertTooltipWithinEditorHostBound(hook.editor());
      });
    });
  });
});
