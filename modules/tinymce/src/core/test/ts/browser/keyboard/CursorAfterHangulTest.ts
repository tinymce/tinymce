import { describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { isCursorAfterHangulCharacter } from 'tinymce/core/keyboard/EnterKey';

interface Scenario {
  label: string;
  input: string;
  cursorPath: number[];
  offset: number;
  result: boolean;
}

describe('browser.tinymce.core.keyboard.CursorAfterHangulTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce'
  }, [], true);

  const scenarios: Scenario[] = [
    {
      label: 'Should return true when cursor is after Hangul text',
      input: '<p>안</p>',
      cursorPath: [ 0, 0 ],
      offset: 1,
      result: true
    }, {
      label: 'Should return true when cursor is in middle of Hangul text',
      input: '<p>안녕</p>',
      cursorPath: [ 0, 0 ],
      offset: 1,
      result: true
    }, {
      label: 'Should return false when cursor is before Hangul text',
      input: '<p>안</p>',
      cursorPath: [ 0, 0 ],
      offset: 0,
      result: false
    }, {
      label: 'Should return false when cursor is before non-Hangul text',
      input: '<p>a</p>',
      cursorPath: [ 0, 0 ],
      offset: 0,
      result: false
    }, {
      label: 'Should return false when cursor is after of non-Hangul text',
      input: '<p>a</p>',
      cursorPath: [ 0, 0 ],
      offset: 1,
      result: false
    }, {
      label: 'Should return false when cursor is in empty block',
      input: '<p></p>',
      cursorPath: [ 0, 0 ],
      offset: 0,
      result: false
    }, {
      label: 'Should return false when cursor is after Hangul text block',
      input: '<p>안</p>',
      cursorPath: [ 0 ],
      offset: 1,
      result: false
    }, {
      label: 'Should return false when cursor is after cef block',
      input: '<div contenteditable="false">a</div>',
      cursorPath: [ 0 ],
      offset: 1,
      result: false
    }, {
      label: 'Should return false when cursor is after image',
      input: '<img src="about:blank">',
      cursorPath: [ 0 ],
      offset: 1,
      result: false
    }];

  Arr.each(scenarios, (scenario) => {
    it(`TINY-9746: ${scenario.label}`, () => {
      const editor = hook.editor();
      editor.setContent(scenario.input);
      TinySelections.setCursor(editor, scenario.cursorPath, scenario.offset);
      assert.equal(isCursorAfterHangulCharacter(editor.selection.getRng()), scenario.result);
    });
  });

  it('TINY-9746: Should return false when selection is non-collapsed', () => {
    const editor = hook.editor();
    editor.setContent('<p>안녕</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 2);
    assert.equal(isCursorAfterHangulCharacter(editor.selection.getRng()), false);
  });
});
