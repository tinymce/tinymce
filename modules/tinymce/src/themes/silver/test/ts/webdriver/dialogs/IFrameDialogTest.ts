import { FocusTools, RealKeys, RealMouse, UiFinder } from '@ephox/agar';
import { TestHelpers } from '@ephox/alloy';
import { before, describe, it } from '@ephox/bedrock-client';
import { Arr, Fun } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { Focus, SugarDocument } from '@ephox/sugar';

import { WindowManagerImpl } from 'tinymce/core/api/WindowManager';
import * as WindowManager from 'tinymce/themes/silver/ui/dialog/WindowManager';

import * as TestExtras from '../../module/TestExtras';

describe('webdriver.tinymce.themes.silver.dialogs.IFrameDialogTest', () => {
  const isFirefox = PlatformDetection.detect().browser.isFirefox();
  const extrasHook = TestExtras.bddSetup();
  let windowManager: WindowManagerImpl;
  before(() => {
    windowManager = WindowManager.setup(extrasHook.access().extras);
  });

  TestHelpers.GuiSetup.bddAddStyles(SugarDocument.getDocument(), [
    '[role="dialog"] { border: 1px solid black; padding: 2em; background-color: rgb(131,193,249); top: 40px; position: absolute; }',

    ':focus { outline: 3px solid green; !important; }',
    // NOTE: this is just for aiding debugging. It only works in some browsers
    'iframe:focus-within { outline: 3px solid green; !important; }'
  ]);

  const pPressTab = async (selector: string, shift: boolean) => {
    await RealKeys.pSendKeysOn(
      selector,
      [
        RealKeys.combo({ shiftKey: shift }, '\u0009')
      ]
    );
  };

  it('Keyboard navigate dialog with iframe component', async () => {
    windowManager.open({
      title: 'Custom Dialog',
      body: {
        type: 'panel',
        items: [
          {
            name: 'input1',
            type: 'input'
          },
          {
            name: 'frame1',
            type: 'iframe'
          }
        ]
      },
      buttons: [
        {
          type: 'cancel',
          text: 'Close'
        }
      ],
      initialData: {
        input1: 'Dog',
        // NOTE: Tried some postMessage stuff to broadcast the scroll. Couldn't get it to work.
        // We can't just read the scroll value due to permissions
        frame1: '<!doctype html><html><head>' +
          '</head>' +
          '<body><h1>Heading</h1>' +
          Arr.map([ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ], (n) => '<p>This is paragraph: ' + n + '</p>').join('\n') +
          '</body>'
      }
    }, {}, Fun.noop);

    await UiFinder.pWaitForState<HTMLIFrameElement>(
      'check iframe is loaded',
      SugarDocument.getDocument(),
      '.tox-dialog .tox-dialog__body iframe',
      (iframe) => iframe.dom.contentDocument?.readyState === 'complete'
    );

    const input = await FocusTools.pTryOnSelector('focus should be on the input initially', SugarDocument.getDocument(), 'input');

    if (isFirefox) {
      // Firefox doesn't allow escaping the iframe when using shift+tab if it's body hasn't been interacted with? Focusing alone didn't work
      // TODO: TINY-2308 - Investigate how to fix this, as it means tabbing can get stuck in the iframe on Firefox
      await RealMouse.pClickOn('iframe => body');
      await FocusTools.pTryOnSelector('focus should be on iframe', SugarDocument.getDocument(), 'iframe');
      Focus.focus(input);
    }

    await pPressTab('input', false);

    await FocusTools.pTryOnSelector('focus should be on iframe', SugarDocument.getDocument(), 'iframe');
    await pPressTab('iframe => body', false);

    await FocusTools.pTryOnSelector('focus should be on the "after" tabstop', SugarDocument.getDocument(), 'div[class*="alloy-fake-after-tabstop"]');
    await pPressTab('div[class*="alloy-fake-after-tabstop"]', false);

    await FocusTools.pTryOnSelector('focus should be on button (cancel)', SugarDocument.getDocument(), 'button:contains("Close")');
    await pPressTab('button.tox-button--secondary', true);

    await FocusTools.pTryOnSelector('focus should move back to iframe (button >> iframe)', SugarDocument.getDocument(), 'iframe');
    await pPressTab('iframe => body', true);

    // Firefox when shift+tabbing it will cause the iframe to be focused twice
    // so we need to do an extra shift+tab
    if (isFirefox) {
      await FocusTools.pTryOnSelector('focus should be on the iframe', SugarDocument.getDocument(), 'iframe');
      await pPressTab('iframe', true);
    }

    await FocusTools.pTryOnSelector('focus should be on the "before" tabstop', SugarDocument.getDocument(), 'div[class*="alloy-fake-before-tabstop"]');
    await pPressTab('div[class*="alloy-fake-before-tabstop"]', true);

    await FocusTools.pTryOnSelector('focus should move back to input (iframe >> input)', SugarDocument.getDocument(), 'input');
  });
});
