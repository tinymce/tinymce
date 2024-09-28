import { UiFinder, Waiter, RealMouse } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Css, SugarElement } from '@ephox/sugar';
import { TinyDom, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import ImagePlugin from 'tinymce/plugins/image/Plugin';

describe('browser.tinymce.core.SelectionEnabledModeTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    toolbar: 'bold',
    plugins: 'autolink table image codesample media code lists accordion advlist',
    indent: false,
    statusbar: false,
  },
  [
    ImagePlugin,
  ], true);

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

  context('Selection and blocks selection', () => {
    it('TINY-10981: Allow selection of figure elements in selectionEnabled mode', async () => {
      const editor = hook.editor();

      setMode(editor, 'design');
      editor.setContent('<h3>test</h3><figure class="image"><img src="https://www.google.com/logos/google.jpg"><figcaption>Image caption</figcaption></figure>');
      await Waiter.pTryUntil('Waited for image to load', () => assert.isTrue(UiFinder.findIn<HTMLImageElement>(TinyDom.body(editor), 'img').getOrDie().dom.complete));
      await RealMouse.pClickOn('iframe => body => figure');
      await pAssertOutlineStyle(UiFinder.findIn(TinyDom.body(editor), 'figure').getOrDie(), imageSelectedOutline);
      assertFakeSelection(editor, true);

      setMode(editor, 'readonly');
      TinySelections.setCursor(editor, [ 0, 0 ], 0);
      await RealMouse.pClickOn('iframe => body => figure');
      assertFakeSelection(editor, true);
      await pAssertOutlineStyle(UiFinder.findIn(TinyDom.body(editor), 'figure').getOrDie(), imageSelectedOutline);
      assertFakeSelection(editor, true);

      setMode(editor, 'design');
      await RealMouse.pClickOn('iframe => body => figure');
      assertFakeSelection(editor, true);
    });
  });
});
