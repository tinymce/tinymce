import { Assertions, DragnDrop, Mouse, UiFinder, Waiter } from '@ephox/agar';
import { before, describe, it } from '@ephox/bedrock-client';
import { Cell } from '@ephox/katamari';
import { TinyDom, TinyHooks } from '@ephox/mcagar';
import { Hierarchy, SugarBody, SugarNode } from '@ephox/sugar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.core.DragDropOverridesTest', () => {
  const fired = Cell(false);
  const hook = TinyHooks.bddSetup<Editor>({
    indent: false,
    menubar: false,
    base_url: '/project/tinymce/js/tinymce'
  }, [ Theme ]);

  before(() => {
    hook.editor().on('dragend', () => {
      fired.set(true);
    });
  });

  const createFile = (name: string, lastModified: number, blob: Blob): File => {
    const newBlob: any = new Blob([ blob ], { type: blob.type });

    newBlob.name = name;
    newBlob.lastModified = lastModified;

    return Object.freeze(newBlob);
  };

  const assertNotification = (message: string, editor: Editor) => async () => {
    const body = TinyDom.body(editor);
    const notification = await UiFinder.pWaitForVisible('Wait for notification to appear', body, '.tox-notification');
    Assertions.assertPresence('Verify message content', {
      ['.tox-notification__body:contains(' + message + ')']: 1
    }, notification);
    Mouse.clickOn(notification, '.tox-notification__dismiss');
  };

  it('drop draggable element outside of editor', () => {
    const editor = hook.editor();
    editor.setContent('<p contenteditable="false">a</p>');
    const target = Hierarchy.follow(TinyDom.body(editor), [ 0 ]).filter(SugarNode.isElement).getOrDie().dom;
    const rect = target.getBoundingClientRect();
    const button = 0;
    const screenX = rect.left + rect.width / 2;
    const screenY = rect.top + rect.height / 2;

    editor.fire('mousedown', { button, screenX, screenY, target } as unknown as MouseEvent);
    editor.fire('mousemove', { button, screenX: screenX + 20, screenY: screenY + 20, clientX: 0, clientY: 0, target } as unknown as MouseEvent);
    editor.dom.fire(document.body, 'mouseup');

    assert.isTrue(fired.get(), 'Should fire dragend event');
  });

  it('TINY-6027: Drag unsupported file into the editor/UI is prevented', async () => {
    const editor = hook.editor();
    await Waiter.pWait(100); // Wait a small amount of time to ensure the events have been bound
    editor.setContent('<p>Content</p>');
    await DragnDrop.pDropFiles(TinyDom.body(editor), [
      createFile('test.txt', 123, new Blob([ 'content' ], { type: 'text/plain' }))
    ]);
    assertNotification('Dropped file type is not supported', editor);
    await DragnDrop.pDropItems(TinyDom.body(editor), [
      { data: 'Some content', type: 'text/plain' }
    ], false);

    const toolbar = UiFinder.findIn(SugarBody.body(), '.tox-toolbar__primary').getOrDie();
    await DragnDrop.pDropFiles(toolbar, [
      createFile('test.js', 123, new Blob([ 'var a = "content";' ], { type: 'application/javascript' }))
    ]);
    assertNotification('Dropped file type is not supported', editor);
  });
});
