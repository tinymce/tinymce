import { context, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { TinyAssertions, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import AdvListPlugin from 'tinymce/plugins/advlist/Plugin';
import ListsPlugin from 'tinymce/plugins/lists/Plugin';

describe('browser.tinymce.plugins.advlist.ChangeListStyleTest', () => {
  Arr.each([
    { label: 'Iframe Editor', setup: TinyHooks.bddSetup },
    { label: 'Shadow Dom Editor', setup: TinyHooks.bddSetupInShadowRoot }
  ], (tester) => {
    context(tester.label, () => {
      const hook = tester.setup<Editor>({
        indent: false,
        plugins: 'lists advlist',
        toolbar: 'numlist bullist',
        menubar: false,
        statusbar: false,
        base_url: '/project/tinymce/js/tinymce'
      }, [ AdvListPlugin, ListsPlugin ]);

      const pWaitForMenu = (editor: Editor) => TinyUiActions.pWaitForUi(editor, '.tox-menu.tox-selected-menu');

      it('ul to alpha, cursor only in parent', async () => {
        const editor = hook.editor();
        editor.setContent('<ul><li>a</li><ul><li>b</li></ul></ul>');
        TinySelections.setCursor(editor, [ 0, 0, 0 ], 0);
        TinyUiActions.clickOnToolbar(editor, '[aria-label="Numbered list"] > .tox-tbtn + .tox-split-button__chevron');
        await pWaitForMenu(editor);
        TinyUiActions.clickOnUi(editor, 'div.tox-selected-menu[role="menu"] div[title="Lower Alpha"]');
        TinyAssertions.assertContent(editor, '<ol style="list-style-type: lower-alpha;"><li>a</li><ul><li>b</li></ul></ol>');
        TinyAssertions.assertSelection(editor, [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 0);
      });

      it('ul to alpha, selection from parent to sublist', async () => {
        const editor = hook.editor();
        editor.setContent('<ul><li>a</li><ul><li>b</li></ul></ul>');
        TinySelections.setSelection(editor, [ 0, 0, 0 ], 0, [ 0, 1, 0, 0 ], 1);
        TinyUiActions.clickOnToolbar(editor, '[aria-label="Numbered list"] > .tox-tbtn + .tox-split-button__chevron');
        await pWaitForMenu(editor);
        TinyUiActions.clickOnUi(editor, 'div.tox-selected-menu[role="menu"] div[title="Lower Alpha"]');
        TinyAssertions.assertContent(editor, '<ol style="list-style-type: lower-alpha;"><li>a</li><ol style="list-style-type: lower-alpha;"><li>b</li></ol></ol>');
        TinyAssertions.assertSelection(editor, [ 0, 0, 0 ], 0, [ 0, 1, 0, 0 ], 1);
      });

      it('ol to ul, cursor only in parent', () => {
        const editor = hook.editor();
        editor.setContent('<ol><li>a</li><ol><li>b</li></ol></ol>');
        TinySelections.setCursor(editor, [ 0, 0, 0 ], 0);
        TinyUiActions.clickOnToolbar(editor, '[aria-label="Bullet list"] > .tox-tbtn');
        TinyAssertions.assertContent(editor, '<ul><li>a</li><ol><li>b</li></ol></ul>');
        TinyAssertions.assertSelection(editor, [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 0);
      });

      it('ol to ul, selection from parent to sublist', () => {
        const editor = hook.editor();
        editor.setContent('<ol><li>a</li><ol><li>b</li></ol></ol>');
        TinySelections.setSelection(editor, [ 0, 0, 0 ], 0, [ 0, 1, 0, 0 ], 1);
        TinyUiActions.clickOnToolbar(editor, '[aria-label="Bullet list"] > .tox-tbtn');
        TinyAssertions.assertContent(editor, '<ul><li>a</li><ul><li>b</li></ul></ul>');
        TinyAssertions.assertSelection(editor, [ 0, 0, 0 ], 0, [ 0, 1, 0, 0 ], 1);
      });

      it('alpha to ol, cursor only in parent', async () => {
        const editor = hook.editor();
        editor.setContent('<ol style="list-style-type: lower-alpha;"><li>a</li><ol style="list-style-type: lower-alpha;"><li>b</li></ol></ol>');
        TinySelections.setCursor(editor, [ 0, 0, 0 ], 0);
        TinyUiActions.clickOnToolbar(editor, '[aria-label="Numbered list"] > .tox-tbtn + .tox-split-button__chevron');
        await pWaitForMenu(editor);
        TinyUiActions.clickOnUi(editor, 'div.tox-selected-menu[role="menu"] div[title="Default"]');
        TinyAssertions.assertContent(editor, '<ol><li>a</li><ol style="list-style-type: lower-alpha;"><li>b</li></ol></ol>');
        TinyAssertions.assertSelection(editor, [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 0);
      });

      it('alpha to ol, selection from parent to sublist', async () => {
        const editor = hook.editor();
        editor.setContent('<ol style="list-style-type: lower-alpha;"><li>a</li><ol style="list-style-type: lower-alpha;"><li>b</li></ol></ol>');
        TinySelections.setSelection(editor, [ 0, 0, 0 ], 0, [ 0, 1, 0, 0 ], 1);
        TinyUiActions.clickOnToolbar(editor, '[aria-label="Numbered list"] > .tox-tbtn + .tox-split-button__chevron');
        await pWaitForMenu(editor);
        TinyUiActions.clickOnUi(editor, 'div.tox-selected-menu[role="menu"] div[title="Default"]');
        TinyAssertions.assertContent(editor, '<ol><li>a</li><ol><li>b</li></ol></ol>');
        TinyAssertions.assertSelection(editor, [ 0, 0, 0 ], 0, [ 0, 1, 0, 0 ], 1);
      });

      it('alpha to ul, cursor only in parent', () => {
        const editor = hook.editor();
        editor.setContent('<ol style="list-style-type: lower-alpha;"><li>a</li><ol style="list-style-type: lower-alpha;"><li>b</li></ol></ol>');
        TinySelections.setCursor(editor, [ 0, 0, 0 ], 0);
        TinyUiActions.clickOnToolbar(editor, '[aria-label="Bullet list"] > .tox-tbtn');
        TinyAssertions.assertContent(editor, '<ul><li>a</li><ol style="list-style-type: lower-alpha;"><li>b</li></ol></ul>');
        TinyAssertions.assertSelection(editor, [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 0);
      });

      it('alpha to ul, selection from parent to sublist', () => {
        const editor = hook.editor();
        editor.setContent('<ol style="list-style-type: lower-alpha;"><li>a</li><ol style="list-style-type: lower-alpha;"><li>b</li></ol></ol>');
        TinySelections.setSelection(editor, [ 0, 0, 0 ], 0, [ 0, 1, 0, 0 ], 1);
        TinyUiActions.clickOnToolbar(editor, '[aria-label="Bullet list"] > .tox-tbtn');
        TinyAssertions.assertContent(editor, '<ul><li>a</li><ul><li>b</li></ul></ul>');
        TinyAssertions.assertSelection(editor, [ 0, 0, 0 ], 0, [ 0, 1, 0, 0 ], 1);
      });
    });
  });
});
