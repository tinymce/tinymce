import { Keys, UiFinder } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Attribute, Focus } from '@ephox/sugar';
import { TinyDom, TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import type Editor from 'tinymce/core/api/Editor';

import { resizeEditorBy } from '../../../module/UiUtils';

describe('browser.tinymce.themes.silver.editor.sizing.ResizeHandleAriaTest', () => {
  context('TINYMCE-14493: Vertical resize exposes aria-valuenow', () => {
    const verticalHook = TinyHooks.bddSetup<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      resize: true,
      min_height: 300,
      max_height: 500,
      height: 400,
      width: 400
    }, []);

    it('TINYMCE-14493: aria-valuenow updates when resizing vertically with the keyboard', async () => {
      const editor = verticalHook.editor();
      const container = TinyDom.container(editor);
      await UiFinder.pWaitForVisible('Wait for resize handle to be visible', container, '.tox-statusbar__resize-handle');
      const resizeHandle = UiFinder.findIn<HTMLElement>(container, '.tox-statusbar__resize-handle').getOrDie();
      Focus.focus(resizeHandle);

      assert.equal(Attribute.get(resizeHandle, 'aria-valuenow'), '400', 'aria-valuenow should be set to editors height initially');
      assert.equal(Attribute.get(resizeHandle, 'aria-valuenow'), `${container.dom.offsetHeight}`, 'aria-valuenow should equal the container height');

      for (let i = 0; i < 3; i++) {
        TinyUiActions.keystroke(editor, Keys.down());
      }
      assert.equal(Attribute.get(resizeHandle, 'aria-valuenow'), '460', 'aria-valuenow should increase by 3 * 20px after three down presses');
      assert.equal(Attribute.get(resizeHandle, 'aria-valuenow'), `${container.dom.offsetHeight}`, 'aria-valuenow should equal the container height');

      for (let i = 0; i < 3; ++i) {
        TinyUiActions.keystroke(editor, Keys.up());
      }
      assert.equal(Attribute.get(resizeHandle, 'aria-valuenow'), '400', 'aria-valuenow should return to the original value after three up presses');
      assert.equal(Attribute.get(resizeHandle, 'aria-valuenow'), `${container.dom.offsetHeight}`, 'aria-valuenow should equal the container height');
    });

    it('TINYMCE-14493: aria-valuenow updates when resizing vertically by dragging', async () => {
      const editor = verticalHook.editor();
      const container = TinyDom.container(editor);
      await UiFinder.pWaitForVisible('Wait for resize handle to be visible', container, '.tox-statusbar__resize-handle');
      const resizeHandle = UiFinder.findIn<HTMLElement>(container, '.tox-statusbar__resize-handle').getOrDie();

      assert.equal(Attribute.get(resizeHandle, 'aria-valuenow'), '400', 'aria-valuenow should be set to editors height initially');
      assert.equal(Attribute.get(resizeHandle, 'aria-valuenow'), `${container.dom.offsetHeight}`, 'aria-valuenow should equal the container height');

      await resizeEditorBy([ 0, 50 ]);

      assert.equal(Attribute.get(resizeHandle, 'aria-valuenow'), '450', 'aria-valuenow should reflect the new container height after dragging');
      assert.equal(Attribute.get(resizeHandle, 'aria-valuenow'), `${container.dom.offsetHeight}`, 'aria-valuenow should equal the container height');
    });
  });
});
