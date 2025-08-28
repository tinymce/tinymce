import { UnitTest } from '@ephox/bedrock-client';
import { DomEvent, Insert, Remove, SelectorFind, SugarBody, SugarElement } from '@ephox/sugar';
import { assert } from 'chai';

import { dragnDrop, dropFiles, isDraggable, sDragnDrop, sDropFiles, sDropItems } from 'ephox/agar/api/DragnDrop';
import { createFile } from 'ephox/agar/api/Files';
import * as GeneralSteps from 'ephox/agar/api/GeneralSteps';
import * as Logger from 'ephox/agar/api/Logger';
import { Pipeline } from 'ephox/agar/api/Pipeline';
import { Step } from 'ephox/agar/api/Step';

UnitTest.test('DragDrop.isDraggable', () => {
  const check = (expected: boolean, html: string) => {
    assert.equal(isDraggable(SugarElement.fromHtml(html)), expected);
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
  const dropzone = SugarElement.fromHtml('<div class="dropzone"></div>');
  const draggable = SugarElement.fromHtml('<div class="draggable" draggable="true"></div>');
  const store: string[] = [];

  const sClearStore = Step.sync(() => {
    store.splice(0);
  });

  const sAssertStoreItems = (expectedStoreItems: string[]) => Step.sync(() => {
    assert.deepEqual(store, expectedStoreItems, 'Should have the expected items');
  });

  const dragStartUnbinder = DomEvent.bind(draggable, 'dragstart', (evt) => {
    const dataTransfer = evt.raw.dataTransfer;

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
    const dataTransfer = evt.raw.dataTransfer;

    evt.kill();

    if (dataTransfer.getData('text')) {
      store.push('drop text: ' + dataTransfer.getData('text'));
    } else {
      store.push(`drop files: ${dataTransfer.files.length}`);
    }
  });

  const dragEndUnbinder = DomEvent.bind(draggable, 'dragend', (_evt) => {
    store.push('dragend');
  });

  Insert.append(SugarBody.body(), dropzone);
  Insert.append(SugarBody.body(), draggable);

  Pipeline.async({}, [
    Logger.t('Drag/drop element with data using selectors', GeneralSteps.sequence([
      sClearStore,
      sDragnDrop('.draggable', '.dropzone'),
      sAssertStoreItems([ 'dragstart', 'dragenter', 'dragover', 'drop text: hello', 'dragend' ])
    ])),

    Logger.t('Drag/drop element with data using elements', GeneralSteps.sequence([
      sClearStore,
      Step.sync(() => {
        const from = SelectorFind.descendant(SugarBody.body(), '.draggable').getOrDie('Could not find from element.');
        const to = SelectorFind.descendant(SugarBody.body(), '.dropzone').getOrDie('Could not find to element.');

        dragnDrop(from, to);
      }),
      sAssertStoreItems([ 'dragstart', 'dragenter', 'dragover', 'drop text: hello', 'dragend' ])
    ])),

    Logger.t('Drop files using selector', GeneralSteps.sequence([
      sClearStore,
      sDropFiles([
        createFile('a.txt', 123, new Blob([ '' ], { type: 'text/plain' })),
        createFile('b.html', 123, new Blob([ '' ], { type: 'text/html' }))
      ], '.dropzone'),
      sAssertStoreItems([ 'dragenter', 'dragover', 'drop files: 2' ])
    ])),

    Logger.t('Drop files using element', GeneralSteps.sequence([
      sClearStore,
      Step.sync(() => {
        const to = SelectorFind.descendant(SugarBody.body(), '.dropzone').getOrDie('Could not find to element.');

        dropFiles([
          createFile('a.txt', 123, new Blob([ '' ], { type: 'text/plain' })),
          createFile('b.html', 123, new Blob([ '' ], { type: 'text/html' }))
        ], to);
      }),
      sAssertStoreItems([ 'dragenter', 'dragover', 'drop files: 2' ])
    ])),

    Logger.t('Drop items using selector', GeneralSteps.sequence([
      sClearStore,
      sDropItems([
        { data: 'hello', type: 'text/plain' },
        { data: '<p>hello</p>', type: 'text/html' }
      ], '.dropzone'),
      sAssertStoreItems([ 'dragenter', 'dragover', 'drop text: hello' ])
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
