import { Assertions, DragnDrop, Keyboard, Keys, Mouse, UiFinder, Waiter } from '@ephox/agar';
import { before, beforeEach, describe, it } from '@ephox/bedrock-client';
import { Cell } from '@ephox/katamari';
import { SugarBody, SugarLocation } from '@ephox/sugar';
import { TinyDom, TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.core.DragDropOverridesTest', () => {
  const fired = Cell(false);
  const hook = TinyHooks.bddSetup<Editor>({
    indent: false,
    menubar: false,
    base_url: '/project/tinymce/js/tinymce'
  }, [ Theme ], true);

  before(() => {
    hook.editor().on('dragend', () => {
      fired.set(true);
    });
  });

  beforeEach(() => {
    fired.set(false);
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
    const target = UiFinder.findIn(TinyDom.body(editor), 'p:contains("a")').getOrDie().dom;
    const rect = target.getBoundingClientRect();
    const button = 0;
    const screenX = rect.left + rect.width / 2;
    const screenY = rect.top + rect.height / 2;

    editor.fire('mousedown', { button, screenX, screenY, target } as unknown as MouseEvent);
    editor.fire('mousemove', { button, screenX: screenX + 20, screenY: screenY + 20, clientX: 0, clientY: 0, target } as unknown as MouseEvent);
    editor.dom.fire(document.body, 'mouseup');

    assert.isTrue(fired.get(), 'Should fire dragend event');
  });

  it('TINY-7917: Dropping draggable element inside editor fires dragend event', () => {
    const editor = hook.editor();
    editor.setContent('<p contenteditable="false">a</p><p>bc123</p>');
    const target = UiFinder.findIn(TinyDom.body(editor), 'p:contains("a")').getOrDie();
    const targetPosition = SugarLocation.viewport(target);

    const dest = UiFinder.findIn(TinyDom.body(editor), 'p:contains("bc123")').getOrDie();
    const destPosition = SugarLocation.viewport(dest);
    const yDelta = destPosition.top - targetPosition.top;

    Mouse.mouseDown(target);
    // Drag CE=F paragraph roughly into other paragraph in order to trigger a valid drop on mouseup
    Mouse.mouseMoveTo(target, 15, yDelta + 5);
    Mouse.mouseUp(target);

    assert.isTrue(fired.get(), 'Should fire dragend event');
  });

  it('TINY-7917: Pressing escape during drag fires dragend event', () => {
    const editor = hook.editor();
    editor.setContent('<p contenteditable="false">a</p><p>bc123</p>');
    const target = UiFinder.findIn(TinyDom.body(editor), 'p:contains("a")').getOrDie();
    const targetPosition = SugarLocation.viewport(target);

    const dest = UiFinder.findIn(TinyDom.body(editor), 'p:contains("bc123")').getOrDie();
    const destPosition = SugarLocation.viewport(dest);
    const yDelta = destPosition.top - targetPosition.top;

    Mouse.mouseDown(target);
    // Where we drag to here is largely irrelevant
    Mouse.mouseMoveTo(target, 15, yDelta + 5);
    Keyboard.activeKeydown(TinyDom.document(editor), Keys.escape());

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
