import { Keys } from '@ephox/agar';
import { beforeEach, context, describe, it } from '@ephox/bedrock-client';
import { PlatformDetection } from '@ephox/sand';
import { TinyAssertions, TinyContentActions, TinyHooks, TinySelections, TinyState } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.keyboard.SpaceKeyTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, []);

  const isFirefox = PlatformDetection.detect().browser.isFirefox();

  beforeEach(() => {
    hook.editor().focus();
  });

  context('Space key around inline boundary elements', () => {
    it('Press space at beginning of inline boundary inserting nbsp', () => {
      const inputEvents: Array<{ inputType: string; data: string | null }> = [];
      const editor = hook.editor();
      const collect = ({ inputType, data }: InputEvent) => {
        inputEvents.push({ inputType, data });
      };

      editor.on('input', collect);
      editor.setContent('<p>a <a href="#">b</a> c</p>');
      TinySelections.setCursor(editor, [ 0, 1, 0 ], 0);
      editor.nodeChanged();
      TinyContentActions.keystroke(editor, Keys.space());
      editor.off('input', collect);

      TinyAssertions.assertSelection(editor, [ 0, 1, 0 ], 1, [ 0, 1, 0 ], 1);
      assert.deepEqual([{ inputType: 'insertText', data: ' ' }], inputEvents, 'Events not fired as expected');
      TinyAssertions.assertContent(editor, '<p>a <a href="#">&nbsp;b</a> c</p>');
    });

    it('Press space at end of inline boundary inserting nbsp', () => {
      const editor = hook.editor();
      editor.setContent('<p>a <a href="#">b</a> c</p>');
      TinySelections.setCursor(editor, [ 0, 1, 0 ], 1);
      editor.nodeChanged();
      TinyContentActions.keystroke(editor, Keys.space());
      TinyAssertions.assertSelection(editor, [ 0, 1, 0 ], 2, [ 0, 1, 0 ], 2);
      TinyAssertions.assertContent(editor, '<p>a <a href="#">b&nbsp;</a> c</p>');
    });

    it('Press space at beginning of inline boundary inserting space', () => {
      const editor = hook.editor();
      editor.setContent('<p>a<a href="#">b</a>c</p>');
      TinySelections.setCursor(editor, [ 0, 1, 0 ], 0);
      editor.nodeChanged();
      TinyContentActions.keystroke(editor, Keys.space());
      TinyAssertions.assertSelection(editor, [ 0, 1, 0 ], 1, [ 0, 1, 0 ], 1);
      TinyAssertions.assertContent(editor, '<p>a<a href="#"> b</a>c</p>');
    });

    it('Press space at end of inline boundary inserting space', () => {
      const editor = hook.editor();
      editor.setContent('<p>a<a href="#">b</a>c</p>');
      TinySelections.setCursor(editor, [ 0, 1, 0 ], 1);
      editor.nodeChanged();
      TinyContentActions.keystroke(editor, Keys.space());
      TinyAssertions.assertSelection(editor, [ 0, 1, 0 ], 2, [ 0, 1, 0 ], 2);
      TinyAssertions.assertContent(editor, '<p>a<a href="#">b </a>c</p>');
    });

    it('Press space at start of inline boundary with leading space inserting nbsp', () => {
      const editor = hook.editor();
      editor.setContent('<p>a<a href="#"> b</a>c</p>');
      TinySelections.setCursor(editor, [ 0, 1, 0 ], 0);
      editor.nodeChanged();
      TinyContentActions.keystroke(editor, Keys.space());
      TinyAssertions.assertSelection(editor, [ 0, 1, 0 ], 1, [ 0, 1, 0 ], 1);
      TinyAssertions.assertContent(editor, '<p>a<a href="#">&nbsp; b</a>c</p>');
    });

    it('Press space at end of inline boundary with trailing space inserting nbsp', () => {
      const editor = hook.editor();
      editor.setContent('<p>a<a href="#">b </a>c</p>');
      TinySelections.setCursor(editor, [ 0, 1, 0 ], 2);
      editor.nodeChanged();
      TinyContentActions.keystroke(editor, Keys.space());
      TinyAssertions.assertSelection(editor, [ 0, 1, 0 ], 3, [ 0, 1, 0 ], 3);
      TinyAssertions.assertContent(editor, '<p>a<a href="#">b &nbsp;</a>c</p>');
    });

    it('TINY-9964: Pressing space inside a summary should insert a space character on Firefox', function () {
      if (!isFirefox) {
        this.skip();
      }

      const editor = hook.editor();
      editor.setContent('<details><summary>ab</summary><div>content</div></details>');
      TinySelections.setCursor(editor, [ 0, 0, 0 ], 1);
      TinyContentActions.keystroke(editor, Keys.space());
      TinyAssertions.assertContent(editor, '<details><summary>a b</summary><div>content</div></details>');
    });

    it('TINY-9964: Pressing space on selected contents inside a summary should insert a space character on Firefox', function () {
      if (!isFirefox) {
        this.skip();
      }

      const editor = hook.editor();
      editor.setContent('<details><summary>abc</summary><div>content</div></details>');
      TinySelections.setSelection(editor, [ 0, 0, 0 ], 1, [ 0, 0, 0 ], 2);
      TinyContentActions.keystroke(editor, Keys.space());
      TinyAssertions.assertContent(editor, '<details><summary>a c</summary><div>content</div></details>');
    });

    it('TINY-9964: Pressing space on selected contents inside non-editable content inside a summary should not insert a space character on Firefox', function () {
      if (!isFirefox) {
        this.skip();
      }

      TinyState.withNoneditableRootEditor(hook.editor(), (editor) => {
        editor.setContent('<details><summary>abc</summary><div>content</div></details>');
        TinySelections.setSelection(editor, [ 0, 0, 0 ], 1, [ 0, 0, 0 ], 2);
        TinyContentActions.keystroke(editor, Keys.space());
        TinyAssertions.assertContent(editor, '<details><summary>abc</summary><div>content</div></details>');
      });
    });

    it('TINY-9964: Pressing space two times inside a summary should insert a space character and produce a single undo level on Firefox', function () {
      if (!isFirefox) {
        this.skip();
      }

      const editor = hook.editor();
      editor.setContent('<details><summary>ab</summary><div>content</div></details>');
      TinySelections.setCursor(editor, [ 0, 0, 0 ], 1);
      TinyContentActions.keystroke(editor, Keys.space());
      TinyContentActions.keystroke(editor, Keys.space());
      TinyAssertions.assertContent(editor, '<details><summary>a &nbsp;b</summary><div>content</div></details>');
      editor.undoManager.undo();
      TinyAssertions.assertContent(editor, '<details><summary>ab</summary><div>content</div></details>');
    });

  });
});
