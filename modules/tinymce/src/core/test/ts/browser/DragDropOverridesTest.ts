import { Assertions, DragnDrop, Keyboard, Keys, Mouse, UiFinder, Waiter } from '@ephox/agar';
import { before, beforeEach, context, describe, it } from '@ephox/bedrock-client';
import { DataTransfer, DataTransferMode, DragImageData } from '@ephox/dragster';
import { Arr, Fun, Obj, Optional, Type } from '@ephox/katamari';
import { KAssert } from '@ephox/katamari-assertions';
import { PlatformDetection } from '@ephox/sand';
import { Html, SelectorFind, SugarBody, SugarElement, SugarLocation, Traverse } from '@ephox/sugar';
import { TinyAssertions, TinyDom, TinyHooks, TinyState } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

interface DataTransferSpec {
  readonly data: { type: string; value: string }[];
  readonly dragImage?: { image: Element; x: number; y: number };
  readonly dropEffect: 'none' | 'copy' | 'link' | 'move';
  readonly effectAllowed: 'none' | 'copy' | 'copyLink' | 'copyMove' | 'link' | 'linkMove' | 'move' | 'all' | 'uninitialized';
  readonly files: File[];
}

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

    const findEvent = (eventType: string): Optional<DragEvent> => Arr.find(events, ({ type }) => type === eventType);

    const getDataTransferFromEvent = (eventType: string): Optional<DataTransfer> =>
      findEvent(eventType).bind((event) => Optional.from(event.dataTransfer));

    const assertEventsDispatched = (expectedTypes: string[]) => {
      const eventTypes = Arr.map(events, (e) => e.type);

      assert.deepEqual(eventTypes, expectedTypes);
    };

    const assertDataTransferFiles = (files: FileList, expectedFiles: File[], eventType: string) => {
      if (expectedFiles.length === 0) {
        assert.strictEqual(files.length, 0, `length property should be 0 since dataTransfer on "${eventType}" event is expected to have no file`);
        assert.isNull(files.item(0), `item(0) should return null since dataTransfer on "${eventType}" event is expected to have no file`);
      } else {
        Arr.each(expectedFiles, (specFile) => {
          Arr.find(files, (file) => Obj.equal(file as unknown as Record<string, unknown>, specFile as unknown as Record<string, unknown>))
            .fold(
              () => assert.fail(`Expected dataTransfer on "${eventType}" event to have file ${specFile.name}`),
              Fun.noop
            );
        });
      }
    };

    const assertDndEventDataTransfer = (eventType: string, spec: DataTransferSpec) =>
      getDataTransferFromEvent(eventType).fold(
        () => assert.fail(`Expected ${eventType} event to have dataTransfer object`),
        (dataTransfer) => {
          if (eventType === 'dragstart') {
            assert.isTrue(DataTransferMode.isInReadWriteMode(dataTransfer), `Expected dataTransfer of ${eventType} to be in readwrite mode`);
          } else if (eventType === 'drop') {
            assert.isTrue(DataTransferMode.isInReadOnlyMode(dataTransfer), `Expected dataTransfer of ${eventType} event to be in readonly mode`);
          } else {
            assert.isTrue(DataTransferMode.isInProtectedMode(dataTransfer), `Expected dataTransfer of ${eventType} event to be in protected mode`);
            // Temporarily set to read-only to allow checking of data
            DataTransferMode.setReadOnlyMode(dataTransfer);
          }

          Arr.each(spec.data, ({ type, value }) => assert.equal(dataTransfer.getData(type), value, `Expected dataTransfer on "${eventType}" event to have ${type} data`));
          assert.equal(dataTransfer.dropEffect, spec.dropEffect, `Expected dataTransfer on "${eventType}" event to have dropEffect`);
          assert.equal(dataTransfer.effectAllowed, spec.effectAllowed, `Expected dataTransfer on "${eventType}" event to have effectAllowed`);
          KAssert.eqOptional(`Expected dataTransfer on "${eventType}" event to have dragImage`, Optional.from(spec.dragImage), DataTransfer.getDragImage(dataTransfer));

          assertDataTransferFiles(dataTransfer.files, spec.files, eventType);

          if (eventType === 'dragend') {
            DataTransferMode.setProtectedMode(dataTransfer);
          }
        }
      );

    const assertDndEvent = (expectedType: string, expectedClass: string, expectedDataTransferSpec: DataTransferSpec, assertMouseCords = true) => {
      const event = findEvent(expectedType).getOrDie(`Could not find expected event type: ${expectedType}`);
      const cordKeys = [ 'x', 'y', 'clientX', 'clientY', 'screenX', 'screenY', 'pageX', 'pageY' ] as const;

      if (assertMouseCords) {
        Arr.each(cordKeys, (key) => assert.isAtLeast(event[key], 1));
      }

      assert.equal((event.target as HTMLElement)?.className.trim(), expectedClass, `Expected target on "${expectedType}" event to have class`);
      assert.equal((event.srcElement as HTMLElement)?.className.trim(), expectedClass, `Expected srcElement on "${expectedType}" event to have class`);
      assertDndEventDataTransfer(expectedType, expectedDataTransferSpec);
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

    const pDragDropElementInsideEditor = async (editor: Editor): Promise<void> => {
      editor.setContent(`<p contenteditable="false" class="draggable">a</p><p class="dest">bc123</p>`);
      const target = UiFinder.findIn(TinyDom.body(editor), '.draggable').getOrDie();
      const targetPosition = SugarLocation.viewport(target);

      const dest = UiFinder.findIn(TinyDom.body(editor), '.dest').getOrDie();
      const destPosition = SugarLocation.viewport(dest);
      const yDelta = destPosition.top - targetPosition.top;

      Mouse.mouseDown(target);
      // Drag CE=F paragraph roughly into other paragraph in order to trigger a valid drop on mouseup
      await pMouseMoveToCaretChange(editor, target, 15, yDelta + 5);
      Mouse.mouseUp(dest, { dx: 5, dy: 5 });
    };

    const defaultDataTransferSpec: DataTransferSpec = {
      data: [{
        type: 'text/html',
        value: PlatformDetection.detect().browser.isFirefox()
          ? '<p class="draggable" data-mce-selected="1" contenteditable="false">a</p>'
          : '<p contenteditable="false" class="draggable" data-mce-selected="1">a</p>'
      }],
      dropEffect: 'move',
      effectAllowed: 'all',
      files: []
    };

    const assertDnDEventsDragDropElementInsideEditor = (customSpec?: DataTransferSpec) => {
      assertDndEvent('dragstart', 'draggable', {
        ...defaultDataTransferSpec,
        ...customSpec
      });
      assertDndEvent('drop', 'dest', {
        ...defaultDataTransferSpec,
        ...customSpec
      });
      assertDndEvent('dragend', 'mce-content-body', {
        ...defaultDataTransferSpec,
        ...customSpec
      });
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
      await pDragDropElementInsideEditor(editor);

      assertEventsDispatched([ 'dragstart', 'drop', 'dragend' ]);
      assertDnDEventsDragDropElementInsideEditor();
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
      editor.setContent('<p contenteditable="false" class="draggable">a</p><p class="dest">bc123</p>');
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
      assertDndEvent('dragstart', 'draggable', defaultDataTransferSpec);
      assertDndEvent('dragend', 'draggable', defaultDataTransferSpec, false);
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

    it('TINY-9601: dataTransfer data modified in dragstart event should persist in drop and dragend events and in content inserted on drop', async () => {
      const editor = hook.editor();

      const testImage: DragImageData = {
        image: document.createElement('div'),
        x: 10,
        y: 20
      };
      const testFile1 = new window.File([ 'Lorem ipsum' ], 'test.txt', { type: 'text/plain' });
      const testFile2 = new window.File([ '<p>Lorem ipsum</p>' ], 'test2.html', { type: 'text/html' });
      const newHtmlData = '<p contenteditable="false">test</p>';

      const dragstartCallback = (e: DragEvent) => {
        const dataTransfer = e.dataTransfer;
        if (!Type.isNull(dataTransfer)) {
          dataTransfer.dropEffect = 'copy';
          dataTransfer.effectAllowed = 'copy';
          dataTransfer.setData('text/html', newHtmlData);
          dataTransfer.setData('text/plain', 'test');
          dataTransfer.setDragImage(testImage.image, testImage.x, testImage.y);
          dataTransfer.items.add(testFile1);
          dataTransfer.items.add(testFile2);
        }
      };

      editor.on('dragstart', dragstartCallback);
      await pDragDropElementInsideEditor(editor);
      editor.off('dragstart', dragstartCallback);

      assertEventsDispatched([ 'dragstart', 'drop', 'dragend' ]);
      assertDnDEventsDragDropElementInsideEditor({
        data: [{ type: 'text/html', value: newHtmlData }, { type: 'text/plain', value: 'test' }],
        dragImage: testImage,
        dropEffect: 'copy',
        effectAllowed: 'copy',
        files: [ testFile1, testFile2 ],
      });

      TinyAssertions.assertContent(editor, `<p class="dest">bc</p>${newHtmlData}<p class="dest">123</p>`);
    });

    it('TINY-9601: Modifying dataTransfer from one event should not affect dataTransfer of other events within a single drag-drop operation', async () => {
      const editor = hook.editor();

      let dragstartDataTransfer: DataTransfer | null = null;
      let dropDataTransfer: DataTransfer | null = null;
      let dragendDataTransfer: DataTransfer | null = null;

      const dragstartCallback = (e: DragEvent) => dragstartDataTransfer = e.dataTransfer;
      const dropCallback = (e: DragEvent) => dropDataTransfer = e.dataTransfer;
      const dragendCallback = (e: DragEvent) => dragendDataTransfer = e.dataTransfer;

      editor.on('dragstart', dragstartCallback);
      editor.on('drop', dropCallback);
      editor.on('dragend', dragendCallback);

      await pDragDropElementInsideEditor(editor);

      editor.off('dragstart', dragstartCallback);
      editor.off('drop', dropCallback);
      editor.off('dragend', dragendCallback);

      assertEventsDispatched([ 'dragstart', 'drop', 'dragend' ]);

      // Do this so that TypeScript does not complain about the dataTransfer objects being null
      let nullDataTransfer = false;
      if (Type.isNull(dragstartDataTransfer)) {
        dragstartDataTransfer = DataTransfer.createDataTransfer();
        nullDataTransfer = true;
      }
      if (Type.isNull(dropDataTransfer)) {
        dropDataTransfer = DataTransfer.createDataTransfer();
        nullDataTransfer = true;
      }
      if (Type.isNull(dragendDataTransfer)) {
        dragendDataTransfer = DataTransfer.createDataTransfer();
        nullDataTransfer = true;
      }
      if (nullDataTransfer) {
        assert.fail('One or more dataTransfer objects from drag events were unexpectedly null');
      }

      // Ensure dataTransfer objects do not share references
      assert.notStrictEqual(dragstartDataTransfer, dropDataTransfer, 'dragstart and drop dataTransfer objects should not share references');
      assert.notStrictEqual(dragstartDataTransfer, dragendDataTransfer, 'dragstart and dragend dataTransfer objects should not share references');
      assert.notStrictEqual(dropDataTransfer, dragendDataTransfer, 'drop and dragend dataTransfer objects should not share references');

      // Ensure modes are as expected and have not been unexpected mutated as drag events are dispatched
      assert.isTrue(DataTransferMode.isInReadWriteMode(dragstartDataTransfer), 'dragstart dataTransfer should be in read-write mode');
      assert.isTrue(DataTransferMode.isInReadOnlyMode(dropDataTransfer), 'drop dataTransfer should be in read-only mode');
      assert.isTrue(DataTransferMode.isInProtectedMode(dragendDataTransfer), 'dragend dataTransfer should be in protected mode');

      // Ensure scopes are not shared between dataTransfer objects. If scopes are shared then data
      // could be retrieved from dragend dataTransfer even though it is in protected mode.
      assert.equal(dragendDataTransfer.getData('text/html'), '', 'dragend dataTransfer should not retrieve any data as it is in protected mode');

      // Change drop & dragend datatransfer from protected to read-write for testing
      DataTransferMode.setReadWriteMode(dropDataTransfer);
      DataTransferMode.setReadWriteMode(dragendDataTransfer);

      // Test string data
      const initialHtmlData = dropDataTransfer.getData('text/html');
      assert.equal(dragstartDataTransfer.getData('text/html'), initialHtmlData, 'dragstart dataTransfer should retrieve expected initial data');
      assert.equal(dropDataTransfer.getData('text/html'), initialHtmlData, 'drop dataTransfer should retrieve expected initial data');
      assert.equal(dragendDataTransfer.getData('text/html'), initialHtmlData, 'dragend dataTransfer should retrieve expected initial data');

      const modifiedHtmlData1 = `${initialHtmlData}<p contenteditable="false">modification1</p>`;
      dragstartDataTransfer.setData('text/html', modifiedHtmlData1);
      assert.equal(dragstartDataTransfer.getData('text/html'), modifiedHtmlData1, 'dragstart dataTransfer should retrieve modified data 1');
      assert.equal(dropDataTransfer.getData('text/html'), initialHtmlData, 'drop dataTransfer should retrieve initial data');
      assert.equal(dragendDataTransfer.getData('text/html'), initialHtmlData, 'dragend dataTransfer should retrieve initial data');

      const modifiedHtmlData2 = `${initialHtmlData}<p contenteditable="false">modification2</p>`;
      dropDataTransfer.setData('text/html', modifiedHtmlData2);
      assert.equal(dragstartDataTransfer.getData('text/html'), modifiedHtmlData1, 'dragstart dataTransfer should retrieve modified data 1');
      assert.equal(dropDataTransfer.getData('text/html'), modifiedHtmlData2, 'drop dataTransfer should retrieve modified data 2');
      assert.equal(dragendDataTransfer.getData('text/html'), initialHtmlData, 'dragend dataTransfer should retrieve initial data');

      const modifiedHtmlData3 = `${initialHtmlData}<p contenteditable="false">modification3</p>`;
      dragendDataTransfer.setData('text/html', modifiedHtmlData3);
      assert.equal(dragstartDataTransfer.getData('text/html'), modifiedHtmlData1, 'dragstart dataTransfer should retrieve modified data 1');
      assert.equal(dropDataTransfer.getData('text/html'), modifiedHtmlData2, 'drop dataTransfer should retrieve modified data 2');
      assert.equal(dragendDataTransfer.getData('text/html'), modifiedHtmlData3, 'dragend dataTransfer should retrieve modified data 3');

      // Test image data
      KAssert.eqNone('dragstart dataTransfer should have no image data', DataTransfer.getDragImage(dragstartDataTransfer));
      KAssert.eqNone('drop dataTransfer should have no image data', DataTransfer.getDragImage(dropDataTransfer));
      KAssert.eqNone('dragend dataTransfer should have no image data', DataTransfer.getDragImage(dragendDataTransfer));

      const testImage1 = {
        image: document.createElement('div'),
        x: 10,
        y: 20
      };
      dragstartDataTransfer.setDragImage(testImage1.image, testImage1.x, testImage1.y);
      KAssert.eqSome('dragstart dataTransfer should have image data', testImage1, DataTransfer.getDragImage(dragstartDataTransfer));
      KAssert.eqNone('drop dataTransfer should have no image data', DataTransfer.getDragImage(dropDataTransfer));
      KAssert.eqNone('dragend dataTransfer should have no image data', DataTransfer.getDragImage(dragendDataTransfer));

      const testImage2 = {
        image: document.createElement('div'),
        x: 30,
        y: 40
      };
      dropDataTransfer.setDragImage(testImage2.image, testImage2.x, testImage2.y);
      KAssert.eqSome('dragstart dataTransfer should have image data', testImage1, DataTransfer.getDragImage(dragstartDataTransfer));
      KAssert.eqSome('drop dataTransfer should have image data', testImage2, DataTransfer.getDragImage(dropDataTransfer));
      KAssert.eqNone('dragend dataTransfer should have no image data', DataTransfer.getDragImage(dragendDataTransfer));

      const testImage3 = {
        image: document.createElement('div'),
        x: 50,
        y: 60
      };
      dragendDataTransfer.setDragImage(testImage3.image, testImage3.x, testImage3.y);
      KAssert.eqSome('dragstart dataTransfer should have image data', testImage1, DataTransfer.getDragImage(dragstartDataTransfer));
      KAssert.eqSome('drop dataTransfer should have image data', testImage2, DataTransfer.getDragImage(dropDataTransfer));
      KAssert.eqSome('dragend dataTransfer should have image data', testImage3, DataTransfer.getDragImage(dragendDataTransfer));

      // Test file data
      assert.isNull(dragstartDataTransfer.files.item(0), 'dragstart dataTransfer should initially have no file data');
      assert.isNull(dropDataTransfer.files.item(0), 'drop dataTransfer should initially have no file data');
      assert.isNull(dragendDataTransfer.files.item(0), 'dragend dataTransfer should initially have no file data');

      const testFile1 = new window.File([ 'Lorem ipsum' ], 'test.txt', { type: 'text/plain' });
      dragstartDataTransfer.items.add(testFile1);
      assert.deepEqual(dragstartDataTransfer.files.item(0), testFile1, 'dragstart dataTransfer should retrieve added file 1');
      assert.isNull(dropDataTransfer.files.item(0), 'drop dataTransfer should still have no file data');
      assert.isNull(dragendDataTransfer.files.item(0), 'dragend dataTransfer should still have no file data');

      const testFile2 = new window.File([ '<p>Lorem ipsum</p>' ], 'test2.html', { type: 'text/html' });
      dropDataTransfer.items.add(testFile2);
      assert.deepEqual(dragstartDataTransfer.files.item(0), testFile1, 'dragstart dataTransfer should retrieve added file 1');
      assert.deepEqual(dropDataTransfer.files.item(0), testFile2, 'drop dataTransfer should retrieve added file 2');
      assert.isNull(dragendDataTransfer.files.item(0), 'dragend dataTransfer should still have no file data');

      const testFile3 = new window.File([ 'Lorem ipsum' ], 'test3.rtf', { type: 'text/rtf' });
      dragendDataTransfer.items.add(testFile3);
      assert.deepEqual(dragstartDataTransfer.files.item(0), testFile1, 'dragstart dataTransfer should retrieve added file 1');
      assert.deepEqual(dropDataTransfer.files.item(0), testFile2, 'drop dataTransfer should retrieve added file 2');
      assert.deepEqual(dragendDataTransfer.files.item(0), testFile3, 'dragend dataTransfer should retrieve added file 3');
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
      await TinyState.withNoneditableRootEditorAsync(hook.editor(), async (editor) => {
        const initialContent = '<div class="toDrag" contenteditable="false">To drag element</div><div class="destination">drop target</div>';

        editor.setContent(initialContent);
        await moveToDragElementToDestinationElement(editor, 0, 0);
        TinyAssertions.assertContent(editor, initialContent);
      });
    });

    it('TINY-9558: Should not be possible to drag a noneditable CEF element to an editable target within a noneditable root', async () => {
      await TinyState.withNoneditableRootEditorAsync(hook.editor(), async (editor) => {
        const initialContent = '<div class="toDrag" contenteditable="false">To drag element</div><div contenteditable="true"><div class="destination">drop target</div></div>';

        editor.setContent(initialContent);
        await moveToDragElementToDestinationElement(editor, 0, 0);
        TinyAssertions.assertContent(editor, initialContent);
      });
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
