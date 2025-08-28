import { describe, it } from '@ephox/bedrock-client';
import { Hierarchy } from '@ephox/sugar';
import { TinyAssertions, TinyContentActions, TinySelections, TinyDom, TinyHooks } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

const clickMiddleOf = (editor: Editor, elementPath: number[], dx: number = 0, dy: number = 0) => {
  const element = Hierarchy.follow(TinyDom.body(editor), elementPath).getOrDie().dom as HTMLElement;
  const rect = element.getBoundingClientRect();
  const clientX = (rect.left + rect.width / 2) + dx;
  const clientY = (rect.top + rect.height / 2) + dy;

  const event = { target: element as EventTarget, clientX, clientY } as MouseEvent;
  editor.dispatch('mousedown', { ...event });
  editor.dispatch('mouseup', { ...event });
  editor.dispatch('click', { ...event });
};

describe('browser.tinymce.core.ClickContentEditableFalseTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    indent: false
  }, [], true);

  it('Click on content editable false', () => {
    const editor = hook.editor();
    editor.setContent('<p contenteditable="false">a</p>');
    clickMiddleOf(editor, [ 1 ]);
    TinyAssertions.assertSelection(editor, [], 0, [], 1);
  });

  it('TINY-8169: Click on normal paragraph should not move caret to noneditable', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p><p contenteditable="false">b</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 0);
    clickMiddleOf(editor, [ 0 ]);
    TinyAssertions.assertCursor(editor, [ 0, 0 ], 0);
  });

  it('TINY-8169: Click above left of noneditable should place the fake caret before the noneditable', () => {
    const editor = hook.editor();
    editor.setContent('<div style="width: 30px; height: 30px; margin-bottom: 10px">a</div><div contenteditable="false">b</div>');
    clickMiddleOf(editor, [ 0 ], -15, 20);
    TinyAssertions.assertCursor(editor, [ 1 ], 0);
    TinyAssertions.assertContentPresence(editor, {
      'p[data-mce-caret="before"]': 1,
      'div.mce-visual-caret': 1
    });
  });

  it('Click on content editable false inside content editable true', () => {
    const editor = hook.editor();
    editor.setContent('<div contenteditable="true"><p contenteditable="false">a</p></div>');
    clickMiddleOf(editor, [ 0, 1 ]);
    TinyAssertions.assertSelection(editor, [ 0 ], 0, [ 0 ], 1);
  });

  it('Click on content editable false inside content editable true and then on content editable true and type', () => {
    const editor = hook.editor();
    editor.setContent('<div contenteditable="true"><p contenteditable="false">a</p><p>b</p></div>');
    clickMiddleOf(editor, [ 0, 1 ]);
    clickMiddleOf(editor, [ 0, 1 ]);
    TinyAssertions.assertSelection(editor, [ 0, 1, 0 ], 1, [ 0, 1, 0 ], 1);
    TinyContentActions.type(editor, 'c');
    TinyAssertions.assertContent(editor, '<div contenteditable="true"><p contenteditable="false">a</p><p>bc</p></div>');
    TinyAssertions.assertSelection(editor, [ 0, 1, 0 ], 2, [ 0, 1, 0 ], 2);
  });

  it('Click on content editable false then outside on content editable inherit', () => {
    const editor = hook.editor();
    editor.setContent('<p contenteditable="false">a</p><p>a</p>');
    clickMiddleOf(editor, [ 1 ]);
    clickMiddleOf(editor, [ 1 ]);
    TinyAssertions.assertSelection(editor, [ 1, 0 ], 1, [ 1, 0 ], 1);
  });
});
