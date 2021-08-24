import { describe, it } from '@ephox/bedrock-client';
import { PlatformDetection } from '@ephox/sand';
import { TinyAssertions, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/searchreplace/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

import * as Utils from '../module/test/Utils';

describe('browser.tinymce.plugins.searchreplace.SearchReplaceDialogTest', () => {
  const hook = TinyHooks.bddSetupInShadowRoot<Editor>({
    plugins: 'searchreplace',
    menubar: false,
    toolbar: 'searchreplace',
    base_url: '/project/tinymce/js/tinymce',
  }, [ Theme, Plugin ]);

  const browser = PlatformDetection.detect().browser;

  const assertFound = (editor: Editor, count: number) => TinyAssertions.assertContentPresence(editor, {
    '.mce-match-marker': count
  });

  const findAndAssertFound = (editor: Editor, count: number) => {
    Utils.clickFind(editor);
    assertFound(editor, count);
  };

  it('TBA: Test no content selected', async () => {
    const editor = hook.editor();
    editor.setContent('<p>fish fish fish</p>');
    await Utils.pOpenDialog(editor);
    await Utils.pAssertFieldValue(editor, 'input.tox-textfield[placeholder="Find"]', '');
    TinyUiActions.closeDialog(editor);
  });

  it('TBA: Test some content selected', async () => {
    const editor = hook.editor();
    editor.setContent('<p>fish fish fish</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 5, [ 0, 0 ], 9);
    await Utils.pOpenDialog(editor);
    await Utils.pAssertFieldValue(editor, 'input.tox-textfield[placeholder="Find"]', 'fish');
    findAndAssertFound(editor, 3);
    TinyUiActions.closeDialog(editor);
  });

  it('TBA: Test some content selected with matchcase enabled', async () => {
    const editor = hook.editor();
    editor.setContent('<p>fish Fish fish</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 5, [ 0, 0 ], 9);
    await Utils.pOpenDialog(editor);
    await Utils.pAssertFieldValue(editor, 'input.tox-textfield[placeholder="Find"]', 'Fish');
    await Utils.pSelectPreference(editor, 'Match case');
    findAndAssertFound(editor, 1);
    await Utils.pSelectPreference(editor, 'Match case');
    TinyUiActions.closeDialog(editor);
  });

  it('TBA: Test some content selected with wholewords enabled', async () => {
    const editor = hook.editor();
    editor.setContent('<p>ttt TTT ttt ttttt</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 3);
    await Utils.pOpenDialog(editor);
    await Utils.pAssertFieldValue(editor, 'input.tox-textfield[placeholder="Find"]', 'ttt');
    await Utils.pSelectPreference(editor, 'Find whole words only');
    findAndAssertFound(editor, 3);
    await Utils.pSelectPreference(editor, 'Find whole words only');
    TinyUiActions.closeDialog(editor);
  });

  it('TINY-4549: Test some content selected with in selection enabled', async () => {
    const editor = hook.editor();
    editor.setContent('<p>ttt TTT ttt ttttt</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 7);
    await Utils.pOpenDialog(editor);
    await Utils.pAssertFieldValue(editor, 'input.tox-textfield[placeholder="Find"]', 'ttt TTT');
    await Utils.pSetFieldValue(editor, 'input.tox-textfield[placeholder="Find"]', 'ttt');
    await Utils.pSelectPreference(editor, 'Find in selection');
    findAndAssertFound(editor, 2);
    browser.isIE() ? // TODO: Look into what to do with IE as it has a single selection model which causes some different behaviour
      TinyAssertions.assertSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 0) :
      TinyAssertions.assertSelection(editor, [ 0 ], 0, [ 0 ], 4);
    await Utils.pSelectPreference(editor, 'Find in selection');
    TinyUiActions.closeDialog(editor);
  });

  it('TBA: Test some content selected while changing preferences', async () => {
    const editor = hook.editor();
    editor.setContent('<p>fish fish Fish fishy</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 5, [ 0, 0 ], 9);
    await Utils.pOpenDialog(editor);
    await Utils.pAssertFieldValue(editor, 'input.tox-textfield[placeholder="Find"]', 'fish');
    findAndAssertFound(editor, 4);
    await Utils.pSelectPreference(editor, 'Match case');
    assertFound(editor, 0);
    findAndAssertFound(editor, 3);
    await Utils.pSelectPreference(editor, 'Find whole words only');
    assertFound(editor, 0);
    findAndAssertFound(editor, 2);
    TinyUiActions.closeDialog(editor);
  });
});
