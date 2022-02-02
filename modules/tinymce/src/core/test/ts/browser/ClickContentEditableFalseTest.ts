import { describe, it } from '@ephox/bedrock-client';
import { Hierarchy } from '@ephox/sugar';
import { TinyAssertions, TinyContentActions, TinyDom, TinyHooks } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';

const clickMiddleOf = (editor: Editor, elementPath: number[]) => {
  const element = Hierarchy.follow(TinyDom.body(editor), elementPath).getOrDie().dom as HTMLElement;
  const rect = element.getBoundingClientRect();
  const clientX = rect.left + rect.width / 2;
  const clientY = rect.top + rect.height / 2;

  const event = { target: element as EventTarget, clientX, clientY } as MouseEvent;
  editor.fire('mousedown', { ...event });
  editor.fire('mouseup', { ...event });
  editor.fire('click', { ...event });
};

describe('browser.tinymce.core.ClickContentEditableFalseTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    indent: false
  }, [ Theme ], true);

  it('Click on content editable false', () => {
    const editor = hook.editor();
    editor.setContent('<p contenteditable="false">a</p>');
    clickMiddleOf(editor, [ 1 ]);
    TinyAssertions.assertSelection(editor, [], 0, [], 1);
  });

  it('Click on content editable false inside content editable true', () => {
    const editor = hook.editor();
    editor.setContent('<div contenteditable="true"><p contenteditable="false">a</p></div>');
    clickMiddleOf(editor, [ 0, 1 ]);
    TinyAssertions.assertSelection(editor, [ 0 ], 0, [ 0 ], 1);
  });

  it('Click on content editable true inside content editable false', () => {
    const editor = hook.editor();
    editor.setContent('<div contenteditable="false"><p contenteditable="true">a</p></div>');
    clickMiddleOf(editor, [ 1, 0 ]);
    TinyAssertions.assertSelection(editor, [ 0, 0, 0 ], 1, [ 0, 0, 0 ], 1);
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
