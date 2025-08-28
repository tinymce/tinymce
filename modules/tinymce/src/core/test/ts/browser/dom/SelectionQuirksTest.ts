import { Keys, Monitor, Mouse } from '@ephox/agar';
import { before, describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyContentActions, TinyDom, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Env from 'tinymce/core/api/Env';

describe('browser.tinymce.core.dom.SelectionQuirksTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce'
  }, [], true);
  let normalizeMonitor: Monitor<Range>;

  before(() => {
    const editor = hook.editor();
    // hijack editor.selection.normalize() to count how many times it will be invoked
    normalizeMonitor = Monitor(0, editor.selection.normalize);
    editor.selection.normalize = normalizeMonitor.run;
  });

  const resetNormalizeCounter = () => normalizeMonitor.clear();

  const assertNormalizeCounter = (expected: number) => {
    assert.equal(normalizeMonitor.get(), expected, 'checking normalization counter');
  };

  it('Test normalization for floated images', () => {
    const editor = hook.editor();
    editor.setContent('<p>a<img src="about:blank" style="float: right"></p>');
    TinySelections.setSelection(editor, [ 0 ], 1, [ 0 ], 2);
    const selection = editor.selection.getSel();
    assert.equal(selection?.anchorNode?.nodeName, 'P', 'Anchor node should be the paragraph not the text node');
    assert.equal(selection?.anchorOffset, 1, 'Anchor offset should be the element index');
  });

  it('Normalize on key events when range is collapsed', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p><p>b</p>');
    TinySelections.setSelection(editor, [], 1, [], 1);
    TinyContentActions.keystroke(editor, Keys.escape());
    TinyAssertions.assertSelection(editor, [ 1, 0 ], 0, [ 1, 0 ], 0);
  });

  it('Normalize on mouse events when range is expanded', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p><p>b</p>');
    TinySelections.setSelection(editor, [], 0, [], 1);
    Mouse.trueClick(TinyDom.body(editor));
    TinyAssertions.assertSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 1);
  });

  it('Normalize on mouse events when range is collapsed', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p><p>b</p>');
    TinySelections.setSelection(editor, [], 1, [], 1);
    Mouse.trueClick(TinyDom.body(editor));
    TinyAssertions.assertSelection(editor, [ 1, 0 ], 0, [ 1, 0 ], 0);
  });

  it('Normalization during operations with modifier keys, should run only once in the end when user releases modifier key.', () => {
    const editor = hook.editor();
    resetNormalizeCounter();
    editor.setContent('<p><b>a</b><i>a</i></p>');
    TinySelections.setSelection(editor, [ 0, 0, 0 ], 0, [ 0, 0 ], 0);
    TinyContentActions.keyup(editor, Keys.left(), { shift: true });
    assertNormalizeCounter(0);
    TinyContentActions.keyup(editor, 17, { }); // Single Ctrl
    assertNormalizeCounter(1);
    TinyAssertions.assertSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 0);
  });

  it('TINY-4550: Normalization should not run after selecting all when there is only an image in the content', () => {
    const editor = hook.editor();
    resetNormalizeCounter();
    editor.setContent('<p><img src="about:blank"></p>');
    TinySelections.setCursor(editor, [ 0 ], 1);
    editor.shortcuts.add('meta+a', null, 'SelectAll');
    const isMac = Env.os.isMacOS() || Env.os.isiOS();
    TinyContentActions.keydown(editor, 65, { metaKey: isMac, ctrlKey: !isMac });
    editor.dispatch('keyup', new KeyboardEvent('keyup', { key: isMac ? 'Meta' : 'Control' }));
    TinyAssertions.assertSelection(editor, [ ], 0, [ ], 1);
  });
});
