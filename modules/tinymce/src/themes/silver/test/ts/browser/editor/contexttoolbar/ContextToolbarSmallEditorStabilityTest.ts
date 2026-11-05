import { UiFinder, Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Arr, Fun } from '@ephox/katamari';
import { Class, type SugarElement, SugarBody } from '@ephox/sugar';
import { TinyContentActions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import type Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.themes.silver.editor.contexttoolbar.ContextToolbarSmallEditorStability test', () => {
  // GH-11175: A deliberately small editor with no chrome, so a small table fills the visible
  // area and the table context toolbar is forced to use an inset layout for which both the
  // north and south placements overlap the selection.
  const hook = TinyHooks.bddSetup<Editor>({
    menubar: false,
    toolbar: false,
    statusbar: false,
    height: 100,
    base_url: '/project/tinymce/js/tinymce',
    content_style: 'html, body, p { margin: 0; padding: 0; } table { width: 100%; border-collapse: collapse; } td { border: 1px solid #ccc; } tr { height: 28px; }',
    setup: (ed: Editor) => {
      ed.ui.registry.addButton('alpha', { text: 'Alpha', onAction: Fun.noop });
      ed.ui.registry.addContextToolbar('small-editor-table-toolbar', {
        predicate: (node) => node.nodeName.toLowerCase() === 'table',
        items: 'alpha',
        position: 'node'
      });
    }
  }, [], true);

  const insetSelector = '.tox-pop.tox-pop--inset:not(.tox-pop--transition)';

  const pWaitForSettledInsetSide = async (): Promise<'top' | 'bottom'> => {
    const ele: SugarElement<HTMLElement> = await UiFinder.pWaitForVisible('Waiting for the settled inset context toolbar', SugarBody.body(), insetSelector);
    return Class.has(ele, 'tox-pop--top') ? 'top' : 'bottom';
  };

  it('GH-11175: the table context toolbar should not oscillate between inset placements on repeated keypresses', async () => {
    const editor = hook.editor();
    editor.setContent(
      '<table><tbody>' +
      Arr.range(3, (i) => `<tr><td>Cell ${i + 1}</td></tr>`).join('') +
      '</tbody></table>'
    );

    // Put the caret in the middle row so both inset placements overlap it.
    TinySelections.setCursor(editor, [ 0, 0, 1, 0, 0 ], 0);
    const initialSide = await pWaitForSettledInsetSide();

    // Simulate typing. Each keyup re-triggers the context toolbar (via the throttled relaunch).
    // Before the fix the inset placement flipped on every keyup because both placements overlap
    // the selection, so it oscillated up and down. It should now stay on the same side.
    for (let i = 0; i < 5; i++) {
      TinyContentActions.keyup(editor, 32);
      // Give a potential (unwanted) flip time to start transitioning before we re-check.
      await Waiter.pWait(80);
      const currentSide = await pWaitForSettledInsetSide();
      assert.equal(currentSide, initialSide, `Inset placement should remain "${initialSide}" but became "${currentSide}" after keypress ${i + 1}`);
    }
  });
});
