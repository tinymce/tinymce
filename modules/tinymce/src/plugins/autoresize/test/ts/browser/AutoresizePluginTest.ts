import { PhantomSkipper, Waiter } from '@ephox/agar';
import { beforeEach, describe, it } from '@ephox/bedrock-client';
import { Cell } from '@ephox/katamari';
import { TinyContentActions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import AutoresizePlugin from 'tinymce/plugins/autoresize/Plugin';
import FullscreenPlugin from 'tinymce/plugins/fullscreen/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.plugins.autoresize.AutoresizePluginTest', () => {
  PhantomSkipper.bddSetup();

  const resizeEventsCount = Cell(0);
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'autoresize fullscreen',
    toolbar: 'autoresize',
    base_url: '/project/tinymce/js/tinymce',
    autoresize_bottom_margin: 50,
    autoresize_on_init: false,
    // Override the content css margins, so they don't come into play
    content_style: 'body { margin: 0; margin-top: 10px; }',
    setup: (editor: Editor) => {
      editor.on('ResizeEditor', () => {
        resizeEventsCount.set(resizeEventsCount.get() + 1);
      });
    }
  }, [ AutoresizePlugin, FullscreenPlugin, Theme ], true);

  const assertEditorHeightAbove = (editor: Editor, minHeight: number) => {
    const editorHeight = editor.getContainer().offsetHeight;
    assert.isAtLeast(editorHeight, minHeight, `editor height should be above: ${editorHeight}>=${minHeight}`);
  };

  const assertEditorHeightBelow = (editor: Editor, minHeight: number) => {
    const editorHeight = editor.getContainer().offsetHeight;
    assert.isAtMost(editorHeight, minHeight, `editor height should be below: ${editorHeight}<=${minHeight}`);
  };

  const assertEditorContentApproxHeight = (editor: Editor, height: number, diff: number = 5) => {
    // Get the editor height, but exclude the 10px margin from the calculations
    const editorContentHeight = editor.getContentAreaContainer().offsetHeight - 10;
    const actualDiff = Math.abs(editorContentHeight - height);
    assert.isAtMost(actualDiff, diff, `editor content height should be approx (within ${diff}px): ${editorContentHeight} ~= ${height}`);
  };

  const assertScrollPositionGreaterThan = (window: Window, position: number) => {
    const scroll = window.pageYOffset;
    assert.isAtLeast(scroll, position, `scroll position should be greater than: ${scroll}px >= ${position}px`);
  };

  const assertScroll = (editor: Editor, state: boolean) => {
    const body = editor.getBody();
    assert.equal(body.style.overflowY === 'hidden', !state, `scroll state: ${state}`);
  };

  beforeEach(() => {
    resizeEventsCount.set(0);
  });

  it('TBA: Fullscreen toggle scroll state', () => {
    const editor = hook.editor();
    editor.execCommand('mceFullScreen');
    assertScroll(editor, true);
    editor.execCommand('mceFullScreen');
    assertScroll(editor, false);
  });

  it('TBA: Editor size increase based on content size', async () => {
    const editor = hook.editor();
    editor.setContent('<div style="height: 5000px;">a</div>');
    // Content height + bottom margin = 5050
    await Waiter.pTryUntil('wait for editor content height', () => assertEditorContentApproxHeight(editor, 5050), 10, 3000);
    await Waiter.pTryUntil('wait for editor height', () => assertEditorHeightAbove(editor, 5050), 10, 3000);
    assert.isAtLeast(resizeEventsCount.get(), 1, 'Should have fired a ResizeEditor event');
  });

  it('TBA: Editor size increase with floated content', async () => {
    const editor = hook.editor();
    editor.setContent('<div style="height: 5500px; float: right;">a</div>');
    // Content height + bottom margin = 5550
    await Waiter.pTryUntil('wait for editor content height', () => assertEditorContentApproxHeight(editor, 5550), 10, 3000);
    await Waiter.pTryUntil('wait for editor height', () => assertEditorHeightAbove(editor, 5550), 10, 3000);
    assert.isAtLeast(resizeEventsCount.get(), 1, 'Should have fired a ResizeEditor event');
  });

  it('TBA: Editor size decrease based on content size', async () => {
    const editor = hook.editor();
    editor.setContent('<div style="height: 1000px;">a</div>');
    await Waiter.pTryUntil('wait for editor content height', () => assertEditorContentApproxHeight(editor, 1050), 10, 3000);
    await Waiter.pTryUntil('wait for editor height', () => assertEditorHeightBelow(editor, 1200), 10, 3000);
    assert.isAtLeast(resizeEventsCount.get(), 1, 'Should have fired a ResizeEditor event');
  });

  it('TBA: Editor size increase with async loaded content', async () => {
    const editor = hook.editor();
    // Note: Use a min-height here to account for different browsers rendering broken images differently
    editor.setContent('<div style="min-height: 35px;"><img src="#" /></div><div style="height: 5500px;"></div>');
    await Waiter.pTryUntil('wait for editor content height', () => assertEditorContentApproxHeight(editor, 5585), 10, 3000);
    // Update the img element to load an image
    editor.$('img').attr('src', 'http://moxiecode.cachefly.net/tinymce/v9/images/logo.png');
    // Content height + div image height (84px) + bottom margin = 5634
    await Waiter.pTryUntil('wait for editor content height', () => assertEditorContentApproxHeight(editor, 5634), 10, 3000);
    await Waiter.pTryUntil('wait for editor height', () => assertEditorHeightAbove(editor, 5634), 10, 3000);
  });

  it('TBA: Editor size content set to 10 and autoresize_bottom_margin set to 100', async () => {
    const editor = hook.editor();
    editor.settings.autoresize_bottom_margin = 100;
    editor.setContent('<div style="height: 10px;">a</div>');
    await Waiter.pTryUntil('wait for editor content height', () => assertEditorContentApproxHeight(editor, 110), 10, 3000);
    editor.settings.autoresize_bottom_margin = 50;
  });

  it('TBA: Editor size increase content to 1000 based and restrict by max height', async () => {
    const editor = hook.editor();
    editor.settings.max_height = 200;
    editor.setContent('<div style="height: 1000px;">a</div>');
    await Waiter.pTryUntil('wait for editor height', () => assertEditorHeightBelow(editor, 200), 10, 3000);
    editor.settings.max_height = 0;
  });

  it('TBA: Editor size decrease content to 10 and set min height to 500', async () => {
    const editor = hook.editor();
    editor.settings.min_height = 500;
    editor.setContent('<div style="height: 10px;">a</div>');
    await Waiter.pTryUntil('wait for editor height', () => assertEditorHeightAbove(editor, 500), 10, 3000);
    editor.settings.min_height = 0;
  });

  it('TBA: Editor keeps selection in view when resizing', async () => {
    const editor = hook.editor();
    editor.setContent('');
    window.scrollTo(0, 0);
    // Set content will keep the selection at the start, whereas insert will keep it after the inserted content
    editor.insertContent('<div style="height: 5000px;">a</div><div style="height: 50px">b</div>');
    await Waiter.pTryUntil('wait for editor content height', () => assertEditorContentApproxHeight(editor, 5100), 10, 3000);
    await Waiter.pTryUntil('wait for editor height', () => assertEditorHeightAbove(editor, 5100), 10, 3000);
    assertScrollPositionGreaterThan(window, 3500);
  });

  it('TINY-7291: Editor does not scroll to the top when changing font size over multiple paragraphs (NodeChange trigger)', () => {
    const editor = hook.editor();
    editor.setContent('<div style="height: 5000px;">a</div><p>Paragraph 1</p><p>Paragraph 2</p>');
    window.scrollTo(0, 5000);
    TinySelections.setSelection(editor, [ 1, 0 ], 0, [ 2, 0 ], 11);
    editor.execCommand('FontSize', false, '20pt');
    assertScrollPositionGreaterThan(window, 3500);
  });

  it('TINY-7291: Editor does not scroll to the top on undo/redo (SetContent & NodeChange trigger)', () => {
    const editor = hook.editor();
    editor.resetContent('<div style="height: 5000px;">a</div><p>Some content</p>');
    TinySelections.setCursor(editor, [ 1, 0 ], 12);
    TinyContentActions.type(editor, '. More content...');
    editor.undoManager.add();
    assertScrollPositionGreaterThan(window, 3500);
    editor.execCommand('Undo');
    assertScrollPositionGreaterThan(window, 3500);
    editor.execCommand('Redo');
    assertScrollPositionGreaterThan(window, 3500);
  });
});
