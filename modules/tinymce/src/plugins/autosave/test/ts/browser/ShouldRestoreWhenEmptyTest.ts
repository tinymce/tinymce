import { before, describe, it } from '@ephox/bedrock-client';
import { McEditor, TinyAssertions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/autosave/Plugin';

describe('browser.tinymce.plugins.autosave.ShouldRestoreWhenEmptyTest', () => {
  before(() => {
    Plugin();
  });

  const testingPrefix = Math.random().toString(36).substring(7);
  const settings = {
    base_url: '/project/tinymce/js/tinymce',
    plugins: 'autosave',
    autosave_prefix: testingPrefix
  };

  const assertHasDraft = (editor: Editor, expected: boolean) => {
    assert.equal(editor.plugins.autosave.hasDraft(), expected, `should${!expected ? 'n\'t' : ''} have draft`);
  };

  const storeDraft = (editor: Editor) => {
    editor.plugins.autosave.storeDraft();
  };

  const removeDraft = (editor: Editor) => {
    editor.plugins.autosave.removeDraft();
  };

  const addUndoLevel = (editor: Editor) => {
    editor.undoManager.add();
  };

  const pSetupAndAssertBaseState = async (content: string) => {
    const editor = await McEditor.pFromSettings<Editor>(settings);
    assertHasDraft(editor, false);
    editor.setContent(content);
    addUndoLevel(editor);
    storeDraft(editor);
    assertHasDraft(editor, true);
    McEditor.remove(editor);
  };

  it('should restore draft when empty with setting', async () => {
    await pSetupAndAssertBaseState('<p>X</p>');
    const editor = await McEditor.pFromSettings<Editor>({ ...settings, autosave_restore_when_empty: true });
    assertHasDraft(editor, true);
    TinyAssertions.assertContent(editor, '<p>X</p>');
    removeDraft(editor);
    McEditor.remove(editor);
  });

  it(`shouldn't restore draft when empty without setting`, async () => {
    await pSetupAndAssertBaseState('<p>X</p>');
    const editor = await McEditor.pFromSettings<Editor>(settings);
    assertHasDraft(editor, true);
    TinyAssertions.assertContent(editor, '');
    removeDraft(editor);
    McEditor.remove(editor);
  });
});
