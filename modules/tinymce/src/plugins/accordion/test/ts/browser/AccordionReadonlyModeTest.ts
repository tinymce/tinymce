import { UiFinder } from '@ephox/agar';
import { afterEach, describe, it } from '@ephox/bedrock-client';
import { SugarBody } from '@ephox/sugar';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/accordion/Plugin';

const assertToolbarButtonEnabled = (name: string) => {
  const toolbar = UiFinder.findIn(SugarBody.body(), '.tox-toolbar-overlord').getOrDie();
  UiFinder.exists(toolbar, `button.tox-tbtn[data-mce-name="${name}"]`);
  UiFinder.notExists(toolbar, `button.tox-tbtn--disabled[data-mce-name="${name}"]`);
};

const assertToolbarButtonDisabled = (name: string) => {
  const toolbar = UiFinder.findIn(SugarBody.body(), '.tox-toolbar-overlord').getOrDie();
  UiFinder.exists(toolbar, `button.tox-tbtn--disabled[data-mce-name="${name}"]`);
};

const assertContextToolbarButtonEnabled = async (name: string) => {
  const pop = await UiFinder.pWaitFor('Waiting for popup to appear', SugarBody.body(), '.tox-silver-sink .tox-pop');
  UiFinder.exists(pop, `button.tox-tbtn[data-mce-name="${name}"]`);
  UiFinder.notExists(pop, `button.tox-tbtn--disable[data-mce-name="${name}"]`);
};

describe('browser.tinymce.plugins.accordion.AccordionReadonlyModeTest', () => {
  const hook = TinyHooks.bddSetup<Editor>(
    {
      plugins: 'accordion',
      toolbar: 'accordiontoggle',
      base_url: '/project/tinymce/js/tinymce',
    },
    [ Plugin ]
  );

  afterEach(() => {
    const editor = hook.editor();
    editor.resetContent();
    editor.mode.set('design');
    editor.options.set('disabled', false);
  });

  [ 'readonly', 'design' ].forEach((mode) => {
    it(`TINY-12315: Toggle accordion button should be enabled in ${mode} mode`, async () => {
      const editor = hook.editor();
      editor.focus();
      editor.setContent('<details><summary>Toggle accordion</summary><p>Hidden info</p></details>');
      editor.mode.set(mode);
      TinySelections.setCursor(editor, [ 0, 0, 0 ], 0);

      assertToolbarButtonEnabled('accordiontoggle');
      await assertContextToolbarButtonEnabled('accordiontoggle');
    });
  });

  it(`TINY-12315: Toggle accordion toolbar button should be disabled in disabled editor`, async () => {
    const editor = hook.editor();
    editor.options.set('disabled', true);
    await UiFinder.pWaitFor('Wait for editor to enter disabled state', SugarBody.body(), '.tox-tinymce.tox-tinymce--disabled');

    assertToolbarButtonDisabled('accordiontoggle');
  });

  it('TINY-12315: Toggling the accordion in readonly mode should not add undo level', () => {
    const editor = hook.editor();
    editor.resetContent('<details><summary>Toggle accordion</summary><p>Hidden info</p></details>');
    editor.mode.set('readonly');
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 0);

    assert.isFalse(editor.undoManager.hasUndo(), 'Should not have undo levels initially');
    editor.execCommand('ToggleAccordion');
    assert.isFalse(editor.undoManager.hasUndo(), 'Should not add undo level when toggling accordion in readonly mode');
  });

  it('TINY-12315: Toggling the accordion in design mode should add undo level', () => {
    const editor = hook.editor();
    editor.resetContent('<details><summary>Toggle accordion</summary><p>Hidden info</p></details>');
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 0);

    assert.isFalse(editor.undoManager.hasUndo(), 'Should not have undo levels initially');
    editor.execCommand('ToggleAccordion');
    assert.isTrue(editor.undoManager.hasUndo(), 'Should add undo level when toggling accordion in design mode');
  });

  it.only('TINY-12315: Toggling the accordion in readonly-mode should have no impact on getContent', () => {
    const editor = hook.editor();
    editor.focus();
    editor.setContent('<details><summary>Toggle accordion</summary><p>Hidden info</p></details>');
    editor.mode.set('readonly');
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 0);

    const initialContent = [ '<details>', '<summary>Toggle accordion</summary>', '<p>Hidden info</p>', '</details>' ].join('\n');
    assert.equal(editor.getContent(), initialContent, 'Initial content should match expected HTML structure');
    editor.execCommand('ToggleAccordion');
    assert.equal(editor.getContent(), initialContent, 'Content should remain unchanged after ToggleAccordion command in readonly mode');
  });
});
