import { ApproxStructure, Assertions, Mouse, TestStore, UiFinder } from '@ephox/agar';
import { beforeEach, context, describe, it } from '@ephox/bedrock-client';
import { Arr, Optionals } from '@ephox/katamari';
import { Attribute, Height, SelectorFind, SugarBody, SugarDocument, SugarElement, SugarLocation, Width } from '@ephox/sugar';
import { TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { Dialog } from 'tinymce/core/api/ui/Ui';
import I18n from 'tinymce/core/api/util/I18n';

import * as DialogUtils from '../../module/DialogUtils';

describe('browser.tinymce.themes.silver.window.SilverDialogBlockTest', () => {
  const store = TestStore();
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce'
  }, []);

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

  const clickableButtonSelector = 'button:contains("Clickable?")';
  const closeButtonSelector = '.tox-button[title="Close"]';

  const pClick = async (editor: Editor, selector: string) => {
    const button = await TinyUiActions.pWaitForUi(editor, selector) as SugarElement<HTMLButtonElement>;
    const coords = SugarLocation.absolute(button);
    const centerX = coords.left + 0.5 * Width.get(button);
    const centerY = coords.top + 0.5 * Height.get(button);
    const elem = SugarElement.fromPoint(SugarDocument.getDocument(), centerX, centerY).getOrDie();
    Mouse.click(elem);
  };

  const pAssertBlock = async (editor: Editor, blocked: boolean) => {
    const button = await TinyUiActions.pWaitForUi(editor, 'button:contains("Clickable?")');
    const parent = SelectorFind.closest(button, '[aria-busy]');
    const busyAttr = parent.bind((parent) => Attribute.getOpt(parent, 'aria-busy'));
    const isBlocked = Optionals.is(busyAttr, 'true');
    assert.equal(isBlocked, blocked, 'Blocked state of the dialog');
  };

  const assertBusyStructure = (message: string) => {
    const busyElem = UiFinder.findIn(SugarBody.body(), '.tox-dialog__busy-spinner').getOrDie();
    Assertions.assertStructure('Check busy structure', ApproxStructure.build((s, str, arr) => s.element('div', {
      attrs: {
        'aria-label': str.is(message)
      },
      styles: {
        position: str.is('absolute')
      },
      children: [
        s.element('div', {
          classes: [ arr.has('tox-spinner') ]
        })
      ]
    })), busyElem);
  };

  Arr.each([
    { label: 'Modal', params: { }},
    { label: 'Inline', params: { inline: 'toolbar' as 'toolbar' }}
  ], (test) => {
    context(test.label, () => {
      beforeEach(() => {
        store.clear();
      });

      it('TINY-6487: Ensure the button clicks when unblocked', async () => {
        const editor = hook.editor();
        DialogUtils.open(editor, dialogSpec, test.params);
        await pClick(editor, clickableButtonSelector);
        store.assertEq(`Ensure that it clicks (${test.label})`, [ 'clicked' ]);
        DialogUtils.close(editor);
      });

      it('TINY-6487: Ensure the button does not click when blocked', async () => {
        const editor = hook.editor();
        const api = DialogUtils.open(editor, dialogSpec, test.params);
        api.block('Block message');
        await pClick(editor, clickableButtonSelector);
        store.cAssertEq(`Ensure that it has not clicked (${test.label})`, []);
        DialogUtils.close(editor);
      });

      it('TINY-6487: Ensure that the button does click after unblocking', async () => {
        const editor = hook.editor();
        const api = DialogUtils.open(editor, dialogSpec, test.params);
        api.block('Block message');
        api.unblock();
        await pClick(editor, clickableButtonSelector);
        store.cAssertEq(`Ensure that it has not clicked (${test.label})`, [ 'clicked' ]);
        DialogUtils.close(editor);
      });

      it('TINY-6487: Ensure that the button gets blocked', async () => {
        const editor = hook.editor();
        const api = DialogUtils.open(editor, dialogSpec, test.params);
        api.block('Block message');
        await pAssertBlock(editor, true);
        api.unblock();
        await pAssertBlock(editor, false);
        DialogUtils.close(editor);
      });

      it('TINY-6971: Ensure block messages are translated', async () => {
        const editor = hook.editor();
        I18n.setCode('de');
        I18n.add('de', {
          'Uploading image': 'Bild hochladen'
        });
        const api = DialogUtils.open(editor, dialogSpec, test.params);
        api.block('Uploading image');
        await pAssertBlock(editor, true);
        assertBusyStructure('Bild hochladen');
        DialogUtils.close(editor);
        I18n.setCode('en');
      });

      it('TINY-10056: Ensure close button is clickable when dialog is blocked', async () => {
        const editor = hook.editor();
        const api = DialogUtils.open(editor, dialogSpec, test.params);
        api.block('Block message');
        await pClick(editor, closeButtonSelector);
        store.cAssertEq(`Ensure that it has clicked (${test.label})`, [ 'clicked' ]);
        UiFinder.notExists(SugarBody.body(), '[role="dialog"]');
      });

      it('TINY-10056: Asserting blocker offsetTop, should left dialog header unblocked', async () => {
        const editor = hook.editor();
        const api = DialogUtils.open(editor, dialogSpec, test.params);

        const dialog = await TinyUiActions.pWaitForDialog(editor);
        api.block('Block message');

        const headerHeight = Height.get(UiFinder.findIn<HTMLElement>(dialog, '.tox-dialog__header').getOrDie());
        const blocker = UiFinder.findIn<HTMLElement>(dialog, '.tox-dialog__busy-spinner').getOrDie();
        assert.equal(blocker.dom.offsetTop, headerHeight, 'Ensure that the blocker is the same height as the header');
        DialogUtils.close(editor);
      });
    });
  });
});
