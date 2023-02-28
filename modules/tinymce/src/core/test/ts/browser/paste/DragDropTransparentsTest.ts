import { DragnDrop, Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { SugarElement } from '@ephox/sugar';
import { TinyAssertions, TinyDom, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.paste.DragDropTransparentElementsTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, [], true);

  const dragDropInternally = (editor: Editor, html: string, target: SugarElement<Element>) => {
    editor.fire('dragstart');
    DragnDrop.dropItems([{ data: html, type: 'text/html' }], target);
    editor.fire('dragend');
  };

  const pWaitForContent = (editor: Editor, expected: string) =>
    Waiter.pTryUntil('Should be expected content', () => TinyAssertions.assertContent(editor, expected));

  it('TINY-9231: should unwrap inline anchors if dropping in a block anchor', async () => {
    const editor = hook.editor();

    editor.setContent('<a href="#"><p>block link</p></a>');
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 0);
    const target = SugarElement.fromDom(editor.selection.getNode());
    DragnDrop.dropItems([{ data: '<a href="#">link</a>', type: 'text/html' }], target);
    await pWaitForContent(editor, '<a href="#"><p>linkblock link</p></a>');
  });

  it('TINY-9231: should unwrap inline anchors if dropping in a block anchor (internal)', async () => {
    const editor = hook.editor();

    editor.setContent('<a href="#"><p>block link</p></a>');
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 0);
    const target = SugarElement.fromDom(editor.selection.getNode());
    dragDropInternally(editor, '<a href="#">link</a>', target);
    await pWaitForContent(editor, '<a href="#"><p>linkblock link</p></a>');
  });

  it('TINY-9231: should unwrap inline anchors if dropping inline link next to block link', async () => {
    const editor = hook.editor();

    editor.setContent('<a href="#"><p>block link</p></a>');
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 0);
    const target = TinyDom.documentElement(editor);
    DragnDrop.dropItems([{ data: '<a href="#">link</a>', type: 'text/html' }], target);
    await pWaitForContent(editor, '<a href="#"><p>linkblock link</p></a>');
  });

  it('TINY-9231: should unwrap inline anchors if dropping inline link next to block link (internal)', async () => {
    const editor = hook.editor();

    editor.setContent('<a href="#"><p>block link</p></a>');
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 0);
    const target = TinyDom.documentElement(editor);
    dragDropInternally(editor, '<a href="#">link</a>', target);
    await pWaitForContent(editor, '<a href="#"><p>linkblock link</p></a>');
  });
});
