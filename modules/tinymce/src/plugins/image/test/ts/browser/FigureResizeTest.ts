import { Mouse, UiFinder } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Css, SugarElement } from '@ephox/sugar';
import { TinyAssertions, TinyDom, TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/image/Plugin';

import { fillActiveDialog } from '../module/Helpers';

describe('browser.tinymce.plugins.image.FigureResizeTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'image',
    toolbar: 'image',
    indent: false,
    image_caption: true,
    height: 400,
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ]);

  const getElementSize = (elm: SugarElement<HTMLImageElement>) => {
    const width = Css.get(elm, 'width');
    const height = Css.get(elm, 'height');
    return { width, height };
  };

  const dragHandleRight = (editor: Editor, resizeHandle: SugarElement<Element>, px: number) => {
    const dom = editor.dom;
    const target = resizeHandle.dom;
    const pos = dom.getPos(target);

    dom.dispatch(target, 'mousedown', { screenX: pos.x, screenY: pos.y });
    dom.dispatch(target, 'mousemove', { screenX: pos.x + px, screenY: pos.y });
    dom.dispatch(target, 'mouseup');
  };

  it('TBA: resizing image in figure', async () => {
    const editor = hook.editor();
    TinyUiActions.clickOnToolbar(editor, 'button[aria-label="Insert/edit image"]');
    await TinyUiActions.pWaitForDialog(editor);

    fillActiveDialog({
      src: {
        value: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
      },
      dimensions: {
        width: '100px',
        height: '100px'
      },
      caption: true
    });
    TinyUiActions.submitDialog(editor);

    const body = TinyDom.body(editor);
    const img = UiFinder.findIn<HTMLImageElement>(body, 'figure > img').getOrDie();
    Mouse.trueClick(img);
    TinyAssertions.assertSelection(editor, [], 0, [], 1);

    const resizeHandle = await UiFinder.pWaitFor('Wait for resize handlers', body, '#mceResizeHandlese');
    // actually drag the handle to the right
    dragHandleRight(editor, resizeHandle, 100);
    const imgSize = getElementSize(img);
    assert.deepEqual(imgSize, { width: '200px', height: '200px' }, 'asserting image size after resize');
  });
});
