import { describe, it } from '@ephox/bedrock-client';
import { PlatformDetection } from '@ephox/sand';
import { TinyHooks, TinySelections, TinyAssertions, TinyContentActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.keyboard.FormatShortcutsTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    base_url: '/project/tinymce/js/tinymce',
  }, []);

  const platform = PlatformDetection.detect();

  const testFormat = (editor: Editor, style: string) => {
    TinyContentActions.keystroke(editor, style.charCodeAt(0), platform.os.isMacOS() ? { meta: true } : { ctrl: true } );
  };

  const heading = (editor: Editor, number: string) => {
    TinyContentActions.keystroke(editor, number.charCodeAt(0), platform.os.isMacOS() ? { ctrl: true, alt: true } : { shift: true, alt: true });
  };

  it('TINY-2884: should set the selection to be bold', () => {
    const editor = hook.editor();
    editor.setContent('<p>abc</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 3);
    testFormat(editor, 'B');
    TinyAssertions.assertContent(editor, '<p><strong>abc</strong></p>');
  });

  it('TINY-2884: should set the selection to be italic', () => {
    const editor = hook.editor();
    editor.setContent('<p>abc</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 3);
    testFormat(editor, 'I');
    TinyAssertions.assertContent(editor, '<p><em>abc</em></p>');
  });

  it('TINY-2884: should set the selection to be underline', () => {
    const editor = hook.editor();
    editor.setContent('<p>abc</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 3);
    testFormat(editor, 'U');
    TinyAssertions.assertContent(editor, '<p><span style="text-decoration: underline;">abc</span></p>');
  });

  it('TINY-2884: should set the selection to be H1', () => {
    const editor = hook.editor();
    editor.setContent('<p>abc</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 3);
    heading(editor, '1');
    TinyAssertions.assertContent(editor, '<h1>abc</h1>');
  });

  it('TINY-2884: should set the selection to be H2', () => {
    const editor = hook.editor();
    editor.setContent('<p>abc</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 3);
    heading(editor, '2');
    TinyAssertions.assertContent(editor, '<h2>abc</h2>');
  });

  it('TINY-2884: should set the selection to be H3', () => {
    const editor = hook.editor();
    editor.setContent('<p>abc</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 3);
    heading(editor, '3');
    TinyAssertions.assertContent(editor, '<h3>abc</h3>');
  });

  it('TINY-2884: should set the selection to be H4', () => {
    const editor = hook.editor();
    editor.setContent('<p>abc</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 3);
    heading(editor, '4');
    TinyAssertions.assertContent(editor, '<h4>abc</h4>');
  });

  it('TINY-2884: should set the selection to be H5', () => {
    const editor = hook.editor();
    editor.setContent('<p>abc</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 3);
    heading(editor, '5');
    TinyAssertions.assertContent(editor, '<h5>abc</h5>');
  });

  it('TINY-2884: should set the selection to be H6', () => {
    const editor = hook.editor();
    editor.setContent('<p>abc</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 3);
    heading(editor, '6');
    TinyAssertions.assertContent(editor, '<h6>abc</h6>');
  });

  it('TINY-2884: should set the selection to be Paragraph', () => {
    const editor = hook.editor();
    editor.setContent('<p>abc</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 3);
    heading(editor, '7');
    TinyAssertions.assertContent(editor, '<p>abc</p>');
  });

  it('TINY-2884: should set the selection to be Div', () => {
    const editor = hook.editor();
    editor.setContent('<p>abc</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 3);
    heading(editor, '8');
    TinyAssertions.assertContent(editor, '<div>abc</div>');
  });

  it('TINY-2884: should set the selection to be address', () => {
    const editor = hook.editor();
    editor.setContent('<p>abc</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 3);
    heading(editor, '9');
    TinyAssertions.assertContent(editor, '<address>abc</address>');
  });
});
