import { ApproxStructure, Assertions, UiFinder, Waiter } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { SugarBody } from '@ephox/sugar';
import { TinyDom, TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.themes.silver.editor.DisableTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce'
  }, []);

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

  context('Test disable/enable APIs', () => {
    it('TINY-6397: Should be able to enable and disable the UI', async () => {
      const editor = hook.editor();
      editor.ui.setEnabled(false);
      await pAssertUiDisabled(editor, true);
      editor.ui.setEnabled(true);
      await pAssertUiDisabled(editor, false);
    });

    it('TINY-6397: Should not be able to enable the UI when in readonly mode', async () => {
      const editor = hook.editor();
      editor.ui.setEnabled(false);
      editor.mode.set('readonly');
      await pAssertUiDisabled(editor, true);
      editor.ui.setEnabled(true);
      await pAssertUiDisabled(editor, true);
      editor.mode.set('design');
    });
  });
});
