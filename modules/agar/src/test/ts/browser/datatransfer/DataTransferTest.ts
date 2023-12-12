import { describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { KAssert } from '@ephox/katamari-assertions';
import { assert } from 'chai';

import { createFile } from 'ephox/agar/api/Files';
import { createDataTransfer, getDragImage } from 'ephox/agar/datatransfer/DataTransfer';
import { setProtectedMode, setReadOnlyMode } from 'ephox/agar/datatransfer/Mode';

describe('DataTransfer', () => {
  it('DataTransfer: setEffects', () => {
    const transfer = createDataTransfer();

    assert.equal(transfer.dropEffect, 'move', 'Should be expected initial dropEffect');
    assert.equal(transfer.effectAllowed, 'all', 'Should be expected initial effectAllowed');

    transfer.dropEffect = 'copy';
    assert.equal(transfer.dropEffect, 'copy', 'Should be expected new value');

    transfer.dropEffect = 'xyz' as any;
    assert.equal(transfer.dropEffect, 'copy', 'Should be unchanged');

    transfer.effectAllowed = 'copyLink';
    assert.equal(transfer.effectAllowed, 'copyLink', 'Should be expected new value');

    transfer.effectAllowed = 'xyz' as any;
    assert.equal(transfer.effectAllowed, 'copyLink', 'Should be unchanged');
  });

  it('DataTransfer: setData', () => {
    const transfer = createDataTransfer();

    transfer.setData('text/plain', '123');
    assert.equal(transfer.getData('text/plain'), '123', 'Should the expected text');
    assert.equal(transfer.items[0].type, 'text/plain', 'Should the expected type in items');

    transfer.setData('text/plain', '1234');
    assert.equal(transfer.getData('text/plain'), '1234', 'Should the expected new text');
    assert.equal(transfer.items[0].type, 'text/plain', 'Should the expected type in items');

    transfer.setData('text', '12345');
    assert.equal(transfer.getData('text/plain'), '12345', 'Should the expected text');
    assert.equal(transfer.items[0].type, 'text/plain', 'Should the expected type in items');

    transfer.setData('url', 'http://tiny.cloud');
    assert.equal(transfer.getData('text/uri-list'), 'http://tiny.cloud', 'Should the expected url');
    assert.equal(transfer.items[1].type, 'text/uri-list', 'Should the expected type in items');
  });

  it('DataTransfer: setDragImage', () => {
    const transfer = createDataTransfer();

    KAssert.eqNone('Should not have a drag image', getDragImage(transfer));

    transfer.setDragImage(document.createElement('div'), 10, 20);

    KAssert.eqSome('Should be expected element', 'DIV', getDragImage(transfer).map((x) => x.image.nodeName));
    KAssert.eqSome('Should be expected x cord', 10, getDragImage(transfer).map((x) => x.x));
    KAssert.eqSome('Should be expected y cord', 20, getDragImage(transfer).map((x) => x.y));
  });

  it('DataTransfer: testTypes', () => {
    const transfer = createDataTransfer();

    transfer.setData('text/plain', '123');

    assert.equal(transfer.types.length, 1, 'Should the length');
    assert.equal(transfer.types[0], 'text/plain', 'Should the expected type');

    transfer.setData('text/html', '123');

    assert.equal(transfer.types.length, 2, 'Should the length');
    assert.equal(transfer.types[0], 'text/plain', 'Should the expected type');
    assert.equal(transfer.types[1], 'text/html', 'Should the expected type');

    transfer.items.add(createFile('test.gif', 1234, new Blob([ '123' ], { type: 'image/gif' })));

    assert.equal(transfer.types.length, 4, 'Should the length');
    assert.equal(transfer.types[0], 'text/plain', 'Should the expected type 1');
    assert.equal(transfer.types[1], 'text/html', 'Should the expected type 2');
    assert.equal(transfer.types[2], 'image/gif', 'Should the expected type 3');
    assert.equal(transfer.types[3], 'Files', 'Should the expected type 4');
  });

  it('DataTransfer: mutation in protected mode', () => {
    const transfer = createDataTransfer();

    transfer.setData('text/html', '123');
    transfer.items.add(createFile('test.gif', 123, new Blob([ '' ], { type: 'image/gif' })));

    setProtectedMode(transfer);

    transfer.setData('text/plain', '123');
    assert.equal(transfer.getData('text/plain'), '', 'Should not be any text/plain data');
    assert.equal(transfer.getData('text/html'), '', 'Should not be any text/html data');

    assert.equal(transfer.types.length, 3, 'Should only expected length');
    assert.equal(transfer.types[0], 'text/html', 'Should only expected mime');
    assert.equal(transfer.types[1], 'image/gif', 'Should only expected mime');
    assert.equal(transfer.types[2], 'Files', 'Should only expected Files');

    transfer.clearData();

    assert.equal(transfer.types.length, 3, 'Should still be expected items');

    transfer.clearData('text/html');

    assert.equal(transfer.types.length, 3, 'Should still be expected items');
  });

  it('DataTransfer: mutation in read-only mode', () => {
    const transfer = createDataTransfer();

    transfer.setData('text/html', '123');
    transfer.items.add(createFile('test.gif', 123, new Blob([ '' ], { type: 'image/gif' })));

    setReadOnlyMode(transfer);

    transfer.setData('text/plain', '123');
    assert.equal(transfer.getData('text/plain'), '', 'Should not be any text/plain data');
    assert.equal(transfer.getData('text/html'), '123', 'Should not be any text/html data');

    assert.equal(transfer.types.length, 3, 'Should only expected length');
    assert.equal(transfer.types[0], 'text/html', 'Should only expected mime');
    assert.equal(transfer.types[1], 'image/gif', 'Should only expected mime');
    assert.equal(transfer.types[2], 'Files', 'Should only expected Files');

    assert.equal(transfer.files.length, 1, 'Should be able to access files length');
    assert.equal(transfer.files[0].name, 'test.gif', 'Should be able to access name');
    assert.equal(transfer.files[0].type, 'image/gif', 'Should be able to access type');

    transfer.clearData();

    assert.equal(transfer.types.length, 3, 'Should still be expected items');

    transfer.clearData('text/html');

    assert.equal(transfer.types.length, 3, 'Should still be expected items');
  });

  it('DataTransfer: add files', () => {
    const transfer = createDataTransfer();

    transfer.items.add(createFile('test.gif', 123, new Blob([ '' ], { type: 'image/gif' })));

    assert.equal(transfer.files.length, 1, 'Should be able to access files length');
    assert.deepEqual(Arr.map(transfer.files, (x) => x.type), [ 'image/gif' ], 'Types');

    transfer.items.add(createFile('test.jpg', 123, new Blob([ '' ], { type: 'image/jpg' })));

    assert.deepEqual(Arr.map(transfer.files, (x) => x.type), [ 'image/gif', 'image/jpg' ], 'Expected file types');
    assert.deepEqual(Arr.map(transfer.items, (x) => x.kind), [ 'file', 'file' ], 'Expected file kinds');
  });

  it('TINY-10386: DataTransfer instanceof window.DataTransfer', () => {
    assert.instanceOf(createDataTransfer(), window.DataTransfer);
  });

  it('TINY-10386: DataTransfer passed into DragEvent/ClipboardEvent should not throw an error', () => {
    assert.doesNotThrow(() => {
      new window.DragEvent('drop', { dataTransfer: createDataTransfer() });
      new window.ClipboardEvent('paste', { clipboardData: createDataTransfer() });
    });
  });

  it('TINY-10386: DataTransfer on native event should work as a regular dataTransfer', () => {
    assert.doesNotThrow(() => {
      const dataTransfer = createDataTransfer();

      dataTransfer.setData('text/plain', '123');
      dataTransfer.items.add(createFile('test.gif', 123, new Blob([ '' ], { type: 'image/gif' })));

      const dragEvent = new window.DragEvent('drop', { dataTransfer });
      assert.equal(dragEvent.dataTransfer.files.length, 1, 'Should be able to access files length');
      assert.equal(dragEvent.dataTransfer.getData('text/plain'), '123', 'Should be able to access data');
    });
  });
});
