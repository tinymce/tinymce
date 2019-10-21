import { Assert, assert, UnitTest } from '@ephox/bedrock-client';
import { Body, DomEvent, Element, Insert, Remove, SelectorFind } from '@ephox/sugar';
import { Pipeline } from 'ephox/agar/api/Pipeline';
import { dragnDrop, dropFiles, isDraggable, sDragnDrop, sDropFiles } from 'ephox/agar/api/DragnDrop';
import { Step } from 'ephox/agar/api/Step';
import { GeneralSteps, Logger } from 'ephox/agar/api/Main';
import { createFile } from 'ephox/agar/api/Files';
import { Blob } from '@ephox/dom-globals';

UnitTest.test('DragDrop.isDraggable', () => {
  const check = (expected: boolean, html: string) => {
    assert.eq(expected, isDraggable(Element.fromHtml(html)));
  };
  check(false, '<div/>');
  check(false, '<a/>');
  check(false, '<a name="blah"/>');
  check(true, '<a href=""/>');
  check(true, '<a href="cat.com"/>');
  check(true, '<ol draggable="true" />');
  check(false, '<ol draggable="" />');
  check(false, '<ol draggable="false" />');
  check(true, '<img />');
});

UnitTest.asynctest('DragnDropTest', (success, failure) => {
  const dropzone = Element.fromHtml('<div class="dropzone"></div>');
  const draggable = Element.fromHtml('<div class="draggable" draggable="true"></div>');
  const store: string[] = [];

  const sClearStore = Step.sync(() => {
    store.splice(0);
  });

  const sAssertStoreItems = (expectedStoreItems: string[]) => Step.sync(() => {
    Assert.eq('Should have the expetec items', expectedStoreItems, store);
  });

  const dragStartUnbinder = DomEvent.bind(draggable, 'dragstart', (evt) => {
    const dataTransfer = evt.raw().dataTransfer;

    evt.kill();

    dataTransfer.setData('text', 'hello');
    store.push('dragstart');
  });

  const dragEnterUnbinder = DomEvent.bind(dropzone, 'dragenter', (evt) => {
    evt.kill();
    store.push('dragenter');
  });

  const dragOverUnbinder = DomEvent.bind(dropzone, 'dragover', (evt) => {
    evt.kill();
    store.push('dragover');
  });

  const dropUnbinder = DomEvent.bind(dropzone, 'drop', (evt) => {
    const dataTransfer = evt.raw().dataTransfer;

    evt.kill();

    if (dataTransfer.getData('text')) {
      store.push('drop text: ' + dataTransfer.getData('text'));
    } else {
      store.push(`drop files: ${dataTransfer.files.length}`);
    }
  });

  const dragEndUnbinder = DomEvent.bind(draggable, 'dragend', (evt) => {
    store.push('dragend');
  });

  Insert.append(Body.body(), dropzone);
  Insert.append(Body.body(), draggable);

  Pipeline.async({}, [
    Logger.t('Drag/drop element with data using selectors', GeneralSteps.sequence([
      sClearStore,
      sDragnDrop('.draggable', '.dropzone'),
      sAssertStoreItems(['dragstart', 'dragenter', 'dragover', 'drop text: hello', 'dragend'])
    ])),

    Logger.t('Drag/drop element with data using elements', GeneralSteps.sequence([
      sClearStore,
      Step.sync(() => {
        const from = SelectorFind.descendant(Body.body(), '.draggable').getOrDie('Could not find from element.');
        const to = SelectorFind.descendant(Body.body(), '.dropzone').getOrDie('Could not find to element.');

        dragnDrop(from, to);
      }),
      sAssertStoreItems(['dragstart', 'dragenter', 'dragover', 'drop text: hello', 'dragend'])
    ])),

    Logger.t('Drop files using selector', GeneralSteps.sequence([
      sClearStore,
      sDropFiles([
        createFile('a.txt', 123, new Blob([''], { type: 'text/plain' })),
        createFile('b.html', 123, new Blob([''], { type: 'text/html' }))
      ], '.dropzone'),
      sAssertStoreItems(['dragenter', 'dragover', 'drop files: 2'])
    ])),

    Logger.t('Drop files using element', GeneralSteps.sequence([
      sClearStore,
      Step.sync(() => {
        const to = SelectorFind.descendant(Body.body(), '.dropzone').getOrDie('Could not find to element.');

        dropFiles([
          createFile('a.txt', 123, new Blob([''], { type: 'text/plain' })),
          createFile('b.html', 123, new Blob([''], { type: 'text/html' }))
        ], to);
      }),
      sAssertStoreItems(['dragenter', 'dragover', 'drop files: 2'])
    ]))
  ], () => {
    Remove.remove(dropzone);
    Remove.remove(draggable);
    dropUnbinder.unbind();
    dragStartUnbinder.unbind();
    dragOverUnbinder.unbind();
    dragEnterUnbinder.unbind();
    dragEndUnbinder.unbind();
    success();
  }, failure);
});
