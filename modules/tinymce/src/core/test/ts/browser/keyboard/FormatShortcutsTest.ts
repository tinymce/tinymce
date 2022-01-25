/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */
import { RealKeys } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { PlatformDetection } from '@ephox/sand';
import { TinyHooks, TinySelections, TinyAssertions, TinyContentActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.keyboard.FormatShortcutsTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    base_url: '/project/tinymce/js/tinymce',
  }, []);

  const platform = PlatformDetection.detect();

  // idk why chrome need this but it works, otherwise first 3 will fail on Mac
  const testFormat = async (editor: Editor, style: string) => {
    if (!platform.browser.isFirefox() && platform.os.isMacOS()) {
      TinyContentActions.keystroke(editor, style.charCodeAt(0), { meta: true } );
    } else if (platform.os.isMacOS()) {
      await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.combo( { metaKey: true }, style) ]);
    } else {
      TinyContentActions.keystroke(editor, style.charCodeAt(0), { ctrl: true } );
    }
  };

  // safari need this, no touching unless workaround
  const Heading = async (editor: Editor, number: string) => {
    if (platform.browser.isSafari()) {
      TinyContentActions.keystroke(editor, number.charCodeAt(0), { ctrl: true, alt: true });
    } else if (platform.os.isWindows()) {
      TinyContentActions.keystroke(editor, number.charCodeAt(0), { shift: true, alt: true });
    } else {
      await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.combo({ ctrlKey: true, altKey: true }, number) ]);
    }
  };

  it('TINY-2884: should set the selection to be bold', async () => {
    const editor = hook.editor();
    editor.setContent('<p>abc</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 3);
    await testFormat(editor, 'B');
    TinyAssertions.assertContent(editor, '<p><strong>abc</strong></p>');
  });
  it('TINY-2884: should set the selection to be italic', async () => {
    const editor = hook.editor();
    editor.setContent('<p>abc</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 3);
    await testFormat(editor, 'I');
    TinyAssertions.assertContent(editor, '<p><em>abc</em></p>');
  });
  it('TINY-2884: should set the selection to be underline', async () => {
    const editor = hook.editor();
    editor.setContent('<p>abc</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 3);
    await testFormat(editor, 'U');
    TinyAssertions.assertContent(editor, '<p><span style="text-decoration: underline;">abc</span></p>');
  });
  it('TINY-2884: should set the selection to be H1', async () => {
    const editor = hook.editor();
    editor.setContent('<p>abc</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 3);
    await Heading(editor, '1');
    TinyAssertions.assertContent(editor, '<h1>abc</h1>');
  });
  it('TINY-2884: should set the selection to be H2', async () => {
    const editor = hook.editor();
    editor.setContent('<p>abc</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 3);
    await Heading(editor, '2');
    TinyAssertions.assertContent(editor, '<h2>abc</h2>');
  });
  it('TINY-2884: should set the selection to be H3', async () => {
    const editor = hook.editor();
    editor.setContent('<p>abc</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 3);
    await Heading(editor, '3');
    TinyAssertions.assertContent(editor, '<h3>abc</h3>');
  });
  it('TINY-2884: should set the selection to be H4', async () => {
    const editor = hook.editor();
    editor.setContent('<p>abc</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 3);
    await Heading(editor, '4');
    TinyAssertions.assertContent(editor, '<h4>abc</h4>');
  });
  it('TINY-2884: should set the selection to be H5', async () => {
    const editor = hook.editor();
    editor.setContent('<p>abc</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 3);
    await Heading(editor, '5');
    TinyAssertions.assertContent(editor, '<h5>abc</h5>');
  });
  it('TINY-2884: should set the selection to be H6', async () => {
    const editor = hook.editor();
    editor.setContent('<p>abc</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 3);
    await Heading(editor, '6');
    TinyAssertions.assertContent(editor, '<h6>abc</h6>');
  });
  it('TINY-2884: should set the selection to be Paragraph', async () => {
    const editor = hook.editor();
    editor.setContent('<p>abc</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 3);
    await Heading(editor, '7');
    TinyAssertions.assertContent(editor, '<p>abc</p>');
  });
  it('TINY-2884: should set the selection to be Div', async () => {
    const editor = hook.editor();
    editor.setContent('<p>abc</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 3);
    await Heading(editor, '8');
    TinyAssertions.assertContent(editor, '<div>abc</div>');
  });
  it('TINY-2884: should set the selection to be address', async () => {
    const editor = hook.editor();
    editor.setContent('<p>abc</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 3);
    await Heading(editor, '9');
    TinyAssertions.assertContent(editor, '<address>abc</address>');
  });
});
