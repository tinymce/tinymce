import { Chain, Log, Mouse, Pipeline } from '@ephox/agar';
import { TestHelpers } from '@ephox/alloy';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import { TinyLoader, TinyUi } from '@ephox/mcagar';
import { Attribute, Height, SelectorFind, SugarElement, SugarLocation, Width } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import { Dialog } from 'tinymce/core/api/ui/Ui';
import { WindowParams } from 'tinymce/core/api/WindowManager';
import Theme from 'tinymce/themes/silver/Theme';

import * as DialogUtils from '../../module/DialogUtils';

UnitTest.asyncTest('browser.tinymce.themes.silver.window.SilverDialogBlockTest', (success, failure) => {
  Theme();

  TinyLoader.setupLight((editor: Editor, success, failure) => {
    const store = TestHelpers.TestStore();
    const dialogSpec: Dialog.DialogSpec<{ fred: string }> = {
      title: 'Test dialog',
      body: {
        type: 'panel',
        items: [
          {
            type: 'input',
            name: 'fred',
            label: 'Freds input'
          }
        ]
      },
      buttons: [
        {
          type: 'cancel',
          name: 'cancel',
          text: 'Cancel'
        },
        {
          type: 'custom',
          name: 'clickable',
          text: 'Clickable?'
        }
      ],
      initialData: {
        fred: 'Some string'
      },
      onAction: store.adder('clicked')
    };

    const ui = TinyUi(editor);

    const cOpen = (params: WindowParams) => DialogUtils.cOpen(editor, dialogSpec, params);
    const cClose = Chain.mapper<Dialog.DialogInstanceApi<{ fred: string }>, void>((api) => { api.close(); });
    const cClick = Chain.fromIsolatedChains([
      ui.cWaitForUi('Fred button', 'button:contains("Clickable?")'),
      Chain.mapper<SugarElement<HTMLButtonElement>, SugarElement<Element>>((button) => {
        const coords = SugarLocation.absolute(button);
        const centerX = coords.left + 0.5 * Width.get(button);
        const centerY = coords.top + 0.5 * Height.get(button);
        return SugarElement.fromPoint(SugarElement.fromDom(document), centerX, centerY).getOrDie();
      }),
      Mouse.cClickWith({ })
    ]);
    const cAssertBlock = (blocked: boolean) => Chain.fromIsolatedChains([
      ui.cWaitForUi('Fred button', 'button:contains("Clickable?")'),
      Chain.op<SugarElement<HTMLButtonElement>>((button) => {
        const parent = SelectorFind.closest(button, '[aria-busy]');
        const isBlocked = parent
          .bind((parent) => Attribute.getOpt(parent, 'aria-busy'))
          .is('true');
        Assert.eq('Blocked state of the dialog', blocked, isBlocked);
      })
    ]);
    const cBlock = (message: string) => Chain.op<Dialog.DialogInstanceApi<{ fred: string }>>((api) => api.block(message));
    const cUnblock = Chain.op<Dialog.DialogInstanceApi<{ fred: string }>>((api) => api.unblock());

    const doTest = (label: string, params: WindowParams) => [
      Log.chainsAsStep('TINY-6487', 'Ensure the button clicks when unblocked', [
        store.cClear,
        cOpen(params),
        cClick,
        store.cAssertEq(`Ensure that it clicks (${label})`, [ 'clicked' ]),
        cClose
      ]),

      Log.chainsAsStep('TINY-6487', 'Ensure the button does not click when blocked', [
        store.cClear,
        cOpen(params),
        cBlock('Block message'),
        cClick,
        store.cAssertEq(`Ensure that it has not clicked (${label})`, []),
        cClose
      ]),

      Log.chainsAsStep('TINY-6487', 'Ensure that the button does click after unblocking', [
        store.cClear,
        cOpen(params),
        cBlock('Block message'),
        cUnblock,
        cClick,
        store.cAssertEq(`Ensure that it has not clicked (${label})`, [ 'clicked' ]),
        cClose
      ]),

      Log.chainsAsStep('TINY-6487', 'Ensure that the button gets blocked', [
        cOpen(params),
        cBlock('Block message'),
        cAssertBlock(true),
        cUnblock,
        cAssertBlock(false),
        cClose
      ])
    ];

    Pipeline.async({}, [
      ...doTest('modal', {}),
      ...doTest('inline', { inline: 'toolbar' })
    ], success, failure);
  }, {
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);

});