import { Keyboard, Keys } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyDom, TinyHooks, TinySelections } from '@ephox/mcagar';

import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';
import * as TypeText from '../../module/test/TypeText';

describe('browser.tinymce.core.keyboard.TypeTextAtCef', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    add_unload_trigger: false,
    base_url: '/project/tinymce/js/tinymce'
  }, [ Theme ], true);

  it('Type text before cef inline element', () => {
    const editor = hook.editor();
    editor.setContent('<p><span contenteditable="false">a</span></p>');
    TinySelections.select(editor, 'p', [ 1 ]);
    Keyboard.activeKeystroke(TinyDom.document(editor), Keys.left(), { });
    TypeText.typeContentAtSelection(TinyDom.document(editor), 'bc');
    TinyAssertions.assertSelection(editor, [ 0, 0 ], 2, [ 0, 0 ], 2);
    TinyAssertions.assertContent(editor, '<p>bc<span contenteditable="false">a</span></p>');
  });

  it('Type after cef inline element', () => {
    const editor = hook.editor();
    editor.setContent('<p><span contenteditable="false">a</span></p>');
    TinySelections.select(editor, 'p', [ 1 ]);
    Keyboard.activeKeystroke(TinyDom.document(editor), Keys.right(), {});
    TypeText.typeContentAtSelection(TinyDom.document(editor), 'bc');
    TinyAssertions.assertSelection(editor, [ 0, 1 ], 3, [ 0, 1 ], 3);
    TinyAssertions.assertContent(editor, '<p><span contenteditable="false">a</span>bc</p>');
  });

  it('Type between cef inline elements', () => {
    const editor = hook.editor();
    editor.setContent('<p><span contenteditable="false">a</span>&nbsp;<span contenteditable="false">b</span></p>');
    TinySelections.select(editor, 'p', [ 3 ]);
    Keyboard.activeKeystroke(TinyDom.document(editor), Keys.left(), {});
    Keyboard.activeKeystroke(TinyDom.document(editor), Keys.left(), {});
    TypeText.typeContentAtSelection(TinyDom.document(editor), 'bc');
    TinyAssertions.assertSelection(editor, [ 0, 1 ], 3, [ 0, 1 ], 3);
    TinyAssertions.assertContent(editor, '<p><span contenteditable="false">a</span>bc&nbsp;<span contenteditable="false">b</span></p>');
  });
});
