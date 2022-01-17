import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/autosave/Plugin';

describe('browser.tinymce.plugins.autosave.AutoSavePluginTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'autosave',
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ]);

  const checkIfEmpty = (editor: Editor, html: string, isEmpty: boolean): void => {
    const result = isEmpty ? 'empty.' : 'not empty.';

    assert.equal(editor.plugins.autosave.isEmpty(html), isEmpty, `The HTML "${html}" is ${result}`);
  };

  it('TBA: isEmpty true', () => {
    const editor = hook.editor();
    checkIfEmpty(editor, '', true);
    checkIfEmpty(editor, '   ', true);
    checkIfEmpty(editor, '\t\t\t', true);

    checkIfEmpty(editor, '<p id="x"></p>', true);
    checkIfEmpty(editor, '<p></p>', true);
    checkIfEmpty(editor, '<p> </p>', true);
    checkIfEmpty(editor, '<p>\t</p>', true);

    checkIfEmpty(editor, '<p><br></p>', true);
    checkIfEmpty(editor, '<p><br /></p>', true);
    checkIfEmpty(editor, '<p><br data-mce-bogus="true" /></p>', true);
    checkIfEmpty(editor, '<p><br data-mce-bogus="true" /></p>', true);

    checkIfEmpty(editor, '<h1></h1>', true);
    checkIfEmpty(editor, '<p><br data-mce-bogus="true" /><br data-mce-bogus="true" /></p>', true);
  });

  it('TBA: isEmpty false', () => {
    const editor = hook.editor();
    checkIfEmpty(editor, 'X', false);
    checkIfEmpty(editor, '   X', false);
    checkIfEmpty(editor, '\t\t\tX', false);

    checkIfEmpty(editor, '<p>X</p>', false);
    checkIfEmpty(editor, '<p> X</p>', false);
    checkIfEmpty(editor, '<p>\tX</p>', false);

    checkIfEmpty(editor, '<p><br>X</p>', false);
    checkIfEmpty(editor, '<p><br />X</p>', false);
    checkIfEmpty(editor, '<p><br data-mce-bogus="true" />X</p>', false);

    checkIfEmpty(editor, '<p><br><br></p>', false);
    checkIfEmpty(editor, '<p><br /><br /></p>', false);
    checkIfEmpty(editor, '<p><br><br>X</p>', false);
    checkIfEmpty(editor, '<p><br /><br />X</p>', false);
    checkIfEmpty(editor, '<p><br data-mce-bogus="true" /><br data-mce-bogus="true" />X</p>', false);

    checkIfEmpty(editor, '<img src="x" />', false);
  });

  it('TBA: hasDraft/storeDraft/restoreDraft', () => {
    const editor = hook.editor();
    assert.isFalse(editor.plugins.autosave.hasDraft(), 'Check if it starts with a draft');

    editor.setContent('X');
    editor.undoManager.add();
    editor.plugins.autosave.storeDraft();

    assert.isTrue(editor.plugins.autosave.hasDraft(), 'Check that adding a draft adds a draft');

    editor.setContent('Y');
    editor.undoManager.add();

    editor.plugins.autosave.restoreDraft();
    assert.equal(editor.getContent(), '<p>X</p>', 'Check that a draft can be restored');
    editor.plugins.autosave.removeDraft();
  });

  it('TBA: recognises location hash change', () => {
    const editor = hook.editor();
    assert.isFalse(editor.plugins.autosave.hasDraft(), 'Check if it starts with a draft');

    editor.setContent('X');
    editor.undoManager.add();
    editor.plugins.autosave.storeDraft();

    window.location.hash = 'test' + Math.random().toString(36).substring(7);

    assert.isFalse(editor.plugins.autosave.hasDraft(), 'Check if it notices a hash change');

    window.history.replaceState('', document.title, window.location.pathname + window.location.search);
  });
});
