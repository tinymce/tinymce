import { ApproxStructure, Assertions, Waiter } from '@ephox/agar';
import { beforeEach, context, describe, it } from '@ephox/bedrock-client';
import { Cell } from '@ephox/katamari';
import { TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import AutoresizePlugin from 'tinymce/plugins/autoresize/Plugin';
import FullscreenPlugin from 'tinymce/plugins/fullscreen/Plugin';

describe('browser.tinymce.plugins.autoresize.AutoresizePluginTest', () => {
  const assertEditorHeightAbove = (editor: Editor, minHeight: number) => {
    const editorHeight = editor.getContainer().offsetHeight;
    assert.isAtLeast(editorHeight, minHeight, `editor height should be above: ${editorHeight}>=${minHeight}`);
  };

  const assertEditorContentApproxHeight = (editor: Editor, height: number, diff: number = 5) => {
    // Get the editor height, but exclude the 10px margin from the calculations
    const editorContentHeight = editor.getContentAreaContainer().offsetHeight - 10;
    assert.isAtMost(Math.abs(editorContentHeight - height), diff, `editor content height should be approx (within ${diff}px): ${editorContentHeight} ~= ${height}`);
  };

  context('common tests', () => {
    const resizeEventsCount = Cell(0);
    const hook = TinyHooks.bddSetup<Editor>({
      plugins: 'autoresize fullscreen',
      menubar: false,
      toolbar: 'autoresize',
      base_url: '/project/tinymce/js/tinymce',
      autoresize_bottom_margin: 3000,
      content_css: 'document',
      toolbar_mode: 'floating',
      // Override the content css margins, so they don't come into play
      content_style: 'body { margin: 0; margin-top: 10px; }',
      setup: (editor: Editor) => {
        editor.on('ResizeEditor', () => {
          resizeEventsCount.set(resizeEventsCount.get() + 1);
        });
      }
    }, [ AutoresizePlugin, FullscreenPlugin ], true);

    beforeEach(() => {
      resizeEventsCount.set(0);
    });

    it('TINY-10793: Should not have a resize handle visible by default', async () => {
      const editor = hook.editor();
      const statusbar = await TinyUiActions.pWaitForUi(editor, '.tox-statusbar');
      Assertions.assertStructure('Check the statusbar does not have a resize handle', ApproxStructure.build((s, str, arr) => {
        return s.element('div', {
          children: [
            s.element('div', {
              classes: [ arr.has('tox-statusbar__text-container') ],
              children: [
                s.element('div', { classes: [ arr.has('tox-statusbar__path') ] }),
                s.element('div', {
                  classes: [ arr.has('tox-statusbar__right-container') ],
                  children: [
                    s.element('span', { classes: [ arr.has('tox-statusbar__branding') ] })
                  ]
                })
              ]
            })
          ]
        });
      }), statusbar);
    });

    it('TINY-10793: Editor size increase based on content size', async () => {
      const editor = hook.editor();
      editor.setContent('<div style="height: 5000px;">a</div>');
      // content ( 5000 ) + margin ( 3000 ) + chrome(?) ( 160 )
      await Waiter.pTryUntil('wait for editor content height', () => assertEditorContentApproxHeight(editor, 8000 + 160), 10, 3000);
      await Waiter.pTryUntil('wait for editor height', () => assertEditorHeightAbove(editor, 8000 + 160), 10, 3000);
      assert.isAtLeast(resizeEventsCount.get(), 1, 'Should have fired a ResizeEditor event');
    });
  });
});