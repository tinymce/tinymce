import { ApproxStructure, Keys } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Unicode } from '@ephox/katamari';
import { TinyAssertions, TinyContentActions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import * as Zwsp from 'tinymce/core/text/Zwsp';

import * as KeyUtils from '../../module/test/KeyUtils';

describe('browser.tinymce.core.delete.CaretBoundaryDeleteTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce'
  }, [], true);

  const cefStruct = (text: string) => ApproxStructure.build((s, str) => s.element('span', {
    attrs: {
      contenteditable: str.is('false')
    },
    children: [
      s.text(str.is(text))
    ]
  }));

  const videoStruct = ApproxStructure.build((s, str) => s.element('video', {
    attrs: {
      controls: str.is('controls')
    },
    children: [
      s.element('source', {
        attrs: {
          src: str.is('custom/video.mp4')
        }
      })
    ]
  }));

  it('TINY-2998: Should delete single space between cef elements', () => {
    const editor = hook.editor();
    editor.setContent('<p><span contenteditable="false">a</span>&nbsp;<span contenteditable="false">b</span>&nbsp;</p>');
    TinySelections.setSelection(editor, [ 0, 2 ], 1, [ 0, 2 ], 1);
    TinyContentActions.keystroke(editor, Keys.backspace());
    TinyAssertions.assertSelection(editor, [ 0, 1 ], 1, [ 0, 1 ], 1);
    TinyAssertions.assertContentStructure(editor, ApproxStructure.build((s, str) =>
      s.element('body', {
        children: [
          s.element('p', {
            children: [
              cefStruct('a'),
              s.text(str.is(Zwsp.ZWSP)),
              cefStruct('b'),
              s.text(str.is(Unicode.nbsp))
            ]
          })
        ]
      })
    ));
  });

  it('TINY-2998: Should add fake caret if we delete content beside cef elements', () => {
    const editor = hook.editor();
    editor.setContent('<p><span contenteditable="false">a</span>&nbsp;</p>');
    TinySelections.setSelection(editor, [ 0, 2 ], 1, [ 0, 2 ], 1);
    TinyContentActions.keystroke(editor, Keys.backspace());
    TinyAssertions.assertSelection(editor, [ 0, 1 ], 1, [ 0, 1 ], 1);
    TinyAssertions.assertContentStructure(editor, ApproxStructure.build((s, str) =>
      s.element('body', {
        children: [
          s.element('p', {
            children: [
              cefStruct('a'),
              s.text(str.is(Zwsp.ZWSP))
            ]
          })
        ]
      })
    ));
  });

  it('TINY-2998: Should add fake caret if we delete range beside cef', () => {
    const editor = hook.editor();
    editor.setContent('<p><span contenteditable="false">a</span>&nbsp;abc</p>');
    TinySelections.setSelection(editor, [ 0, 2 ], 0, [ 0, 2 ], 4);
    TinyContentActions.keystroke(editor, Keys.backspace());
    TinyAssertions.assertSelection(editor, [ 0, 1 ], 1, [ 0, 1 ], 1);
    TinyAssertions.assertContentStructure(editor, ApproxStructure.build((s, str) =>
      s.element('body', {
        children: [
          s.element('p', {
            children: [
              cefStruct('a'),
              s.text(str.is(Zwsp.ZWSP))
            ]
          })
        ]
      })
    ));
  });

  it('TINY-4211: Should add fake caret if we type and then delete content beside media elements', () => {
    const editor = hook.editor();
    editor.setContent('<p><video controls="controls"><source src="custom/video.mp4" /></video></p>');
    TinySelections.select(editor, 'video', []);
    // Pressing right will add a fake caret, which will be removed when we press backspace
    TinyContentActions.keystroke(editor, Keys.right());
    KeyUtils.type(editor, 'a');
    TinyAssertions.assertSelection(editor, [ 0, 1 ], 2, [ 0, 1 ], 2);
    TinyContentActions.keystroke(editor, Keys.backspace());
    TinyAssertions.assertSelection(editor, [ 0, 1 ], 1, [ 0, 1 ], 1);
    TinyAssertions.assertContentStructure(editor, ApproxStructure.build((s, str) =>
      s.element('body', {
        children: [
          s.element('p', {
            children: [
              videoStruct,
              s.text(str.is(Zwsp.ZWSP))
            ]
          })
        ]
      })
    ));
  });
});
