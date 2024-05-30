import { RealKeys, RealMouse } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { PlatformDetection } from '@ephox/sand';
import { TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

import * as TooltipUtils from '../../module/TooltipUtils';

describe('browser.tinymce.themes.silver.editor.HtmlPanelTooltipTest', () => {
  const pOpenDialogAndWaitForLoad = async (editor: Editor, buttonSelector: string) => {
    TinyUiActions.clickOnToolbar(editor, buttonSelector);
    await TinyUiActions.pWaitForDialog(editor);
  };

  // TINY-10995: When calling RealMouse.pMoveToOn, cursor moves to [0, 0]
  const contextFn = PlatformDetection.detect().browser.isSafari() ? context.skip : context;
  contextFn('Tooltip if data-mce-tooltip is in htmlpanel', () => {
    const hook = TinyHooks.bddSetup<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      toolbar: 'custom-dialog',
      setup: (ed: Editor) => {
        ed.ui.registry.addButton('custom-dialog', {
          text: 'Open custom dialog',
          onAction: () => {
            ed.windowManager.open({
              title: 'Custom dialog',
              body: {
                type: 'panel',
                items: [
                  {
                    type: 'button',
                    name: 'test',
                    text: 'test',
                    icon: 'action-prev',
                    borderless: true
                  },
                  {
                    type: 'htmlpanel',
                    html: `
                      <div>
                      <a class="tox-button tox-button--naked tox-button--icon" href="https://tiny.cloud" data-mce-tooltip="test-button"  data-alloy-tabstop="true" tabindex="-1">
                      <div class="tox-icon">
                      ${ed.ui.registry.getAll().icons.bold}
                      </div>
                      </a>
                      </div>
                    `,
                    presets: 'presentation'
                  },
                ]
              }
            });
          }
        });
      }
    });

    it('TINY-9641: Hover custom button with data-mce-tooltip in htmlpanel, should show tooltip', async () => {
      const editor = hook.editor();
      await pOpenDialogAndWaitForLoad(editor, 'button[data-mce-name="custom-dialog"]');
      await TooltipUtils.pAssertTooltip(editor, async () => {
        await RealMouse.pMoveToOn('[data-mce-tooltip="test-button"]');
        await TinyUiActions.pWaitForUi(editor, '.tox-silver-sink .tox-tooltip__body:contains("test-button")');
        return Promise.resolve();
      }, 'test-button');
      TinyUiActions.closeDialog(editor);
    });

    it('TINY-9641: Hover custom button in htmlpanel, then tab to navigate away, should hide current tooltip and show tooltip for close button', async () => {
      const editor = hook.editor();
      await pOpenDialogAndWaitForLoad(editor, 'button[data-mce-name="custom-dialog"]');
      await TooltipUtils.pAssertTooltip(editor, async () => {
        await RealMouse.pMoveToOn('[data-mce-tooltip="test-button"]');
        await TinyUiActions.pWaitForUi(editor, '.tox-silver-sink .tox-tooltip__body:contains("test-button")');
        await RealKeys.pSendKeysOn('[data-mce-tooltip="test-button"]', [ RealKeys.combo({}, 'tab') ]);
        await TinyUiActions.pWaitForUi(editor, '.tox-silver-sink .tox-tooltip__body:contains("Close")');
        return Promise.resolve();
      }, 'Close');
      TinyUiActions.closeDialog(editor);
    });

    it('TINY-9641: Hover custom button in htmlpanel, then hover on close button, should hide current tooltip and show tooltip for close button', async () => {
      const editor = hook.editor();
      await pOpenDialogAndWaitForLoad(editor, 'button[data-mce-name="custom-dialog"]');
      await TooltipUtils.pAssertTooltip(editor, async () => {
        await TinyUiActions.pWaitForUi(editor, '.tox-silver-sink .tox-tooltip__body');
        await RealMouse.pMoveToOn('[data-mce-tooltip="test-button"]');
        await RealMouse.pMoveToOn('[data-mce-name="close"]');
        await TinyUiActions.pWaitForUi(editor, '.tox-silver-sink .tox-tooltip__body:contains("Close")');
        return Promise.resolve();
      }, 'Close');
      TinyUiActions.closeDialog(editor);
    });
  });

  context('No tooltip if theres no data-mce-tooltip in htmlpanel', () => {
    const hook = TinyHooks.bddSetup<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      toolbar: 'custom-dialog',
      setup: (ed: Editor) => {
        ed.ui.registry.addButton('custom-dialog', {
          text: 'Open custom dialog',
          onAction: () => {
            ed.windowManager.open({
              title: 'Custom dialog',
              body: {
                type: 'panel',
                items: [
                  {
                    type: 'button',
                    name: 'test',
                    text: 'test',
                    icon: 'action-prev',
                    borderless: true
                  },
                  {
                    type: 'htmlpanel',
                    html: `
                      <div>
                      <a class="tox-button tox-button--naked tox-button--icon" href="https://tiny.cloud" data-mce-tooltip2="test-button"  data-alloy-tabstop="true" tabindex="-1">
                      <div class="tox-icon">
                      ${ed.ui.registry.getAll().icons.bold}
                      </div>
                      </a>
                      </div>
                    `,
                    presets: 'presentation'
                  },
                ]
              }
            });
          }
        });
      }
    });

    it('TINY-9641: Should not show tooltip when theres no data-mce-tooltip attribute on elements, with mouse', async () => {
      const editor = hook.editor();
      await pOpenDialogAndWaitForLoad(editor, 'button[data-mce-name="custom-dialog"]');
      await TooltipUtils.pAssertNoTooltip(editor, async () => {
        await RealKeys.pSendKeysOn('[data-mce-name="test"]', [ RealKeys.combo({}, 'tab') ]);
        return Promise.resolve();
      }, '');
      TinyUiActions.closeDialog(editor);
    });

    it('TINY-9641: Should not show tooltip when theres no data-mce-tooltip attribute on elements, with keyboard', async () => {
      const editor = hook.editor();
      await pOpenDialogAndWaitForLoad(editor, 'button[data-mce-name="custom-dialog"]');
      await TooltipUtils.pAssertNoTooltip(editor, async () => {
        await RealKeys.pSendKeysOn('[data-mce-name="test"]', [ RealKeys.combo({}, 'tab') ]);
        return Promise.resolve();
      }, '');
      TinyUiActions.closeDialog(editor);
    });
  });
});
