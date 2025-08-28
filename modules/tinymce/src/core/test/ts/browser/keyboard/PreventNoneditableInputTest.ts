import { Cursors } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { TinyAssertions, TinyDom, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

import * as InputEventUtils from '../../module/test/InputEventUtils';

describe('browser.tinymce.core.keyboard.PreventNoneditableInputTest', () => {
  const isSafari = PlatformDetection.detect().browser.isSafari();

  const hook = TinyHooks.bddSetupLight<Editor>({
    indent: false,
    base_url: '/project/tinymce/js/tinymce',
    extended_valid_elements: 'svg[*]'
  }, []);

  it('TINY-10271: Prevent input events inside a SVG element', function () {
    // Safari normalizes the selection so that it is outside the SVG so we can't setup a test that fails
    if (isSafari) {
      this.skip();
    }

    const inputEvents: Array<{ inputType: string; defaultPrevented: boolean }> = [];
    const editor = hook.editor();
    const collect = ({ inputType, defaultPrevented }: InputEvent) => {
      inputEvents.push({ inputType, defaultPrevented });
    };
    const initialContent = '<svg><circle cx="50" cy="50" r="50"></circle></svg>';

    editor.on('beforeinput', collect);
    editor.setContent(initialContent);
    TinySelections.setSelection(editor, [ 0 ], 0, [ 0 ], 1);
    editor.dispatch('beforeinput', InputEventUtils.makeInputEvent('beforeinput', { inputType: 'deleteContent' }));
    editor.dispatch('beforeinput', InputEventUtils.makeInputEvent('beforeinput', { inputType: 'insertText', data: 'x' }));
    editor.off('beforeinput', collect);

    assert.deepEqual(
      inputEvents,
      [
        { inputType: 'deleteContent', defaultPrevented: true },
        { inputType: 'insertText', defaultPrevented: true }
      ],
      'Events should be prevented'
    );
    TinyAssertions.assertContent(editor, initialContent);
  });

  it('TINY-10347: Delete/backspace into SVG should be prevented', () => {
    const inputEvents: Array<{ inputType: string; defaultPrevented: boolean }> = [];
    const editor = hook.editor();
    const collect = ({ inputType, defaultPrevented }: InputEvent) => {
      inputEvents.push({ inputType, defaultPrevented });
    };
    const makeRange = (path: Cursors.CursorPath) => {
      const { start, soffset, finish, foffset } = Cursors.calculate(TinyDom.body(editor), path);

      return new window.StaticRange({ startContainer: start.dom, startOffset: soffset, endContainer: finish.dom, endOffset: foffset });
    };
    const initialContent = '<p>foo</p><svg><circle cx="50" cy="50" r="50"></circle></svg><p>bar</p>';

    editor.on('beforeinput', collect);
    editor.setContent(initialContent);
    TinySelections.setCursor(editor, [ 0, 0 ], 3);
    editor.dispatch('beforeinput',
      InputEventUtils.makeInputEvent('beforeinput', {
        inputType: 'deleteContent',
        getTargetRanges: Fun.constant([ makeRange({ startPath: [ 0, 0 ], soffset: 3, finishPath: [ 1 ], foffset: 1 }) ])
      })
    );
    editor.dispatch('beforeinput',
      InputEventUtils.makeInputEvent('beforeinput', {
        inputType: 'deleteContent',
        getTargetRanges: Fun.constant([ makeRange({ startPath: [ 1 ], soffset: 0, finishPath: [ 2 ], foffset: 0 }) ])
      })
    );
    editor.off('beforeinput', collect);

    assert.deepEqual(
      inputEvents,
      [
        { inputType: 'deleteContent', defaultPrevented: true },
        { inputType: 'deleteContent', defaultPrevented: true }
      ],
      'Events should be prevented'
    );
    TinyAssertions.assertContent(editor, initialContent);
  });
});
