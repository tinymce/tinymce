import { UiFinder } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { SugarBody } from '@ephox/sugar';
import { TinyHooks, TinySelections, TinyState } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.themes.silver.editor.toolbar.IndentOutdentTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    toolbar: 'outdent indent',
  }, []);

  context('Noneditable root', () => {
    const testDisableOnNoneditable = (title: string) => () => {
      TinyState.withNoneditableRootEditor(hook.editor(), (editor) => {
        editor.setContent('<div><p style="padding-left: 40px">Noneditable content</p></div><div contenteditable="true"><p style="padding-left: 40px">Editable content</p></div>');
        TinySelections.setSelection(editor, [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 2);
        UiFinder.exists(SugarBody.body(), `[aria-label="${title}"][aria-disabled="true"]`);
        TinySelections.setSelection(editor, [ 1, 0, 0 ], 0, [ 1, 0, 0 ], 2);
        UiFinder.exists(SugarBody.body(), `[aria-label="${title}"][aria-disabled="false"]`);
      });
    };

    it('TINY-9669: Disable outdent on noneditable content', testDisableOnNoneditable('Increase indent'));
    it('TINY-9669: Disable indent on noneditable content', testDisableOnNoneditable('Decrease indent'));
  });
});

