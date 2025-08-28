import { describe, it } from '@ephox/bedrock-client';
import { Hierarchy } from '@ephox/sugar';
import { TinyAssertions, TinyDom, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import * as DeleteElement from 'tinymce/core/delete/DeleteElement';

describe('browser.tinymce.core.delete.DeleteElementTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    add_unload_trigger: false,
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, [], true);

  const deleteElementPath = (editor: Editor, forward: boolean, path: number[]) => {
    const element = Hierarchy.follow(TinyDom.body(editor), path).getOrDie();
    DeleteElement.deleteElement(editor, forward, element);
  };

  const assertCaretDirection = (editor: Editor, expectedCaretData: 'before' | 'after') => {
    assert.equal(editor.selection.getNode().getAttribute('data-mce-caret'), expectedCaretData, 'Should have the right caret data');
  };

  it('Delete image forwards', () => {
    const editor = hook.editor();
    editor.setContent('<p><img src="#1"></p>');
    TinySelections.setCursor(editor, [ 0 ], 0);
    deleteElementPath(editor, true, [ 0, 0 ]);
    TinyAssertions.assertContent(editor, '');
    TinyAssertions.assertSelection(editor, [ 0 ], 0, [ 0 ], 0);
  });

  it('Delete image backwards', () => {
    const editor = hook.editor();
    editor.setContent('<p><img src="#1"></p>');
    TinySelections.setCursor(editor, [ 0 ], 1);
    deleteElementPath(editor, false, [ 0, 0 ]);
    TinyAssertions.assertContent(editor, '');
    TinyAssertions.assertSelection(editor, [ 0 ], 0, [ 0 ], 0);
  });

  it('Delete first image forwards caret before', () => {
    const editor = hook.editor();
    editor.setContent('<p><img src="#1"><img src="#2"></p>');
    TinySelections.setCursor(editor, [ 0 ], 0);
    deleteElementPath(editor, true, [ 0, 0 ]);
    TinyAssertions.assertContent(editor, '<p><img src="#2"></p>');
    TinyAssertions.assertSelection(editor, [ 0 ], 0, [ 0 ], 0);
  });

  it('Delete first image forwards caret after', () => {
    const editor = hook.editor();
    editor.setContent('<p><img src="#1"><img src="#2"></p>');
    TinySelections.setCursor(editor, [ 0 ], 1);
    deleteElementPath(editor, true, [ 0, 0 ]);
    TinyAssertions.assertContent(editor, '<p><img src="#2"></p>');
    TinyAssertions.assertSelection(editor, [ 0 ], 0, [ 0 ], 0);
  });

  it('Delete first image backwards', () => {
    const editor = hook.editor();
    editor.setContent('<p><img src="#1"><img src="#2"></p>');
    TinySelections.setCursor(editor, [ 0 ], 2);
    deleteElementPath(editor, false, [ 0, 0 ]);
    TinyAssertions.assertContent(editor, '<p><img src="#2"></p>');
    TinyAssertions.assertSelection(editor, [ 0 ], 0, [ 0 ], 0);
  });

  it('Delete second image forwards caret before', () => {
    const editor = hook.editor();
    editor.setContent('<p><img src="#1"><img src="#2"></p>');
    TinySelections.setCursor(editor, [ 0 ], 1);
    deleteElementPath(editor, true, [ 0, 1 ]);
    TinyAssertions.assertContent(editor, '<p><img src="#1"></p>');
    TinyAssertions.assertSelection(editor, [ 0 ], 1, [ 0 ], 1);
  });

  it('Delete second image forwards caret after', () => {
    const editor = hook.editor();
    editor.setContent('<p><img src="#1"><img src="#2"></p>');
    TinySelections.setCursor(editor, [ 0 ], 2);
    deleteElementPath(editor, true, [ 0, 1 ]);
    TinyAssertions.assertContent(editor, '<p><img src="#1"></p>');
    TinyAssertions.assertSelection(editor, [ 0 ], 1, [ 0 ], 1);
  });

  it('Delete second image backwards caret before', () => {
    const editor = hook.editor();
    editor.setContent('<p><img src="#1"><img src="#2"></p>');
    TinySelections.setCursor(editor, [ 0 ], 1);
    deleteElementPath(editor, false, [ 0, 1 ]);
    TinyAssertions.assertContent(editor, '<p><img src="#1"></p>');
    TinyAssertions.assertSelection(editor, [ 0 ], 1, [ 0 ], 1);
  });

  it('Delete second image backwards caret after', () => {
    const editor = hook.editor();
    editor.setContent('<p><img src="#1"><img src="#2"></p>');
    TinySelections.setCursor(editor, [ 0 ], 2);
    deleteElementPath(editor, false, [ 0, 1 ]);
    TinyAssertions.assertContent(editor, '<p><img src="#1"></p>');
    TinyAssertions.assertSelection(editor, [ 0 ], 1, [ 0 ], 1);
  });

  it('Delete forwards on paragraph to next paragraph with caret position (text)', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p><p>b</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 1);
    deleteElementPath(editor, true, [ 0 ]);
    TinyAssertions.assertContent(editor, '<p>b</p>');
    TinyAssertions.assertSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 0);
  });

  it('Delete backwards on paragraph to previous paragraph with caret position (text)', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p><p>b</p>');
    TinySelections.setCursor(editor, [ 1, 0 ], 0);
    deleteElementPath(editor, false, [ 1 ]);
    TinyAssertions.assertContent(editor, '<p>a</p>');
    TinyAssertions.assertSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 1);
  });

  it('Delete forwards on paragraph to previous paragraph with caret position (text)', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p><p>b</p>');
    TinySelections.setCursor(editor, [ 1, 0 ], 1);
    deleteElementPath(editor, true, [ 1 ]);
    TinyAssertions.assertContent(editor, '<p>a</p>');
    TinyAssertions.assertSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 1);
  });

  it('Delete backwards on paragraph to next paragraph with caret position (text)', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p><p>b</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 0);
    deleteElementPath(editor, false, [ 0 ]);
    TinyAssertions.assertContent(editor, '<p>b</p>');
    TinyAssertions.assertSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 0);
  });

  it('Delete forwards paragraph before paragraph with caret position (element)', () => {
    const editor = hook.editor();
    editor.setContent('<p><img src="#1" /></p><p><img src="#2" /></p>');
    TinySelections.setCursor(editor, [ 0 ], 1);
    deleteElementPath(editor, true, [ 0 ]);
    TinyAssertions.assertContent(editor, '<p><img src="#2"></p>');
    TinyAssertions.assertSelection(editor, [ 0 ], 0, [ 0 ], 0);
  });

  it('Delete backwards paragraph after paragraph with caret position (element)', () => {
    const editor = hook.editor();
    editor.setContent('<p><img src="#1" /></p><p><img src="#2" /></p>');
    TinySelections.setCursor(editor, [ 1 ], 0);
    deleteElementPath(editor, false, [ 0 ]);
    TinyAssertions.assertContent(editor, '<p><img src="#2"></p>');
    TinyAssertions.assertSelection(editor, [ 0 ], 0, [ 0 ], 0);
  });

  it('Delete backwards on cef block between cef blocks', () => {
    const editor = hook.editor();
    editor.setContent('<p contenteditable="false">a</p><p contenteditable="false">b</p><p contenteditable="false">c</p>');
    TinySelections.setSelection(editor, [], 1, [], 2);
    deleteElementPath(editor, false, [ 1 ]);
    TinyAssertions.assertContent(editor, '<p contenteditable="false">a</p><p contenteditable="false">c</p>');
    TinyAssertions.assertSelection(editor, [ 1 ], 0, [ 1 ], 0);
    assertCaretDirection(editor, 'after');
  });

  it('Delete forwards on cef block between cef blocks', () => {
    const editor = hook.editor();
    editor.setContent('<p contenteditable="false">a</p><p contenteditable="false">b</p><p contenteditable="false">c</p>');
    TinySelections.setSelection(editor, [], 1, [], 2);
    deleteElementPath(editor, true, [ 1 ]);
    TinyAssertions.assertContent(editor, '<p contenteditable="false">a</p><p contenteditable="false">c</p>');
    TinyAssertions.assertSelection(editor, [ 1 ], 0, [ 1 ], 0);
    assertCaretDirection(editor, 'before');
  });

  it('Delete element adjacent text nodes forward', () => {
    const editor = hook.editor();
    editor.setContent('<p>a<br>b</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 1);
    deleteElementPath(editor, true, [ 0, 1 ]);
    TinyAssertions.assertContent(editor, '<p>ab</p>');
    TinyAssertions.assertSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 1);
  });

  it('Delete element adjacent text nodes backwards', () => {
    const editor = hook.editor();
    editor.setContent('<p>a<br>b</p>');
    TinySelections.setCursor(editor, [ 0, 2 ], 0);
    deleteElementPath(editor, false, [ 0, 1 ]);
    TinyAssertions.assertContent(editor, '<p>ab</p>');
    TinyAssertions.assertSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 1);
  });

  it('Delete inline element adjacent text nodes forwards', () => {
    const editor = hook.editor();
    editor.setContent('<p>a <strong>b</strong> c</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 2);
    deleteElementPath(editor, true, [ 0, 1 ]);
    TinyAssertions.assertContent(editor, '<p>a &nbsp;c</p>');
    TinyAssertions.assertSelection(editor, [ 0, 0 ], 2, [ 0, 0 ], 2);
  });

  it('Delete inline element adjacent text nodes backwards', () => {
    const editor = hook.editor();
    editor.setContent('<p>a&nbsp; <strong>b</strong> &nbsp;c</p>');
    TinySelections.setCursor(editor, [ 0, 2 ], 0);
    deleteElementPath(editor, false, [ 0, 1 ]);
    TinyAssertions.assertContent(editor, '<p>a &nbsp; &nbsp;c</p>');
    TinyAssertions.assertSelection(editor, [ 0, 0 ], 3, [ 0, 0 ], 3);
  });

  it('Delete inline element adjacent text nodes, single space', () => {
    const editor = hook.editor();
    editor.setContent('<p>a <strong>b</strong>c</p>');
    TinySelections.setCursor(editor, [ 0, 1 ], 0);
    deleteElementPath(editor, false, [ 0, 1 ]);
    TinyAssertions.assertContent(editor, '<p>a c</p>');
    TinyAssertions.assertSelection(editor, [ 0, 0 ], 2, [ 0, 0 ], 2);
  });

  it('Delete inline element leading only text nodes', () => {
    const editor = hook.editor();
    editor.setContent('<p>a <strong>b</strong></p>');
    TinySelections.setCursor(editor, [ 0, 1 ], 0);
    deleteElementPath(editor, false, [ 0, 1 ]);
    TinyAssertions.assertContent(editor, '<p>a&nbsp;</p>');
    TinyAssertions.assertSelection(editor, [ 0, 0 ], 2, [ 0, 0 ], 2);
  });

  it('Delete inline element trailing only text nodes', () => {
    const editor = hook.editor();
    editor.setContent('<p><strong>a</strong> b</p>');
    TinySelections.setCursor(editor, [ 0, 1 ], 0);
    deleteElementPath(editor, false, [ 0, 0 ]);
    TinyAssertions.assertContent(editor, '<p>&nbsp;b</p>');
    TinyAssertions.assertSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 0);
  });
});
