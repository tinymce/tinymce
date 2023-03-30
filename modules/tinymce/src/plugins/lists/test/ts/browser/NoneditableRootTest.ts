import { UiFinder } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { SugarBody } from '@ephox/sugar';
import { TinyAssertions, TinyHooks, TinySelections, TinyState, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/lists/Plugin';

interface CommandTestCase {
  readonly input: string;
  readonly path: number[];
  readonly offset: 0;
  readonly cmd: string;
  readonly args?: Record<string, any>;
}

describe('browser.tinymce.plugins.lists.NoneditableRootTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    plugins: 'lists',
    toolbar: 'numlist bullist | outdent indent',
    contextmenu: 'lists',
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ], true);

  context('Commands', () => {
    const testNoopListCommand = (testCase: CommandTestCase) => () => {
      TinyState.withNoneditableRootEditor(hook.editor(), (editor) => {
        editor.setContent(testCase.input);
        TinySelections.setCursor(editor, testCase.path, testCase.offset);
        editor.execCommand(testCase.cmd, false, testCase.args ?? null);
        TinyAssertions.assertContent(editor, testCase.input);
      });
    };

    context('Ordered list', () => {
      it('TINY-9458: Ordered list should not be applied in noneditable root', testNoopListCommand({
        input: '<p>a</p>',
        path: [ 0 ],
        offset: 0,
        cmd: 'InsertOrderedList'
      }));

      it('TINY-9458: Toggle off ordered list should not be applied in noneditable root', testNoopListCommand({
        input: '<ol><li>a</li></ol>',
        path: [ 0, 0, 0 ],
        offset: 0,
        cmd: 'InsertOrderedList'
      }));

      it('TINY-9458: Switch to ordered ordered list should not be applied in noneditable root', testNoopListCommand({
        input: '<ul><li>a</li></ul>',
        path: [ 0, 0, 0 ],
        offset: 0,
        cmd: 'InsertOrderedList'
      }));
    });

    context('Unordered list', () => {
      it('TINY-9458: Unordered list should not be applied in noneditable root', testNoopListCommand({
        input: '<p>a</p>',
        path: [ 0 ],
        offset: 0,
        cmd: 'InsertUnorderedList'
      }));

      it('TINY-9458: Toggle off unordered list should not be applied in noneditable root', testNoopListCommand({
        input: '<ol><li>a</li></ol>',
        path: [ 0, 0, 0 ],
        offset: 0,
        cmd: 'InsertUnorderedList'
      }));

      it('TINY-9458: Switch to unordered ordered list should not be applied in noneditable root', testNoopListCommand({
        input: '<ol><li>a</li></ol>',
        path: [ 0, 0, 0 ],
        offset: 0,
        cmd: 'InsertUnorderedList'
      }));
    });

    context('Definition list', () => {
      it('TINY-9458: Definition list should not be applied in noneditable root', testNoopListCommand({
        input: '<p>a</p>',
        path: [ 0 ],
        offset: 0,
        cmd: 'InsertDefinitionList'
      }));

      it('TINY-9458: Toggle off definition list should not be applied in noneditable root', testNoopListCommand({
        input: '<ol><li>a</li></ol>',
        path: [ 0, 0, 0 ],
        offset: 0,
        cmd: 'InsertDefinitionList'
      }));

      it('TINY-9458: Switch to definition list should not be applied in noneditable root', testNoopListCommand({
        input: '<ol><li>a</li></ol>',
        path: [ 0, 0, 0 ],
        offset: 0,
        cmd: 'InsertDefinitionList'
      }));
    });

    context('Remove list', () => {
      it('TINY-9458: Remove list should not be applied in noneditable root', testNoopListCommand({
        input: '<ol><li>a</li></ol>',
        path: [ 0, 0, 0 ],
        offset: 0,
        cmd: 'RemoveList'
      }));
    });

    context('Update list', () => {
      it('TINY-9458: Update list should not be applied in noneditable root', testNoopListCommand({
        input: '<ol><li>a</li></ol>',
        path: [ 0, 0, 0 ],
        offset: 0,
        cmd: 'mceListUpdate',
        args: {
          attrs: { class: 'foo' }
        }
      }));
    });

    context('Indent/outdent list', () => {
      it('TINY-9458: Indent list should not be applied in noneditable root', testNoopListCommand({
        input: '<ol><li>a</li></ol>',
        path: [ 0, 0, 0 ],
        offset: 0,
        cmd: 'indent'
      }));

      it('TINY-9458: Outdent list should not be applied in noneditable root', testNoopListCommand({
        input: '<ol><li>a</li></ol>',
        path: [ 0, 0, 0 ],
        offset: 0,
        cmd: 'outdent'
      }));
    });

    context('List props', () => {
      it('TINY-9458: mceListProps command should be a noop', () => {
        TinyState.withNoneditableRootEditor(hook.editor(), (editor) => {
          editor.execCommand('mceListProps');
          UiFinder.notExists(SugarBody.body(), '.tox-dialog');
        });
      });
    });
  });

  context('List ui controls', () => {
    const initialListContent = '<ol><li>a</li></ol>';
    const setupEditor = (editor: Editor) => {
      editor.setContent(initialListContent);
      TinySelections.setCursor(editor, [ 0, 0, 0 ], 0);
    };

    it('TINY-9458: List buttons numlist/bullist should be disabled', () => {
      TinyState.withNoneditableRootEditor(hook.editor(), (editor) => {
        setupEditor(editor);

        UiFinder.exists(SugarBody.body(), 'button[title="Numbered list"][aria-disabled="true"]');
        UiFinder.exists(SugarBody.body(), 'button[title="Bullet list"][aria-disabled="true"]');
      });
    });

    it('TINY-9458: Outdent/indent buttons should be noop', () => {
      TinyState.withNoneditableRootEditor(hook.editor(), (editor) => {
        setupEditor(editor);

        TinyUiActions.clickOnToolbar(editor, 'button[title="Decrease indent"]');
        TinyAssertions.assertContent(editor, initialListContent);

        TinyUiActions.clickOnToolbar(editor, 'button[title="Increase indent"]');
        TinyAssertions.assertContent(editor, initialListContent);
      });
    });

    it('TINY-9458: Context menu list properties should be disabled', async () => {
      await TinyState.withNoneditableRootEditorAsync(hook.editor(), async (editor) => {
        setupEditor(editor);

        await TinyUiActions.pTriggerContextMenu(editor, 'li', '.tox-silver-sink [role="menuitem"]:contains("List properties...")');
        UiFinder.exists(SugarBody.body(), '[role="menuitem"][aria-disabled="true"]:contains("List properties...")');
      });
    });

    it('TINY-9669: Disable numbered list button on noneditable content', () => {
      TinyState.withNoneditableRootEditor(hook.editor(), (editor) => {
        editor.setContent('<div>Noneditable content</div><div contenteditable="true">Editable content</div>');
        TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 2);
        UiFinder.exists(SugarBody.body(), '[aria-label="Numbered list"][aria-disabled="true"]');
        TinySelections.setSelection(editor, [ 1, 0 ], 0, [ 1, 0 ], 2);
        UiFinder.exists(SugarBody.body(), '[aria-label="Numbered list"][aria-disabled="false"]');
      });
    });

    it('TINY-9669: Disable bullet list button on noneditable content', () => {
      TinyState.withNoneditableRootEditor(hook.editor(), (editor) => {
        editor.setContent('<div>Noneditable content</div><div contenteditable="true">Editable content</div>');
        TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 2);
        UiFinder.exists(SugarBody.body(), '[aria-label="Bullet list"][aria-disabled="true"]');
        TinySelections.setSelection(editor, [ 1, 0 ], 0, [ 1, 0 ], 2);
        UiFinder.exists(SugarBody.body(), '[aria-label="Bullet list"][aria-disabled="false"]');
      });
    });
  });
});
