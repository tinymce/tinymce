import { Assertions, DragnDrop, Keyboard, Keys, Mouse, UiFinder, Waiter } from '@ephox/agar';
import { before, beforeEach, describe, it } from '@ephox/bedrock-client';
import { Cell } from '@ephox/katamari';
import { SugarBody, SugarElement, SugarLocation } from '@ephox/sugar';
import { TinyDom, TinyHooks, TinyAssertions, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.DragDropOverridesTest', () => {
  const fired = Cell(false);
  const hook = TinyHooks.bddSetup<Editor>({
    indent: false,
    menubar: false,
    base_url: '/project/tinymce/js/tinymce',
    height: 300,
    width: 300,
  }, [], true);

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

  const pAssertNotification = async (message: string) => {
    const notification = await UiFinder.pWaitForVisible('Wait for notification to appear', SugarBody.body(), '.tox-notification');
    Assertions.assertPresence('Verify message content', {
      ['.tox-notification__body:contains(' + message + ')']: 1
    }, notification);
    Mouse.clickOn(notification, '.tox-notification__dismiss');
    await Waiter.pTryUntil('Wait for the notification to close', () => UiFinder.notExists(SugarBody.body(), '.tox-notification'));
  };

  it('drop draggable element outside of editor', () => {
    const editor = hook.editor();
    editor.setContent('<p contenteditable="false">a</p>');
    const target = UiFinder.findIn(TinyDom.body(editor), 'p:contains("a")').getOrDie().dom;
    const rect = target.getBoundingClientRect();
    const button = 0;
    const screenX = rect.left + rect.width / 2;
    const screenY = rect.top + rect.height / 2;

    editor.dispatch('mousedown', { button, screenX, screenY, target } as unknown as MouseEvent);
    editor.dispatch('mousemove', { button, screenX: screenX + 20, screenY: screenY + 20, clientX: 0, clientY: 0, target } as unknown as MouseEvent);
    editor.dom.dispatch(document.body, 'mouseup');

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
    await pAssertNotification('Dropped file type is not supported');

    // Note: The paste logic will handle this
    await DragnDrop.pDropItems(TinyDom.body(editor), [
      { data: 'Some content', type: 'text/plain' }
    ], true);
    await Waiter.pWait(50); // Wait a small amount of time as we are asserting nothing happened
    UiFinder.notExists(SugarBody.body(), '.tox-notification');

    const toolbar = UiFinder.findIn(SugarBody.body(), '.tox-toolbar__primary').getOrDie();
    await DragnDrop.pDropFiles(toolbar, [
      createFile('test.js', 123, new Blob([ 'var a = "content";' ], { type: 'application/javascript' }))
    ]);
    await pAssertNotification('Dropped file type is not supported');
  });

  it('TINY-8874: Dragging CEF element towards the bottom edge causes scrolling', async () => {
    const editor = hook.editor();
    await Waiter.pWait(200); // Wait a small amount of time to ensure the events have been bound
    editor.setContent(`
      <p contenteditable="false" style="height: 200px; background-color: black; color: white">Draggable CEF</p>
      <p id="separator" style="height: 100px"></p>
      <p id="hidden" style="height: 300px"></p>
      <p>CEF can get dragged after this one</p>
    `);
    const target = UiFinder.findIn(TinyDom.body(editor), 'p:contains("Draggable CEF")').getOrDie();
    const dest = UiFinder.findIn(TinyDom.body(editor), '#separator').getOrDie();
    const initialScrollY = editor.getBody().ownerDocument.defaultView.scrollY;
    Mouse.mouseDown(target);
    Mouse.mouseMoveTo(dest, 0, 98); // Move the mouse close to the bottom edge of the editor to trigger scrolling
    await Waiter.pWait(1000); // Wait a small amount of time to ensure the scrolling happens
    Mouse.mouseUp(target);
    assert.isTrue(editor.getBody().ownerDocument.defaultView.scrollY > initialScrollY); // Make sure scrolling happened
  });

  it('TINY-8874: Dragging CEF element towards the upper edge causes scrolling', async () => {
    const editor = hook.editor();
    await Waiter.pWait(200); // Wait a small amount of time to ensure the events have been bound
    editor.setContent(`
      <p>CEF can get dragged before this one</p>
      <p id="hidden" style="height: 300px"></p>
      <p id="separator" style="height: 100px"></p>
      <p contenteditable="false" style="height: 200px; background-color: black; color: white">Draggable CEF</p>
    `);
    editor.getBody().ownerDocument.defaultView.scroll({
      top: 450
    });
    const target = UiFinder.findIn(TinyDom.body(editor), 'p:contains("Draggable CEF")').getOrDie();
    const dest = UiFinder.findIn(TinyDom.body(editor), '#separator').getOrDie();
    const initialScrollY = editor.getBody().ownerDocument.defaultView.scrollY;
    Mouse.mouseDown(target);
    Mouse.mouseMoveTo(dest, 0, 2); // Move the mouse close to the top edge of the editor to trigger scrolling
    await Waiter.pWait(1000); // Wait a small amount of time to ensure the scrolling happens
    Mouse.mouseUp(target);
    assert.isTrue(editor.getBody().ownerDocument.defaultView.scrollY < initialScrollY); // Make sure scrolling happened
  });

  it('TINY-8874: Dragging CEF element towards the right edge causes scrolling', async () => {
    const editor = hook.editor();
    await Waiter.pWait(200); // Wait a small amount of time to ensure the events have been bound
    editor.setContent(`
      <div style="display: flex">
      <p contenteditable="false" style="flex: 0 0 200px; background-color: black; color: white">Draggable CEF</p>
      <p id="separator" style="flex: 0 0 200px"></p>
      <p style="margin-right: 16px">CEF can get dragged after this one</p>
      <p class="target" style="flex: 0 0 200px; height: 300px">Content</p>
      </div>
    `);
    const target = UiFinder.findIn(TinyDom.body(editor), 'p:contains("Draggable CEF")').getOrDie();
    const initialScrollX = editor.getBody().ownerDocument.defaultView.scrollX;
    Mouse.mouseDown(target);
    Mouse.mouseMoveTo(SugarElement.fromDom(editor.getBody()), 298, 5); // Move the mouse close to the right edge of the editor to trigger scrolling
    await Waiter.pWait(1500); // Wait a small amount of time to ensure the scrolling happens
    assert.isAbove(editor.getBody().ownerDocument.defaultView.scrollX, initialScrollX); // Make sure scrolling happened
  });

  it('TINY-8874: Dragging CEF element towards the left edge causes scrolling', async () => {
    const editor = hook.editor();
    await Waiter.pWait(200); // Wait a small amount of time to ensure the events have been bound
    editor.setContent(`
      <div style="display: flex">
      <p class="target" style="margin-right: 16px">CEF can get dragged before this one</p>
      <p id="separator" style="flex: 0 0 200px;"></p>
      <p contenteditable="false" style="flex: 0 0 200px; background-color: black; color: white">Draggable CEF</p>
      </div>
    `);
    editor.getBody().ownerDocument.defaultView.scroll({
      left: 450
    });
    const target = UiFinder.findIn(TinyDom.body(editor), 'p:contains("Draggable CEF")').getOrDie();
    const initialScrollX = editor.getBody().ownerDocument.defaultView.scrollX;
    Mouse.mouseDown(target);
    Mouse.mouseMoveTo(SugarElement.fromDom(editor.getBody()), 2, 5); // Move the mouse close to the right edge of the editor to trigger scrolling
    await Waiter.pWait(1500); // Wait a small amount of time to ensure the scrolling happens
    Mouse.mouseUp(target);
    assert.isBelow(editor.getBody().ownerDocument.defaultView.scrollX, initialScrollX); // Make sure scrolling happened
  });

});
