import { Assertions } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Focus, Hierarchy, SugarBody, SugarNode } from '@ephox/sugar';
import { McEditor, TinyAssertions, TinyDom, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import * as EditorFocus from 'tinymce/core/focus/EditorFocus';

describe('browser.tinymce.core.focus.EditorFocusTest', () => {

  const pCreateInlineEditor = (html: string) => McEditor.pFromHtml<Editor>(html, {
    menubar: false,
    inline: true,
    base_url: '/project/tinymce/js/tinymce'
  });

  const pCreateEditor = (html: string) => McEditor.pFromHtml<Editor>(html, {
    menubar: false,
    base_url: '/project/tinymce/js/tinymce'
  });

  const focusEditor = (editor: Editor) => {
    EditorFocus.focus(editor, false);
  };

  const focusElement = (editor: Editor, elementPath: number[]) => {
    const element = Hierarchy.follow(TinyDom.body(editor), elementPath).filter(SugarNode.isHTMLElement).getOrDie();
    Focus.focus(element);
  };

  const selectBody = () => {
    const sel = document.getSelection() as Selection;
    sel.removeAllRanges();
    const rng = document.createRange();
    rng.selectNode(document.body);
    sel.addRange(rng);
    Focus.focus(SugarBody.body());
  };

  const assertHasFocus = (editor: Editor, elementPath: number[]) => {
    const element = Hierarchy.follow(TinyDom.body(editor), elementPath).getOrDie();
    const activeElement = Focus.active(TinyDom.document(editor)).getOrDie();
    assert.isTrue(EditorFocus.hasFocus(editor), 'Should have focus on the editor');
    Assertions.assertDomEq('Should be the expected activeElement', element, activeElement);
  };

  context('Focus editor', () => {
    it('Focus editor initialized on a div with p', async () => {
      const editor = await pCreateInlineEditor('<div class="tinymce-editor"><p>a</p></div>');
      focusEditor(editor);
      TinyAssertions.assertSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 0);
      McEditor.remove(editor);
    });

    it('Focus editor initialized on a list', async () => {
      const editor = await pCreateInlineEditor('<ul class="tinymce-editor"><li>a</li></ul>');
      focusEditor(editor);
      TinyAssertions.assertSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 0);
      McEditor.remove(editor);
    });

    it('Selection restored on focus with table cE=true', async () => {
      const editor = await pCreateEditor('<div class="tinymce-editor"><p>a</p><div>b<table contenteditable="true"><tbody><tr><td>c</td><td></td></tr></tbody></table></div></div>');
      TinySelections.setSelection(editor, [ 1, 1, 0, 0, 0, 0 ], 0, [ 1, 1, 0, 0, 0, 0 ], 0);
      selectBody();
      focusEditor(editor);
      TinyAssertions.assertSelection(editor, [ 1, 1, 0, 0, 0, 0 ], 0, [ 1, 1, 0, 0, 0, 0 ], 0);
      McEditor.remove(editor);
    });
  });

  context('hasFocus', () => {
    it('Focus on normal paragraph', async () => {
      const editor = await pCreateInlineEditor('<div class="tinymce-editor"><p>a</p></div>');
      focusEditor(editor);
      assertHasFocus(editor, []);
      McEditor.remove(editor);
    });

    it('Focus on cE=true inside a cE=false', async () => {
      const editor = await pCreateInlineEditor('<div class="tinymce-editor"><div contenteditable="false">a<div contenteditable="true">b</div></div></div>');
      TinySelections.setSelection(editor, [ 0, 1, 0 ], 0, [ 0, 1, 0 ], 0);
      focusElement(editor, [ 0, 1 ]);
      assertHasFocus(editor, [ 0, 1 ]);
      McEditor.remove(editor);
    });
  });
});
