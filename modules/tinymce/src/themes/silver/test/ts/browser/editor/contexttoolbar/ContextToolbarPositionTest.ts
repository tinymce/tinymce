import { UiFinder, Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Css, Scroll, SugarBody, SugarDocument, SugarLocation } from '@ephox/sugar';
import { TinyDom, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

import { getGreenImageDataUrl } from '../../../module/Assets';

describe('browser.tinymce.themes.silver.editor.contexttoolbar.ContextToolbarPositionTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    setup: (editor: Editor) => {
      let currentToolbar = 'nothing';
      editor.ui.registry.addContextToolbar('custom', {
        type: 'contexttoolbar',
        predicate: (node) => node.nodeName.toLowerCase() === 'img' && currentToolbar === 'something',
        items: 'back undo redo | undo redo | undo redo | undo redo | undo redo | undo redo',
        scope: 'node',
        position: 'node'
      });

      editor.ui.registry.addContextToolbar('custom-top', {
        type: 'contexttoolbar',
        predicate: (node) => node.nodeName.toLowerCase() === 'img' && currentToolbar === 'nothing',
        items: 'nested',
        scope: 'node',
        position: 'node'
      });

      editor.ui.registry.addButton('nested', {
        icon: 'image',
        onAction: () => {
          editor.focus();
          currentToolbar = 'something';
          editor.nodeChanged();
        }
      });

      editor.ui.registry.addButton('back', {
        icon: 'image',
        onAction: () => {
          editor.focus();
          currentToolbar = 'nothing';
          editor.nodeChanged();
        }
      });
    },
    with: 600
  }, [], true);

  const scrollTo = (editor: Editor, x: number, y: number, offset = 0) => {
    const editorPos = SugarLocation.absolute(TinyDom.contentAreaContainer(editor));
    // Note: Add 100px for the top para
    Scroll.to(editorPos.left + x, editorPos.top + offset + y, TinyDom.document(editor));
  };

  const pAssertPosition = (position: string, direction: string, value: number, diff = 5) => Waiter.pTryUntil('Wait for toolbar to be positioned', () => {
    const ele = UiFinder.findIn(SugarBody.body(), '.tox-pop').getOrDie();
    const posStyle = Css.get(ele, 'position');
    const dirStyle = parseInt(Css.getRaw(ele, direction).getOr('0').replace('px', ''), 10);
    assert.equal(posStyle, position, 'Assert toolbar positioning');
    assert.approximately(dirStyle, value, diff, `Assert toolbar position - ${direction} ${dirStyle}px ~= ${value}px`);
  });

  it('TINY-11549: switching between toolbars of different lenghts the available space should be calculate correctly', async () => {
    const editor = hook.editor();
    editor.setContent(
      `<p><img id="myImg" src="${getGreenImageDataUrl()}" style="height: 200px; width: 2000px"></p>`
    );
    TinySelections.select(editor, 'img', []);

    scrollTo(editor, 360, 0);

    await UiFinder.pWaitFor('button to active nested toolbar should be visible', SugarDocument.getDocument(), 'button[data-mce-name="nested"]');
    await pAssertPosition('absolute', 'left', SugarLocation.absolute(TinyDom.container(editor)).left + 625);

    TinyUiActions.clickOnUi(editor, 'button[data-mce-name="nested"]');
    const nestedToolbar = await UiFinder.pWaitForState<HTMLDivElement>('nested toolbar should be showed', SugarDocument.getDocument(), 'div.tox-toolbar', (t) => t.dom.clientWidth > 200);

    assert.isAtMost(nestedToolbar.dom.clientHeight, 50, 'the nexted toolbar should be on just 1 line');
  });
});
