import { describe, it } from '@ephox/bedrock-client';
import { PlatformDetection } from '@ephox/sand';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { ChangeEvent, ExecCommandEvent } from 'tinymce/core/api/EventTypes';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';

describe('browser.tinymce.core.commands.LineHeightTest', () => {
  const platform = PlatformDetection.detect();
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce'
  }, []);

  const assertHeight = (editor: Editor, value: string) => {
    const current = editor.queryCommandValue('LineHeight');
    assert.equal(current, value, 'LineHeight query command returned wrong value');
  };

  it('TINY-4843: Specified line-height can be read from element', () => {
    const editor = hook.editor();
    editor.setContent('<p style="line-height: 1.5;">Test</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 0);
    assertHeight(editor, '1.5');
  });

  it('TINY-4843: Unspecified line-height can be read from element', function () {
    // TODO: TINY-7895
    if (platform.browser.isSafari()) {
      this.skip();
    }
    const editor = hook.editor();
    editor.setContent('<p>Hello</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 0);
    assertHeight(editor, '1.4'); // default content-css line height
  });

  it('TINY-4843: Specified line-height can be read from element in px', () => {
    const editor = hook.editor();
    editor.setContent('<p style="line-height: 20px;">Test</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 0);
    assertHeight(editor, '20px');
  });

  it('TINY-4843: Specified line-height can be read from ancestor element', () => {
    const editor = hook.editor();
    editor.setContent('<p style="line-height: 1.8;">Hello, <strong>world</strong></p>');
    TinySelections.setCursor(editor, [ 0, 1, 0 ], 0);
    assertHeight(editor, '1.8');
  });

  it('TINY-4843: Editor command can set line-height', () => {
    const editor = hook.editor();
    editor.setContent('<p>Hello</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 0);
    editor.execCommand('LineHeight', false, '2');
    TinyAssertions.assertContent(editor, '<p style="line-height: 2;">Hello</p>');
  });

  it('TINY-4843: Editor command can alter line-height', () => {
    const editor = hook.editor();
    editor.setContent('<p style="line-height: 1.8;">Hello</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 0);
    editor.execCommand('LineHeight', false, '2');
    TinyAssertions.assertContent(editor, '<p style="line-height: 2;">Hello</p>');
  });

  it('TINY-4843: Editor command can toggle line-height', () => {
    const editor = hook.editor();
    editor.setContent('<p style="line-height: 1.4;">Hello</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 0);
    editor.execCommand('LineHeight', false, '1.4');
    TinyAssertions.assertContent(editor, '<p>Hello</p>');
  });

  it('TINY-7048: LineHeight event order is correct', () => {
    const events: string[] = [];
    const editor = hook.editor();
    editor.setContent('<p>Hello</p>');
    const logEvents = (e: EditorEvent<ExecCommandEvent | ChangeEvent>) => {
      if ((e as ExecCommandEvent).command?.toLowerCase() !== 'mcefocus') {
        events.push(e.type.toLowerCase());
      }
    };
    // Note: It's important that we prepend these events, otherwise the UndoManager `ExecCommand` event handler
    // will execute first and make it looks like `change` is fired second.
    editor.on('BeforeExecCommand change ExecCommand', logEvents, true);

    editor.execCommand('LineHeight', false, '2');
    TinyAssertions.assertContent(editor, '<p style="line-height: 2;">Hello</p>');
    assert.deepEqual(events, [ 'beforeexeccommand', 'execcommand', 'change' ]);
    editor.off('BeforeExecCommand change ExecCommand', logEvents);
  });
});
