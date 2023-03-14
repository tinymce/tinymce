import { Assertions, DragnDrop, Keyboard, Keys, Mouse, UiFinder, Waiter } from '@ephox/agar';
import { before, beforeEach, context, describe, it } from '@ephox/bedrock-client';
import { Arr, Type } from '@ephox/katamari';
import { Html, SelectorFind, SugarBody, SugarElement, SugarLocation, Traverse } from '@ephox/sugar';
import { TinyAssertions, TinyDom, TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.DragDropOverridesTest', () => {
  context('Tests when the editor is inside the viewport', () => {
    let events: DragEvent[] = [];
    const hook = TinyHooks.bddSetup<Editor>({
      indent: false,
      menubar: false,
      base_url: '/project/tinymce/js/tinymce',
      height: 300,
      width: 300,
    }, [], true);

    before(async () => {
      hook.editor().on('dragstart drop dragend', (e: DragEvent) => {
        events = [ ...events, e ];
      });
      await Waiter.pWait(100); // Wait a small amount of time to ensure the events have been bound
    });

    beforeEach(() => {
      events = [];
      Mouse.mouseMoveTo(SugarBody.body(), 0, 0);
    });

    const assertEventsDispatched = (expectedTypes: string[]) => {
      const eventTypes = Arr.map(events, (e) => e.type);

      assert.deepEqual(eventTypes, expectedTypes);
    };

    const assertDndEvent = (expectedType: string, expectedClass: string, assertMouseCords = true) => {
      const event = Arr.find(events, ({ type }) => type === expectedType).getOrDie(`Could not find expected event type: ${expectedType}`);
      const cordKeys = [ 'x', 'y', 'clientX', 'clientY', 'screenX', 'screenY', 'pageX', 'pageY' ] as const;

      if (assertMouseCords) {
        Arr.each(cordKeys, (key) => assert.isAtLeast(event[key], 1));
      }

      assert.equal((event.target as HTMLElement)?.className.trim(), expectedClass, `Expected target on "${expectedType}" event to have class`);
      assert.equal((event.srcElement as HTMLElement)?.className.trim(), expectedClass, `Expected srcElement on "${expectedType}" event to have class`);
    };

    const pMouseMoveToCaretChange = (editor: Editor, target: SugarElement<Element>, dx = 0, dy = 0) => {
      const { startContainer, startOffset } = editor.selection.getRng();
      Mouse.mouseMoveTo(target, dx, dy);
      return Waiter.pTryUntilPredicate('Waited for selection to change', () => {
        const newRng = editor.selection.getRng();
        return newRng.startContainer !== startContainer || newRng.startOffset !== startOffset;
      });
    };

    const makeMouseEvent = <K extends keyof MouseEvent>(type: string, props: Record<K, MouseEvent[K]>): MouseEvent => {
      const mouseEvent = new MouseEvent(type) as Record<string, any>;
      const clone: Record<string, any> = {};

      // eslint-disable-next-line guard-for-in
      for (const key in mouseEvent) {
        const value = mouseEvent[key];
        if (!Type.isFunction(value)) {
          clone[key] = value;
        }
      }

      return { ...clone, ...props } as MouseEvent;
    };

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
      editor.setContent('<p contenteditable="false" class="draggable">a</p>');
      const target = UiFinder.findIn(TinyDom.body(editor), '.draggable').getOrDie().dom;
      const rect = target.getBoundingClientRect();
      const button = 0;
      const screenX = rect.left + rect.width / 2;
      const screenY = rect.top + rect.height / 2;

      editor.dispatch('mousedown', makeMouseEvent('mousedown', { button, screenX, screenY, target }));
      editor.dispatch('mousemove', makeMouseEvent('mousemove', { button, screenX: screenX + 20, screenY: screenY + 20, clientX: 0, clientY: 0, target }));
      editor.dom.dispatch(document.body, 'mouseup', makeMouseEvent('mouseup', {}));

      assertEventsDispatched([ 'dragstart', 'dragend' ]);
    });

    it('TINY-7917: Dropping draggable element inside editor fires dragend event', async () => {
      const editor = hook.editor();
      editor.setContent('<p contenteditable="false" class="draggable">a</p><p class="dest">bc123</p>');
      const target = UiFinder.findIn(TinyDom.body(editor), '.draggable').getOrDie();
      const targetPosition = SugarLocation.viewport(target);

      const dest = UiFinder.findIn(TinyDom.body(editor), '.dest').getOrDie();
      const destPosition = SugarLocation.viewport(dest);
      const yDelta = destPosition.top - targetPosition.top;

      Mouse.mouseDown(target);
      // Drag CE=F paragraph roughly into other paragraph in order to trigger a valid drop on mouseup
      await pMouseMoveToCaretChange(editor, target, 15, yDelta + 5);
      Mouse.mouseUp(dest, { dx: 5, dy: 5 });

      assertEventsDispatched([ 'dragstart', 'drop', 'dragend' ]);

      assertDndEvent('dragstart', 'draggable');
      assertDndEvent('drop', 'dest');
      assertDndEvent('dragend', 'mce-content-body');
    });

    it('TINY-9599: Dropping draggable element should be preventable', async () => {
      const editor = hook.editor();
      const initialContent = '<p class="draggable" contenteditable="false">a</p><p class="dest">bc123</p>';
      editor.setContent(initialContent);
      const target = UiFinder.findIn(TinyDom.body(editor), '.draggable').getOrDie();
      const targetPosition = SugarLocation.viewport(target);

      const dest = UiFinder.findIn(TinyDom.body(editor), '.dest').getOrDie();
      const destPosition = SugarLocation.viewport(dest);
      const yDelta = destPosition.top - targetPosition.top;

      editor.once('drop', (e) => {
        e.preventDefault();
      });

      Mouse.mouseDown(target);
      // Drag CE=F paragraph roughly into other paragraph in order to trigger a valid drop on mouseup
      await pMouseMoveToCaretChange(editor, target, 15, yDelta + 5);
      Mouse.mouseUp(dest, { dx: 5, dy: 5 });

      TinyAssertions.assertContent(editor, initialContent);
    });

    it('TINY-7917: Pressing escape during drag fires dragend event', async () => {
      const editor = hook.editor();
      editor.setContent('<p class="draggable" contenteditable="false">a</p><p class="dest">bc123</p>');
      const target = UiFinder.findIn(TinyDom.body(editor), '.draggable').getOrDie();
      const targetPosition = SugarLocation.viewport(target);

      const dest = UiFinder.findIn(TinyDom.body(editor), '.dest').getOrDie();
      const destPosition = SugarLocation.viewport(dest);
      const yDelta = destPosition.top - targetPosition.top;

      Mouse.mouseDown(target);
      // Where we drag to here is largely irrelevant
      await pMouseMoveToCaretChange(editor, target, 15, yDelta + 5);
      Keyboard.activeKeydown(TinyDom.document(editor), Keys.escape());

      assertEventsDispatched([ 'dragstart', 'dragend' ]);

      assertDndEvent('dragstart', 'draggable');
      assertDndEvent('dragend', 'draggable', false);
    });

    it('TINY-6027: Drag unsupported file into the editor/UI is prevented', async () => {
      const editor = hook.editor();
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
      editor.setContent(`
      <p contenteditable="false" style="height: 200px; background-color: black; color: white">Draggable CEF</p>
      <p id="separator" style="height: 100px"></p>
      <p id="hidden" style="height: 300px"></p>
      <p>CEF can get dragged after this one</p>
    `);
      const target = UiFinder.findIn(TinyDom.body(editor), 'p:contains("Draggable CEF")').getOrDie();
      const dest = UiFinder.findIn(TinyDom.body(editor), '#separator').getOrDie();
      const initialScrollY = editor.getWin().scrollY;
      Mouse.mouseDown(target);
      Mouse.mouseMoveTo(dest, 0, 98); // Move the mouse close to the bottom edge of the editor to trigger scrolling
      await Waiter.pTryUntil('Waiting for the editor to scroll down', () => {
        assert.isAbove(editor.getWin().scrollY, initialScrollY); // Make sure scrolling happened
      });
    });

    it('TINY-8874: Dragging CEF element towards the upper edge causes scrolling', async () => {
      const editor = hook.editor();
      editor.setContent(`
      <p>CEF can get dragged before this one</p>
      <p id="hidden" style="height: 300px"></p>
      <p class="separator" style="height: 100px"></p>
      <p contenteditable="false" style="height: 200px; background-color: black; color: white">Draggable CEF</p>
    `);
      editor.getWin().scroll({
        top: 400,
        behavior: 'auto'
      });
      await Waiter.pWait(1500);
      const target = UiFinder.findIn(TinyDom.body(editor), 'p:contains("Draggable CEF")').getOrDie();
      const initialScrollY = editor.getWin().scrollY;
      const dest = TinyDom.body(editor);
      Mouse.mouseDown(target);
      Mouse.mouseMoveTo(dest, 0, 5); // Move the mouse close to the top edge of the editor to trigger scrolling
      await Waiter.pTryUntil('Waiting for the editor to scroll up', () => {
        assert.isBelow(editor.getWin().scrollY, initialScrollY); // Make sure scrolling happened
      });
    });

    it('TINY-8874: Dragging CEF element towards the right edge causes scrolling', async () => {
      const editor = hook.editor();
      editor.setContent(`
        <div style="display: flex">
        <p contenteditable="false" style="flex: 0 0 200px; background-color: black; color: white">Draggable CEF</p>
        <p id="separator" style="flex: 0 0 200px"></p>
        <p style="margin-right: 16px">CEF can get dragged after this one</p>
        <p class="target" style="flex: 0 0 200px; height: 300px">Content</p>
        </div>
      `);
      const target = UiFinder.findIn(TinyDom.body(editor), 'p:contains("Draggable CEF")').getOrDie();
      const initialScrollX = editor.getWin().scrollX;
      Mouse.mouseDown(target);
      Mouse.mouseMoveTo(TinyDom.body(editor), 298, 12); // Move the mouse close to the right edge of the editor to trigger scrolling
      await Waiter.pTryUntil('Waiting for the editor to scroll right', () => {
        assert.isAbove(editor.getWin().scrollX, initialScrollX); // Make sure scrolling happened
      });
    });

    it('TINY-8874: Dragging CEF element towards the left edge causes scrolling', async () => {
      const editor = hook.editor();
      editor.setContent(`
      <div style="display: flex">
      <p class="target" style="margin-right: 16px">CEF can get dragged before this one</p>
      <p id="separator" style="flex: 0 0 200px;"></p>
      <p contenteditable="false" style="flex: 0 0 200px; background-color: black; color: white">Draggable CEF</p>
      </div>
    `);
      editor.getWin().scroll({
        left: 450
      });
      const target = UiFinder.findIn(TinyDom.body(editor), 'p:contains("Draggable CEF")').getOrDie();
      const initialScrollX = editor.getWin().scrollX;
      Mouse.mouseDown(target);
      Mouse.mouseMoveTo(TinyDom.body(editor), 2, 9); // Move the mouse close to the right edge of the editor to trigger scrolling
      await Waiter.pTryUntil('Waiting for the editor to scroll left', () => {
        assert.isBelow(editor.getWin().scrollX, initialScrollX); // Make sure scrolling happened
      });
    });
  });

  context('Tests when edges of the editor are outside current viewport', () => {
    const hook = TinyHooks.bddSetup<Editor>({
      indent: false,
      menubar: false,
      base_url: '/project/tinymce/js/tinymce',
      height: window.innerHeight + 1000,
      width: window.innerWidth + 1000,
    }, [], true);

    before(async () => {
      await Waiter.pWait(100); // Wait a small amount of time to ensure the events have been bound
    });

    it('TINY-8874: Dragging CEF element towards the bottom edge causes scrolling when autoresize is set', async () => {
      const editor = hook.editor();
      await Waiter.pWait(500);
      editor.setContent(`
      <p contenteditable="false" style="height: 200px; background-color: black; color: white">Draggable CEF</p>
      <p id="separator" style="height: 100px"></p>
      <p class="hidden" style="height: 1500px"></p>
      <p>CEF can get dragged after this one</p>
    `);
      const target = UiFinder.findIn(TinyDom.body(editor), 'p:contains("Draggable CEF")').getOrDie();
      const dest = UiFinder.findIn(TinyDom.body(editor), 'p.hidden').getOrDie();
      const initialScrollY = window.scrollY;
      Mouse.mouseDown(target);
      Mouse.mouseMoveTo(dest, 0, window.innerHeight - 2); // Move the mouse close to the bottom edge of the editor to trigger scrolling
      await Waiter.pTryUntil('Waiting for editor to scroll down', () => {
        assert.isAbove(window.scrollY, initialScrollY); // Make sure scrolling happened
      });
    });

    it('TINY-8874: Dragging CEF element towards the upper edge causes scrolling', async () => {
      const editor = hook.editor();
      editor.setContent(`
      <p>CEF can get dragged before this one</p>
      <p class="hidden" style="height: 1500px"></p>
      <p id="separator" style="height: 100px"></p>
      <p contenteditable="false" style="height: 200px; background-color: black; color: white">Draggable CEF</p>
    `);
      window.scroll({
        top: window.innerHeight + 2000
      });
      const target = UiFinder.findIn(TinyDom.body(editor), 'p:contains("Draggable CEF")').getOrDie();
      const initialScrollY = window.scrollY;
      const dest = UiFinder.findIn(TinyDom.body(editor), 'p.hidden').getOrDie();
      Mouse.mouseDown(target);
      Mouse.mouseMoveTo(dest, 0, 2); // Move the mouse close to the top edge of the editor to trigger scrolling
      await Waiter.pTryUntil('Waiting for editor to scroll up', () => {
        assert.isBelow(window.scrollY, initialScrollY); // Make sure scrolling happened
      });
    });

    it('TINY-9025: Dragging CEF element outside the editor should not cause scrolling', async () => {
      const editor = hook.editor();
      editor.setContent(`
      <p>CEF can get dragged before this one</p>
      <p class="hidden" style="height: 1500px"></p>
      <p id="separator" style="height: 100px"></p>
      <p contenteditable="false" style="height: 200px; background-color: black; color: white">Draggable CEF</p>
    `);
      window.scroll({
        top: window.innerHeight + 2000
      });
      const target = UiFinder.findIn(TinyDom.body(editor), 'p:contains("Draggable CEF")').getOrDie();
      const initialScrollY = window.scrollY;
      editor.getWin().scroll({
        top: editor.getWin().innerHeight
      });
      Mouse.mouseDown(target);
      window.dispatchEvent(new MouseEvent('mousemove', {
        clientY: window.innerHeight,
      }));
      await Waiter.pWait(100);
      Mouse.mouseUp(target);
      assert.strictEqual(window.scrollY, initialScrollY);
    });

    it('TINY-8874: Dragging CEF element towards the right edge causes scrolling', async () => {
      const editor = hook.editor();
      editor.setContent(`
      <div style="display: flex">
      <p contenteditable="false" style="flex: 0 0 200px; background-color: black; color: white">Draggable CEF</p>
      <p id="separator" style="flex: 0 0 1500px"></p>
      <p style="margin-right: 16px">CEF can get dragged after this one</p>
      <p class="target" style="flex: 0 0 200px; height: 300px">Content</p>
      </div>
    `);
      window.scroll({
        top: 0
      });
      const target = UiFinder.findIn(TinyDom.body(editor), 'p:contains("Draggable CEF")').getOrDie();
      const initialScrollX = window.scrollX;
      Mouse.mouseDown(target);
      Mouse.mouseMoveTo(TinyDom.body(editor), window.innerWidth - 4, 20); // Move the mouse close to the right edge of the editor to trigger scrolling
      await Waiter.pTryUntil('Waiting for editor to scroll right', () => {
        assert.isAbove(window.scrollX, initialScrollX); // Make sure scrolling happened
      });
    });

    it('TINY-8874: Dragging CEF element towards the left edge causes scrolling', async () => {
      const editor = hook.editor();
      editor.setContent(`
      <div style="display: flex">
      <p class="target" style="margin-right: 16px">CEF can get dragged before this one</p>
      <p class="separator" style="flex: 0 0 1500px;"></p>
      <p contenteditable="false" style="flex: 0 0 200px; background-color: black; color: white">Draggable CEF</p>
      </div>
    `);
      window.scroll({
        left: window.innerWidth + 2000
      });
      const target = UiFinder.findIn(TinyDom.body(editor), 'p:contains("Draggable CEF")').getOrDie();
      const initialScrollX = window.scrollX;
      const dest = UiFinder.findIn(TinyDom.body(editor), 'p.separator').getOrDie();
      Mouse.mouseDown(target);
      Mouse.mouseMoveTo(dest, 200, 8); // Move the mouse close to the right edge of the editor to trigger scrolling
      await Waiter.pTryUntil('Waiting for editor to scroll left', () => {
        assert.isBelow(window.scrollX, initialScrollX); // Make sure scrolling happened
      });
    });

  });

  context('Tests when CEF element are dragged on other CEF element', () => {
    const getBaseCEFElement = (name: string) =>
      `<div class="${name}" style="margin: 40px; width: 1110px; height: 120px;" contenteditable="false">${name}</div>`;

    const getContentWithCefElements = (elementsNames: string[]): string => {
      if (!Arr.contains(elementsNames, 'toDrag') || !Arr.contains(elementsNames, 'destination')) {
      // eslint-disable-next-line no-throw-literal
        throw new Error('This function require to have an element named toDrag and one destination');
      }
      return `<div>${Arr.foldl(elementsNames, (acc, elementName) =>
        acc + getBaseCEFElement(elementName)
      , '')}</div>`;
    };

    const hook = TinyHooks.bddSetupLight<Editor>({
      indent: false,
      menubar: false,
      base_url: '/project/tinymce/js/tinymce',
      height: 3000,
      extended_valid_elements: 'span[class|contenteditable]',
    }, [], true);

    const moveToDragElementToDestinationElement = async (editor: Editor, xOffset: number, yOffset: number) => {
      const toDrag = UiFinder.findIn(TinyDom.body(editor), '.toDrag').getOrDie();
      const toDragPosition = SugarLocation.viewport(toDrag);

      const dest = UiFinder.findIn(TinyDom.body(editor), '.destination').getOrDie();
      const destPosition = SugarLocation.viewport(dest);
      const yDelta = destPosition.top - toDragPosition.top;
      const xDelta = destPosition.left - toDragPosition.left;

      Mouse.mouseDown(toDrag);
      Mouse.mouseMoveTo(toDrag, xDelta + xOffset, yDelta + yOffset);

      // little trick that give "time" to CaretRange.fromPoint to find the position
      await Waiter.pWait(0);
      Mouse.mouseUp(toDrag);
    };

    it('TINY-8881: Dropping CEF element inside editor fires dragend event', async () => {
      const editor = hook.editor();
      editor.setContent(getContentWithCefElements([ 'obstacle', 'destination', 'toDrag' ]));
      await moveToDragElementToDestinationElement(editor, -5, -5);

      TinyAssertions.assertContent(editor, getContentWithCefElements([ 'obstacle', 'toDrag', 'destination' ]));
    });

    it('TINY-8881: Dragging CEF element over the first element should work as expected', async () => {
      const editor = hook.editor();
      editor.setContent(getContentWithCefElements([ 'destination', 'obstacle', 'toDrag' ]));
      await moveToDragElementToDestinationElement(editor, 10, -15);

      TinyAssertions.assertContent(editor, getContentWithCefElements([ 'toDrag', 'destination', 'obstacle' ]));
    });

    it('TINY-9364: Should prevent dropping an element onto the descendant of another CEF element', async () => {
      const editor = hook.editor();
      const originalContent = '<div class="toDrag" style="margin: 40px; width: 1110px; height: 120px; background-color: blue;" contenteditable="false">To drag element</div>'
      + '<div style="margin: 40px; width: 1110px; height: 120px; background-color: red;" contenteditable="false"><span class="destination">Destination element</span></div>';
      editor.setContent(originalContent);
      await moveToDragElementToDestinationElement(editor, 0, 0);

      TinyAssertions.assertContent(editor, originalContent);
    });

    it('TINY-9364: Should allow dropping an element onto a contenteditable=true element that is within a contenteditable=false element', async () => {
      const editor = hook.editor();
      const originalContent = '<div class="toDrag" style="margin: 40px; width: 1110px; height: 120px; background-color: blue;" contenteditable="false">To drag element</div>'
      + '<div style="margin: 40px; width: 1110px; height: 120px; background-color: red;" contenteditable="false"><div class="destination" contenteditable="true">Destination element</div></div>';
      const expectedContent = '<div style="margin: 40px; width: 1110px; height: 120px; background-color: red;" contenteditable="false">' +
      '<div class="destination" contenteditable="true">' +
      '<div class="toDrag" style="margin: 40px; width: 1110px; height: 120px; background-color: blue;" contenteditable="false">To drag element</div>Destination element</div>' +
    '</div>';
      editor.setContent(originalContent);
      await moveToDragElementToDestinationElement(editor, 0, 0);

      TinyAssertions.assertContent(editor, expectedContent);
    });

    it('TINY-9558: Should not be possible to drag a noneditable CEF element to a noneditable target within a noneditable root', async () => {
      const editor = hook.editor();
      const initialContent = '<div class="toDrag" contenteditable="false">To drag element</div><div class="destination">drop target</div>';

      editor.setContent(initialContent);
      editor.getBody().contentEditable = 'false';
      await moveToDragElementToDestinationElement(editor, 0, 0);
      TinyAssertions.assertContent(editor, initialContent);
      editor.getBody().contentEditable = 'true';
    });

    it('TINY-9558: Should not be possible to drag a noneditable CEF element to an editable target within a noneditable root', async () => {
      const editor = hook.editor();
      const initialContent = '<div class="toDrag" contenteditable="false">To drag element</div><div contenteditable="true"><div class="destination">drop target</div></div>';

      editor.setContent(initialContent);
      editor.getBody().contentEditable = 'false';
      await moveToDragElementToDestinationElement(editor, 0, 0);
      TinyAssertions.assertContent(editor, initialContent);
      editor.getBody().contentEditable = 'true';
    });

    context('Drag/drop padding', () => {
      const testDragDropPadding = async (testCase: { html: string; expectedHtml: string; expectedDragFromParentHtml: string }) => {
        const editor = hook.editor();

        editor.setContent(testCase.html);
        const dragFromParent = SelectorFind.descendant(TinyDom.body(editor), '.toDrag').bind(Traverse.parentElement).getOrDie('Should find toDrag parent');
        await moveToDragElementToDestinationElement(editor, 0, 0);
        assert.equal(Html.get(dragFromParent), testCase.expectedDragFromParentHtml, 'Drag from parent should be expected html');
        TinyAssertions.assertContent(editor, testCase.expectedHtml);
      };

      it('TINY-9606: Should insert padding br into empty blocks when dragging the last block child out', async () => testDragDropPadding({
        html: '<div><p class="toDrag" contenteditable="false">CEF</p></div><div class="destination">drop target</div>',
        expectedHtml: '<div>&nbsp;</div><div class="destination"><p class="toDrag" contenteditable="false">CEF</p>drop target</div>',
        expectedDragFromParentHtml: '<br data-mce-bogus="1">'
      }));

      it('TINY-9606: Should insert padding br into empty blocks when dragging the last inline child out', async () => testDragDropPadding({
        html: '<p><span class="toDrag" contenteditable="false">CEF</span></p><div class="destination">drop target</div>',
        expectedHtml: '<p>&nbsp;</p><div class="destination"><span class="toDrag" contenteditable="false">CEF</span>drop target</div>',
        expectedDragFromParentHtml: '<br data-mce-bogus="1">'
      }));

      it('TINY-9606: Should not insert padding br into blocks when not dragging the last child out', async () => testDragDropPadding({
        html: '<p>x<span class="toDrag" contenteditable="false">CEF</span></p><div class="destination">drop target</div>',
        expectedHtml: '<p>x</p><div class="destination"><span class="toDrag" contenteditable="false">CEF</span>drop target</div>',
        expectedDragFromParentHtml: 'x'
      }));
    });
  });
});
