import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { isCaretAfterKoreanCharacter } from 'tinymce/core/keyboard/EnterKey';

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

  const testIsCursorAfterKoreanCharacter = (scenario: Scenario): (() => void) =>
    (() => {
      const editor = hook.editor();
      editor.setContent(scenario.input);
      TinySelections.setCursor(editor, scenario.cursorPath, scenario.offset);
      assert.equal(isCaretAfterKoreanCharacter(editor.selection.getRng()), scenario.result);
    });

  it('TINY-9746: Should return true when cursor is after Hangul character', testIsCursorAfterKoreanCharacter({
    input: '<p>\uAC00</p>',
    cursorPath: [ 0, 0 ],
    offset: 1,
    result: true
  }));

  it('TINY-9746: Should return true when cursor is after Hangul Jamo character', testIsCursorAfterKoreanCharacter({
    input: '<p>\u1100</p>',
    cursorPath: [ 0, 0 ],
    offset: 1,
    result: true
  }));

  it('TINY-9746: Should return true when cursor is after Hangul Compatibility Jamo character', testIsCursorAfterKoreanCharacter({
    input: '<p>\u3130</p>',
    cursorPath: [ 0, 0 ],
    offset: 1,
    result: true
  }));

  it('TINY-9746: Should return true when cursor is after Hangul Jamo Extended-A character', testIsCursorAfterKoreanCharacter({
    input: '<p>\uA960</p>',
    cursorPath: [ 0, 0 ],
    offset: 1,
    result: true
  }));

  it('TINY-9746: Should return true when cursor is after Hangul Jamo Extended-B character', testIsCursorAfterKoreanCharacter({
    input: '<p>\uD7B0</p>',
    cursorPath: [ 0, 0 ],
    offset: 1,
    result: true
  }));

  it('TINY-9746: Should return true when cursor is in middle of Hangul text', testIsCursorAfterKoreanCharacter({
    input: '<p>안녕</p>',
    cursorPath: [ 0, 0 ],
    offset: 1,
    result: true
  }));

  it('TINY-9746: Should return true when cursor is after Hangul text in mixed text', testIsCursorAfterKoreanCharacter({
    input: '<p>안a</p>',
    cursorPath: [ 0, 0 ],
    offset: 1,
    result: true
  }));

  it('TINY-9746: Should return false when cursor is before Hangul text', testIsCursorAfterKoreanCharacter({
    input: '<p>안</p>',
    cursorPath: [ 0, 0 ],
    offset: 0,
    result: false
  }));

  it('TINY-9746: Should return false when cursor is after non-Hangul text in mixed text', testIsCursorAfterKoreanCharacter({
    input: '<p>a안</p>',
    cursorPath: [ 0, 0 ],
    offset: 1,
    result: false
  }));

  it('TINY-9746: Should return false when cursor is before non-Hangul text', testIsCursorAfterKoreanCharacter({
    input: '<p>a</p>',
    cursorPath: [ 0, 0 ],
    offset: 0,
    result: false
  }));

  it('TINY-9746: Should return false when cursor is after non-Hangul text', testIsCursorAfterKoreanCharacter({
    input: '<p>a</p>',
    cursorPath: [ 0, 0 ],
    offset: 1,
    result: false
  }));

  it('TINY-9746: Should return false when cursor is in empty block', testIsCursorAfterKoreanCharacter({
    input: '<p></p>',
    cursorPath: [ 0, 0 ],
    offset: 0,
    result: false
  }));

  it('TINY-9746: Should return false when cursor is after Hangul text block', testIsCursorAfterKoreanCharacter({
    input: '<p>안</p>',
    cursorPath: [ 0 ],
    offset: 1,
    result: false
  }));

  it('TINY-9746: Should return false when cursor is after cef block', testIsCursorAfterKoreanCharacter({
    input: '<div contenteditable="false">a</div>',
    cursorPath: [ 0 ],
    offset: 1,
    result: false
  }));

  it('TINY-9746: Should return false when cursor is after image', testIsCursorAfterKoreanCharacter({
    input: '<img src="about:blank">',
    cursorPath: [ 0 ],
    offset: 1,
    result: false
  }));

  it('TINY-9746: Should return false when selection is non-collapsed', () => {
    const editor = hook.editor();
    editor.setContent('<p>안녕</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 2);
    assert.equal(isCaretAfterKoreanCharacter(editor.selection.getRng()), false);
  });
});
