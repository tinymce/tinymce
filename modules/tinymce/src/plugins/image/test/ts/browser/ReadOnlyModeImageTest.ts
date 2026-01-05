
import { UiFinder, Waiter, Keys } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Css, SelectorExists, type SugarElement } from '@ephox/sugar';
import { TinyAssertions, TinyContentActions, TinyDom, TinyHooks, TinySelections } from '@ephox/wrap-mcagar'; import { assert } from 'chai';

import type Editor from 'tinymce/core/api/Editor';
import ImagePlugin from 'tinymce/plugins/image/Plugin';

import * as Helpers from '../module/Helpers';

describe('browser.tinymce.plugins.image.ReadOnlyModeImageTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    toolbar: 'bold',
    plugins: 'image',
    statusbar: false,
  }, [ ImagePlugin ], true);

  const setMode = (editor: Editor, mode: string) => {
    editor.mode.set(mode);
  };

  const assertFakeSelection = (editor: Editor, expectedState: boolean) => {
    assert.equal(editor.selection.getNode().hasAttribute('data-mce-selected'), expectedState, 'Selected element should have expected state');
  };

  const pAssertOutlineStyle = async (elm: SugarElement<Element>, expectedOutlineStyle: { color: string; width: string; style: string }) => {
    const getOutline = (elm: SugarElement<Element>) => {
      const color = Css.get(elm, 'outline-color');
      const width = Css.get(elm, 'outline-width');
      const style = Css.get(elm, 'outline-style');
      return {
        color,
        width,
        style
      };
    };
    await Waiter.pTryUntil('Should have correct styling', () => {
      assert.deepEqual(getOutline(elm), expectedOutlineStyle);
    });
  };

  const imageSelectedOutline = {
    color: 'rgb(180, 215, 255)', // #b4d7ff
    width: '3px',
    style: 'solid'
  };

  const pAssertResizeHandle = async (editor: Editor) => {
    await Waiter.pTryUntil('Wait for resizehandle to show', () => assert.isTrue(SelectorExists.descendant(TinyDom.body(editor), '.mce-resizehandle'), 'Resize handle should be visible'));
  };

  const pAssertNoResizeHandle = async (editor: Editor) => {
    await Waiter.pTryUntil('Wait for resizehandle to not show', () => assert.isFalse(SelectorExists.descendant(TinyDom.body(editor), '.mce-resizehandle'), 'Resize handle should not be visible'));
  };

  const fakeImage = Helpers.getGreenImageDataUrl();

  it('TINY-10981: Deleting image element should not be permitted in readonly mode', async () => {
    const editor = hook.editor();

    setMode(editor, 'design');
    editor.setContent(`<img src="${fakeImage}" alt="" width="600" height="400">`);
    await Waiter.pTryUntil('Waited for image to load', () => assert.isTrue(UiFinder.findIn<HTMLImageElement>(TinyDom.body(editor), 'img').getOrDie().dom.complete));
    TinySelections.select(editor, 'img', []);
    await pAssertOutlineStyle(UiFinder.findIn(TinyDom.body(editor), 'img').getOrDie(), imageSelectedOutline);
    assertFakeSelection(editor, true);

    setMode(editor, 'readonly');
    TinySelections.setCursor(editor, [ 0 ], 0);
    TinySelections.select(editor, 'img', []);
    // Dispatching nodeChanged to update the selection
    editor.nodeChanged();
    assertFakeSelection(editor, true);
    TinyContentActions.keystroke(editor, Keys.backspace());
    TinyAssertions.assertContent(editor, `<p><img src="${fakeImage}" alt="" width="600" height="400"></p>`);
    await pAssertOutlineStyle(UiFinder.findIn(TinyDom.body(editor), 'img').getOrDie(), imageSelectedOutline);
    assertFakeSelection(editor, true);

    setMode(editor, 'design');
    TinySelections.select(editor, 'img', []);
    assertFakeSelection(editor, true);
    TinyContentActions.keystroke(editor, Keys.backspace());
    TinyAssertions.assertContent(editor, '');
  });

  it('TINY-10981: Allow selection of image elements in readonly mode', async () => {
    const editor = hook.editor();

    setMode(editor, 'design');
    editor.setContent(`<img src="${fakeImage}" alt="" width="600" height="400">`);
    await Waiter.pTryUntil('Waited for image to load', () => assert.isTrue(UiFinder.findIn<HTMLImageElement>(TinyDom.body(editor), 'img').getOrDie().dom.complete));
    TinySelections.select(editor, 'img', []);
    await pAssertOutlineStyle(UiFinder.findIn(TinyDom.body(editor), 'img').getOrDie(), imageSelectedOutline);
    assertFakeSelection(editor, true);

    setMode(editor, 'readonly');
    TinySelections.setCursor(editor, [ 0 ], 0);
    TinySelections.select(editor, 'img', []);
    // Dispatching nodeChanged to update the selection
    editor.nodeChanged();
    assertFakeSelection(editor, true);
    await pAssertOutlineStyle(UiFinder.findIn(TinyDom.body(editor), 'img').getOrDie(), imageSelectedOutline);
    assertFakeSelection(editor, true);

    setMode(editor, 'design');
    TinySelections.select(editor, 'img', []);
    assertFakeSelection(editor, true);
  });

  it('TINY-10981: Allow selection of image elements in readonly mode but resizing is prohibited', async () => {
    const editor = hook.editor();

    setMode(editor, 'design');
    editor.setContent(`<img src="${fakeImage}" alt="" width="600" height="400">`);
    await Waiter.pTryUntil('Waited for image to load', () => assert.isTrue(UiFinder.findIn<HTMLImageElement>(TinyDom.body(editor), 'img').getOrDie().dom.complete));
    TinySelections.select(editor, 'img', []);
    await pAssertOutlineStyle(UiFinder.findIn(TinyDom.body(editor), 'img').getOrDie(), imageSelectedOutline);
    assertFakeSelection(editor, true);
    await pAssertResizeHandle(editor);

    setMode(editor, 'readonly');
    TinySelections.setCursor(editor, [ 0 ], 0);
    TinySelections.select(editor, 'img', []);
    editor.nodeChanged();
    await pAssertOutlineStyle(UiFinder.findIn(TinyDom.body(editor), 'img').getOrDie(), imageSelectedOutline);
    assertFakeSelection(editor, true);
    await pAssertNoResizeHandle(editor);

    setMode(editor, 'design');
    TinySelections.select(editor, 'img', []);
    assertFakeSelection(editor, true);
    await Waiter.pTryUntil('Wait for resizehandle to show', () => assert.isTrue(SelectorExists.descendant(TinyDom.body(editor), '.mce-resizehandle'), 'Resize handle should be shown in design mode'));
  });

  it('TINY-10981: Allow selection of figure elements in readonly mode', async () => {
    const editor = hook.editor();

    setMode(editor, 'design');
    editor.setContent(`<figure class="image"><img src="${fakeImage}"><figcaption>Image caption</figcaption></figure>`);
    await Waiter.pTryUntil('Waited for image to load', () => assert.isTrue(UiFinder.findIn<HTMLImageElement>(TinyDom.body(editor), 'img').getOrDie().dom.complete));
    TinySelections.select(editor, 'figure', []);
    await pAssertOutlineStyle(UiFinder.findIn(TinyDom.body(editor), 'figure').getOrDie(), imageSelectedOutline);
    assertFakeSelection(editor, true);

    setMode(editor, 'readonly');
    TinySelections.setCursor(editor, [ 0 ], 0);
    TinySelections.select(editor, 'figure', []);
    // Dispatching nodeChanged to update the selection
    editor.nodeChanged();
    assertFakeSelection(editor, true);
    await pAssertOutlineStyle(UiFinder.findIn(TinyDom.body(editor), 'figure').getOrDie(), imageSelectedOutline);
    assertFakeSelection(editor, true);

    setMode(editor, 'design');
    TinySelections.select(editor, 'figure', []);
    assertFakeSelection(editor, true);
  });
});
