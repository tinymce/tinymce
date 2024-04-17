import { FocusTools, RealKeys, Waiter } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { Insert, Remove, SugarDocument, SugarElement } from '@ephox/sugar';
import { TinyContentActions, TinyDom, TinyHooks } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import * as NativeFullscreen from 'tinymce/plugins/fullscreen/core/NativeFullscreen';

import FullscreenPlugin from '../../../main/ts/Plugin';

describe('webdriver.tinymce.plugins.fullscreen.FullscreenTrapFocusTest', () => {

  Arr.each([
    { label: 'Iframe Editor', setup: TinyHooks.bddSetup },
    { label: 'Shadow Dom Editor', setup: TinyHooks.bddSetupInShadowRoot }
  ], (tester) => {
    Arr.each([
      'non-native', 'native'
    ], (mode) => {
      context(`${tester.label} - ${mode} - Trap focus`, () => {
        const hook = TinyHooks.bddSetup<Editor>({
          toolbar: 'fullscreen',
          plugins: 'fullscreen',
          base_url: '/project/tinymce/js/tinymce',
          fullscreen_native: mode === 'native'
        }, [ FullscreenPlugin ], true);

        const pDoShiftTab = async (selector: string = 'iframe => body'): Promise<void> => {
          await RealKeys.pSendKeysOn(selector, [ RealKeys.combo({ shift: true }, 'tab') ]);
        };

        const pDoTab = async (selector: string = 'iframe => body'): Promise<void> => {
          await RealKeys.pSendKeysOn(selector, [ RealKeys.text('tab') ]);
        };

        const setupInput = (insert: (marker: SugarElement<Node>, element: SugarElement<Node>) => void, editor: Editor) => {
          const input = SugarElement.fromTag('input');
          insert(TinyDom.container(editor), input);
          return input;
        };

        const setupInputBefore = (editor: Editor) => setupInput(Insert.before, editor);
        const setupInputAfter = (editor: Editor) => setupInput(Insert.after, editor);

        const pIsFullscreen = (fullscreen: boolean) => Waiter.pTryUntilPredicate('Waiting for fullscreen mode to ' + (fullscreen ? 'start' : 'end'), () => {
          if (fullscreen) {
            return NativeFullscreen.getFullscreenElement(document) === document.body;
          } else {
            return NativeFullscreen.getFullscreenElement(document) === null;
          }
        });

        const pToggleFullscreen = async (editor: Editor, nativeMode: boolean, fullscreen: boolean) => {
          TinyContentActions.keystroke(editor, 121, { alt: true });
          await FocusTools.pTryOnSelector('Assert toolbar is focused', SugarDocument.getDocument(), 'div[role=toolbar] .tox-tbtn');
          await RealKeys.pSendKeysOn('div[role=toolbar] .tox-tbtn', [ RealKeys.text('enter') ]);
          if (nativeMode) {
            await pIsFullscreen(fullscreen);
            await Waiter.pWait(500);
          }
        };

        it('TINY-10597: Focus should not go out of the editor on fullscreen mode, when shift tabbing ', async () => {
          const editor = hook.editor();
          const beforeInput = setupInputBefore(editor);
          const afterInput = setupInputAfter(editor);

          await pToggleFullscreen(editor, mode === 'native', true);

          await pDoShiftTab();
          await FocusTools.pTryOnSelector('Focus should still be in the iframe when focus is going out', SugarDocument.getDocument(), '.tox-edit-area__iframe');

          await pDoShiftTab();
          await FocusTools.pTryOnSelector('Focus should still be in the iframe when focus is going out 2', SugarDocument.getDocument(), '.tox-edit-area__iframe');

          await pDoShiftTab();
          await FocusTools.pTryOnSelector('Focus should still be in the iframe when focus is going out 3', SugarDocument.getDocument(), '.tox-edit-area__iframe');

          await pToggleFullscreen(editor, mode === 'native', false);

          Remove.remove(beforeInput);
          Remove.remove(afterInput);
        });

        it('TINY-10597: Focus should not go out of the editor on fullscreen mode, when tabbing', async () => {
          const editor = hook.editor();
          const beforeInput = setupInputBefore(editor);
          const afterInput = setupInputAfter(editor);

          await pToggleFullscreen(editor, mode === 'native', true);

          await pDoTab();
          await FocusTools.pTryOnSelector('Focus should still be in the iframe when focus is going out', SugarDocument.getDocument(), '.tox-edit-area__iframe');

          await pDoTab();
          await FocusTools.pTryOnSelector('Focus should still be in the iframe when focus is going out 2', SugarDocument.getDocument(), '.tox-edit-area__iframe');

          await pDoTab();
          await FocusTools.pTryOnSelector('Focus should still be in the iframe when focus is going out 3', SugarDocument.getDocument(), '.tox-edit-area__iframe');

          await pToggleFullscreen(editor, mode === 'native', false);

          Remove.remove(beforeInput);
          Remove.remove(afterInput);
        });
      });
    });
  });
});
