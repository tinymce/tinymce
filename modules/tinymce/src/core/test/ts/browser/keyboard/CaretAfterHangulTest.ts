import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { isCaretAfterHangulCharacter } from 'tinymce/core/keyboard/EnterKey';

interface Scenario {
  readonly input: string;
  readonly cursorPath: number[];
  readonly offset: number;
  readonly result: boolean;
}

describe('browser.tinymce.core.keyboard.CursorAfterHangulTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce'
  }, [], true);

  const testIsCursorAfterHangulCharacter = (scenario: Scenario): (() => void) =>
    (() => {
      const editor = hook.editor();
      editor.setContent(scenario.input);
      TinySelections.setCursor(editor, scenario.cursorPath, scenario.offset);
      assert.equal(isCaretAfterHangulCharacter(editor.selection.getRng()), scenario.result);
    });

  it('TINY-9746: Should return true when cursor is after Hangul text', testIsCursorAfterHangulCharacter({
    input: '<p>안</p>',
    cursorPath: [ 0, 0 ],
    offset: 1,
    result: true
  }));

  it('TINY-9746: Should return true when cursor is in middle of Hangul text', testIsCursorAfterHangulCharacter({
    input: '<p>안녕</p>',
    cursorPath: [ 0, 0 ],
    offset: 1,
    result: true
  }));

  it('TINY-9746: Should return true when cursor is after Hangul text in mixed text', testIsCursorAfterHangulCharacter({
    input: '<p>안a</p>',
    cursorPath: [ 0, 0 ],
    offset: 1,
    result: true
  }));

  it('TINY-9746: Should return false when cursor is before Hangul text', testIsCursorAfterHangulCharacter({
    input: '<p>안</p>',
    cursorPath: [ 0, 0 ],
    offset: 0,
    result: false
  }));

  it('TINY-9746: Should return false when cursor is after non-Hangul text in mixed text', testIsCursorAfterHangulCharacter({
    input: '<p>a안</p>',
    cursorPath: [ 0, 0 ],
    offset: 1,
    result: false
  }));

  it('TINY-9746: Should return false when cursor is before non-Hangul text', testIsCursorAfterHangulCharacter({
    input: '<p>a</p>',
    cursorPath: [ 0, 0 ],
    offset: 0,
    result: false
  }));

  it('TINY-9746: Should return false when cursor is after non-Hangul text', testIsCursorAfterHangulCharacter({
    input: '<p>a</p>',
    cursorPath: [ 0, 0 ],
    offset: 1,
    result: false
  }));

  it('TINY-9746: Should return false when cursor is in empty block', testIsCursorAfterHangulCharacter({
    input: '<p></p>',
    cursorPath: [ 0, 0 ],
    offset: 0,
    result: false
  }));

  it('TINY-9746: Should return false when cursor is after Hangul text block', testIsCursorAfterHangulCharacter({
    input: '<p>안</p>',
    cursorPath: [ 0 ],
    offset: 1,
    result: false
  }));

  it('TINY-9746: Should return false when cursor is after cef block', testIsCursorAfterHangulCharacter({
    input: '<div contenteditable="false">a</div>',
    cursorPath: [ 0 ],
    offset: 1,
    result: false
  }));

  it('TINY-9746: Should return false when cursor is after image', testIsCursorAfterHangulCharacter({
    input: '<img src="about:blank">',
    cursorPath: [ 0 ],
    offset: 1,
    result: false
  }));

  it('TINY-9746: Should return false when selection is non-collapsed', () => {
    const editor = hook.editor();
    editor.setContent('<p>안녕</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 2);
    assert.equal(isCaretAfterHangulCharacter(editor.selection.getRng()), false);
  });
});
