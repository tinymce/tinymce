import { ApproxStructure, Assertions, UiFinder, Waiter } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { SugarBody } from '@ephox/sugar';
import { TinyDom, TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.themes.silver.editor.DisableTest', () => {
  const pAssertUiDisabled = async (editor: Editor, disabled: boolean) => {
    const overlord = UiFinder.findIn(SugarBody.body(), '.tox-toolbar-overlord').getOrDie();
    await Waiter.pTryUntil(
      'Waiting for toolbar state',
      () => Assertions.assertStructure('Toolbar should be in correct disabled state', ApproxStructure.build((s, str, arr) =>
        s.element('div', {
          classes: [
            arr.has('tox-toolbar-overlord'),
            disabled ? arr.has('tox-tbtn--disabled') : arr.not('tox-tbtn--disabled')
          ],
          attrs: { 'aria-disabled': str.is(disabled ? 'true' : 'false') }
        })
      ), overlord)
    );
    Assertions.assertStructure(
      'Editor container should have disabled class if disabled',
      ApproxStructure.build((s, str, arr) => s.element('div', {
        classes: [ arr.has('tox-tinymce') ].concat(disabled ? [ arr.has('tox-tinymce--disabled') ] : [])
      })),
      TinyDom.container(editor)
    );
    assert.equal(!editor.ui.isEnabled(), disabled, 'Editor isEnabled should return current disabled state');
  };

  const assertButtonEnabled = (selector: string) => UiFinder.notExists(SugarBody.body(), `[data-mce-name="${selector}"][aria-disabled="true"]`);

  const assertButtonDisabled = (selector: string) => UiFinder.exists(SugarBody.body(), `[data-mce-name="${selector}"][aria-disabled="true"]`);

  context('Without disabled option', () => {
    const hook = TinyHooks.bddSetup<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      toolbar: 't1',
      setup: (ed: Editor) => {
        ed.ui.registry.addButton('t1', {
          onAction: Fun.noop,
          text: 'Test1',
          context: 'any'
        });
      }
    }, []);

    context('Test disable/enable APIs', () => {
      it('TINY-6397: Should be able to enable and disable the UI', async () => {
        const editor = hook.editor();
        editor.ui.setEnabled(false);
        await pAssertUiDisabled(editor, true);
        editor.ui.setEnabled(true);
        await pAssertUiDisabled(editor, false);
      });

      it('TINY-6397: Should still able to toggle ui state in readonly mode', async () => {
        const editor = hook.editor();
        editor.ui.setEnabled(false);
        await pAssertUiDisabled(editor, true);
        editor.mode.set('readonly');
        await pAssertUiDisabled(editor, false);
        editor.ui.setEnabled(true);
        await pAssertUiDisabled(editor, false);
        editor.mode.set('design');
      });

      it('TINY-11211: Should not enable button on NodeChange with context: any when ui is disabled', async () => {
        const editor = hook.editor();
        editor.ui.setEnabled(false);
        assertButtonDisabled('t1');
        editor.nodeChanged();
        assertButtonDisabled('t1');
        editor.ui.setEnabled(true);
        assertButtonEnabled('t1');
      });
    });
  });

  context('With disabled option', () => {
    const hook = TinyHooks.bddSetup<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      toolbar: 't1',
      disabled: true,
      setup: (ed: Editor) => {
        ed.ui.registry.addButton('t1', {
          onAction: Fun.noop,
          text: 'Test1',
          context: 'any'
        });
      }
    }, []);

    it('TINY-11488: Should not be able to enable the UI when in disabled mode', async () => {
      const editor = hook.editor();
      await pAssertUiDisabled(editor, true);
      editor.ui.setEnabled(true);
      await pAssertUiDisabled(editor, true);
      editor.ui.setEnabled(false);
      await pAssertUiDisabled(editor, true);

      editor.options.set('disabled', false);
      editor.ui.setEnabled(true);
      await pAssertUiDisabled(editor, false);
      editor.ui.setEnabled(false);
      await pAssertUiDisabled(editor, true);
    });
  });
});
