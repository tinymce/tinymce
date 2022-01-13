/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */
import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks, TinySelections, TinyAssertions, TinyContentActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.keyboard.FormatShortcutsTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    base_url: '/project/tinymce/js/tinymce',
  }, []);

  it('should set the selection to be bold', () => {
    const editor = hook.editor();
    editor.setContent('<p>abc</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 3); // Selects `tent` in the paragraph
    TinyContentActions.keystroke(editor, 66, { meta: true });
    TinyAssertions.assertContent(editor, '<p><strong>abc</strong></p>');
  });
  it('should set the selection to be italic', () => {
    const editor = hook.editor();
    editor.setContent('<p>abc</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 3); // Selects `tent` in the paragraph
    TinyContentActions.keystroke(editor, 73, { meta: true });
    TinyAssertions.assertContent(editor, '<p><em>abc</em></p>');
  });
  it('should set the selection to be underline', () => {
    const editor = hook.editor();
    editor.setContent('<p>abc</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 3); // Selects `tent` in the paragraph
    TinyContentActions.keystroke(editor, 85, { meta: true });
    TinyAssertions.assertContent(editor, '<p><span style="text-decoration: underline;">abc</span></p>');
  });
  it('should set the selection to be H1', () => {
    const editor = hook.editor();
    editor.setContent('<p>abc</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 3); // Selects `tent` in the paragraph
    TinyContentActions.keystroke(editor, 49, { ctrl: true, alt: true });
    TinyAssertions.assertContent(editor, '<h1>abc</h1>');
  });
  it('should set the selection to be H2', () => {
    const editor = hook.editor();
    editor.setContent('<p>abc</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 3); // Selects `tent` in the paragraph
    TinyContentActions.keystroke(editor, 50, { ctrl: true, alt: true });
    TinyAssertions.assertContent(editor, '<h2>abc</h2>');
  });
  it('should set the selection to be H3', () => {
    const editor = hook.editor();
    editor.setContent('<p>abc</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 3); // Selects `tent` in the paragraph
    TinyContentActions.keystroke(editor, 51, { ctrl: true, alt: true });
    TinyAssertions.assertContent(editor, '<h3>abc</h3>');
  });
  it('should set the selection to be H4', () => {
    const editor = hook.editor();
    editor.setContent('<p>abc</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 3); // Selects `tent` in the paragraph
    TinyContentActions.keystroke(editor, 52, { ctrl: true, alt: true });
    TinyAssertions.assertContent(editor, '<h4>abc</h4>');
  });
  it('should set the selection to be H5', () => {
    const editor = hook.editor();
    editor.setContent('<p>abc</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 3); // Selects `tent` in the paragraph
    TinyContentActions.keystroke(editor, 53, { ctrl: true, alt: true });
    TinyAssertions.assertContent(editor, '<h5>abc</h5>');
  });
  it('should set the selection to be H6', () => {
    const editor = hook.editor();
    editor.setContent('<p>abc</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 3); // Selects `tent` in the paragraph
    TinyContentActions.keystroke(editor, 54, { ctrl: true, alt: true });
    TinyAssertions.assertContent(editor, '<h6>abc</h6>');
  });
  it('should set the selection to be Paragraph', () => {
    const editor = hook.editor();
    editor.setContent('<p>abc</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 3); // Selects `tent` in the paragraph
    TinyContentActions.keystroke(editor, 55, { ctrl: true, alt: true });
    TinyAssertions.assertContent(editor, '<p>abc</p>');
  });
  it('should set the selection to be Div', () => {
    const editor = hook.editor();
    editor.setContent('<p>abc</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 3); // Selects `tent` in the paragraph
    TinyContentActions.keystroke(editor, 56, { ctrl: true, alt: true });
    TinyAssertions.assertContent(editor, '<div>abc</div>');
  });
  it('should set the selection to be address', () => {
    const editor = hook.editor();
    editor.setContent('<p>abc</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 3); // Selects `tent` in the paragraph
    TinyContentActions.keystroke(editor, 57, { ctrl: true, alt: true });
    TinyAssertions.assertContent(editor, '<address>abc</address>');
  });
});
