import { UiFinder } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { SugarBody } from '@ephox/sugar';
import { TinyAssertions, TinyHooks, TinySelections, TinyState, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/lists/Plugin';

describe('browser.tinymce.plugins.advlist.NoneditableRootTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    plugins: 'lists advlist',
    toolbar: 'numlist bullist | outdent indent',
    contextmenu: 'lists',
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ], true);

  context('List ui controls', () => {
    const initialListContent = '<ol><li>a</li></ol>';
    const setupEditor = (editor: Editor) => {
      editor.setContent(initialListContent);
      TinySelections.setCursor(editor, [ 0, 0, 0 ], 0);
    };

    it('TINY-9458: List buttons numlist/bullist should be disabled', () => {
      TinyState.withNoneditableRootEditor<Editor>(hook.editor(), (editor) => {
        setupEditor(editor);

        UiFinder.exists(SugarBody.body(), 'div[title="Numbered list"][aria-disabled="true"]');
        UiFinder.exists(SugarBody.body(), 'div[title="Bullet list"][aria-disabled="true"]');
      });
    });

    it('TINY-9458: Outdent/indent buttons should be noop', () => {
      TinyState.withNoneditableRootEditor<Editor>(hook.editor(), (editor) => {
        setupEditor(editor);

        TinyUiActions.clickOnToolbar(editor, 'button[title="Decrease indent"]');
        TinyAssertions.assertContent(editor, initialListContent);

        TinyUiActions.clickOnToolbar(editor, 'button[title="Increase indent"]');
        TinyAssertions.assertContent(editor, initialListContent);
      });
    });

    it('TINY-9458: Context menu list properties should be disabled', async () => {
      await TinyState.withNoneditableRootEditorAsync<Editor>(hook.editor(), async (editor) => {
        setupEditor(editor);

        await TinyUiActions.pTriggerContextMenu(editor, 'li', '.tox-silver-sink [role="menuitem"]:contains("List properties...")');
        UiFinder.exists(SugarBody.body(), '[role="menuitem"][aria-disabled="true"]:contains("List properties...")');
      });
    });
  });
});

