import { context, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { Class, SelectorFilter } from '@ephox/sugar';
import { TinyDom, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/searchreplace/Plugin';

import * as Utils from '../module/test/Utils';

enum Direction {
  FORWARDS,
  BACKWARDS
}

describe('browser.tinymce.plugins.searchreplace.SearchReplaceDialogCyclingTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'searchreplace',
    toolbar: 'searchreplace',
    base_url: '/project/tinymce/js/tinymce',
  }, [ Plugin ]);

  const assertMatchFound = (editor: Editor, index: number) => {
    const matches = SelectorFilter.descendants(TinyDom.body(editor), '.mce-match-marker');
    const elem = matches[index];
    assert.isTrue(Class.has(elem, 'mce-match-marker-selected'), `Check match ${index} is marked as selected`);
  };

  Arr.each([
    { label: 'Test cycling using find', scenario: { cycle: Utils.clickFind, dir: Direction.FORWARDS }},
    { label: 'Test cycling using next', scenario: { cycle: Utils.clickNext, dir: Direction.FORWARDS }},
    { label: 'Test cycling using previous', scenario: { cycle: Utils.clickPrev, dir: Direction.BACKWARDS }},
  ], (testCase) => {
    context(testCase.label, () => {
      const { dir, cycle } = testCase.scenario;

      it('TINY-4506: Test cycling through results without any preferences', async () => {
        const editor = hook.editor();
        editor.setContent('<p>fish fish fish</p>');
        TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 4);
        await Utils.pOpenDialog(editor);
        await Utils.pAssertFieldValue(editor, 'input.tox-textfield[placeholder="Find"]', 'fish');
        Utils.clickFind(editor);
        assertMatchFound(editor, 0);
        cycle(editor);
        assertMatchFound(editor, dir === Direction.FORWARDS ? 1 : 2);
        cycle(editor);
        assertMatchFound(editor, dir === Direction.FORWARDS ? 2 : 1);
        cycle(editor);
        assertMatchFound(editor, 0);
        TinyUiActions.closeDialog(editor);
      });

      it('TINY-4506: Test cycling through results with matchcase enabled', async () => {
        const editor = hook.editor();
        editor.setContent('<p>fish Fish fish Fish</p>');
        TinySelections.setSelection(editor, [ 0, 0 ], 5, [ 0, 0 ], 9);
        await Utils.pOpenDialog(editor);
        await Utils.pAssertFieldValue(editor, 'input.tox-textfield[placeholder="Find"]', 'Fish');
        await Utils.pSelectPreference(editor, 'Match case');
        Utils.clickFind(editor);
        assertMatchFound(editor, 0);
        cycle(editor);
        assertMatchFound(editor, 1);
        cycle(editor);
        assertMatchFound(editor, 0);
        await Utils.pSelectPreference(editor, 'Match case');
        TinyUiActions.closeDialog(editor);
      });

      it('TINY-4506: Test cycling through results with wholewords enabled', async () => {
        const editor = hook.editor();
        editor.setContent('<p>ttt TTT ttt ttttt</p>');
        TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 3);
        await Utils.pOpenDialog(editor);
        await Utils.pAssertFieldValue(editor, 'input.tox-textfield[placeholder="Find"]', 'ttt');
        await Utils.pSelectPreference(editor, 'Find whole words only');
        Utils.clickFind(editor);
        assertMatchFound(editor, 0);
        cycle(editor);
        assertMatchFound(editor, dir === Direction.FORWARDS ? 1 : 2);
        cycle(editor);
        assertMatchFound(editor, dir === Direction.FORWARDS ? 2 : 1);
        cycle(editor);
        assertMatchFound(editor, 0);
        await Utils.pSelectPreference(editor, 'Find whole words only');
        TinyUiActions.closeDialog(editor);
      });

      it('TINY-4506: Test cycling through results with special characters', async () => {
        const editor = hook.editor();
        editor.setContent('<p>^^ ^^ ^^ fish</p>');
        TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 2);
        await Utils.pOpenDialog(editor);
        await Utils.pAssertFieldValue(editor, 'input.tox-textfield[placeholder="Find"]', '^^');
        Utils.clickFind(editor);
        assertMatchFound(editor, 0);
        cycle(editor);
        assertMatchFound(editor, dir === Direction.FORWARDS ? 1 : 2);
        cycle(editor);
        assertMatchFound(editor, dir === Direction.FORWARDS ? 2 : 1);
        cycle(editor);
        assertMatchFound(editor, 0);
        TinyUiActions.closeDialog(editor);
      });
    });
  });
});
