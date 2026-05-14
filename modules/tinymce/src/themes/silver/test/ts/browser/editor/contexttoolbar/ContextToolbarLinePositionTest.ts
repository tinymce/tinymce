import { UiFinder } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { SugarBody } from '@ephox/sugar';
import { TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import type Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.themes.silver.editor.contexttoolbar.ContextToolbarLinePosition test', () => {
  const rightSelector = '.tox-pop.tox-pop--left:not(.tox-pop--inset):not(.tox-pop--transition)';
  const leftSelector = '.tox-pop.tox-pop--right:not(.tox-pop--inset):not(.tox-pop--transition)';

  const setupHook = (directionality: 'ltr' | 'rtl') => TinyHooks.bddSetup<Editor>({
    directionality,
    height: 400,
    base_url: '/project/tinymce/js/tinymce',
    setup: (ed: Editor) => {
      ed.ui.registry.addButton('alpha', {
        text: 'Alpha',
        onAction: Fun.noop
      });
      ed.ui.registry.addContextToolbar('test-line-toolbar', {
        predicate: (node) => node.nodeName.toLowerCase() === 'div',
        items: 'alpha',
        position: 'line'
      });
    }
  }, [], true);

  context('LTR', () => {
    const ltrHook = setupHook('ltr');

    it('TINY-14376: Line context toolbar uses east layout by default', async () => {
      const editor = ltrHook.editor();
      editor.setContent('<div style="height: 25px;"></div>');
      TinySelections.setCursor(editor, [ 0, 0 ], 0);
      await UiFinder.pWaitForVisible('Waiting for toolbar to appear to the right of cursor', SugarBody.body(), rightSelector);
    });

    it('TINY-14376: Line context toolbar falls back to west layout when right-aligned content would cause overflow', async () => {
      const editor = ltrHook.editor();
      editor.setContent('<div style="height: 25px; text-align: right;"></div>');
      TinySelections.setCursor(editor, [ 0, 0 ], 0);
      await UiFinder.pWaitForVisible('Waiting for toolbar to appear to the left of cursor', SugarBody.body(), leftSelector);
    });
  });

  context('RTL', () => {
    const rtlHook = setupHook('rtl');

    it('TINY-14376: Line context toolbar uses west layout by default', async () => {
      const editor = rtlHook.editor();
      editor.setContent('<div style="height: 25px;"></div>');
      TinySelections.setCursor(editor, [ 0, 0 ], 0);
      await UiFinder.pWaitForVisible('Waiting for toolbar to appear to the left of cursor', SugarBody.body(), leftSelector);
    });

    it('TINY-14376: Line context toolbar falls back to east layout when left-aligned content would cause overflow', async () => {
      const editor = rtlHook.editor();
      editor.setContent('<div style="height: 25px; text-align: left;"></div>');
      TinySelections.setCursor(editor, [ 0, 0 ], 0);
      await UiFinder.pWaitForVisible('Waiting for toolbar to appear to the right of cursor', SugarBody.body(), rightSelector);
    });
  });
});
