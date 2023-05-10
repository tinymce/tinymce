import { UnitTest } from '@ephox/bedrock-client';
import { Type } from '@ephox/katamari';
import { assert } from 'chai';

import { createFile } from 'ephox/agar/api/Files';
import { createDataTransfer } from 'ephox/agar/datatransfer/DataTransfer';
import { getData } from 'ephox/agar/datatransfer/DataTransferItem';
import { createDataTransferItemList } from 'ephox/agar/datatransfer/DataTransferItemList';
import { setProtectedMode, setReadOnlyMode } from 'ephox/agar/datatransfer/Mode';

UnitTest.test('DataTransferItemListTest', () => {
  const testAdding = () => {
    const items = createDataTransferItemList(createDataTransfer());

    assert.isFalse(Type.isArray(items), 'Should not be an array');

    items.add(createFile('a.txt', 1234, new Blob([ '123' ], { type: 'text/html' })));
    assert.equal(items[0].kind, 'file', 'Should be expected kind');
    assert.lengthOf(items, 1, 'Should be expected length');

    items.add('123', 'text/plain');
    assert.equal(items[1].kind, 'string', 'Should be expected kind');
    assert.lengthOf(items, 2, 'Should be expected length');
    assert.equal(getData(items[1]).getOr(''), '123', 'Should be expected data');

    assert.throws(() => {
      items.add('123', 'text/plain');
    }, `Failed to execute 'add' on 'DataTransferItemList': An item already exists for type 'text/plain'.`);
  };

  const testRemoving = () => {
    const items = createDataTransferItemList(createDataTransfer());

    items.add(createFile('a.txt', 1234, new Blob([ '123' ], { type: 'text/html' })));
    items.add('123', 'text/plain');
    items.add('1234', 'text/something');

    items.remove(1);

    assert.lengthOf(items, 2, 'Should be expected length');
    assert.equal(items[0].kind, 'file', 'Should be expected kind');
    assert.equal(items[1].kind, 'string', 'Should be expected kind');
  };

  const testClearing = () => {
    const items = createDataTransferItemList(createDataTransfer());

    items.add(createFile('a.txt', 1234, new Blob([ '123' ], { type: 'text/html' })));
    items.add('123', 'text/plain');
    items.add('1234', 'text/something');

    items.clear();

    assert.lengthOf(items, 0, 'Should be expected length');
  };

  const testMutationWhileInProtectedMode = () => {
    const dataTransfer = createDataTransfer();
    const items = createDataTransferItemList(dataTransfer);

    setProtectedMode(dataTransfer);

    assert.throws(() => {
      items.add('123', 'text/plain');
    }, 'Invalid state dataTransfer is not in read/write mode');

    assert.throws(() => {
      items.remove(0);
    }, 'Invalid state dataTransfer is not in read/write mode');

    assert.throws(() => {
      items.clear();
    }, 'Invalid state dataTransfer is not in read/write mode');
  };

  const testMutationWhileInReadOnlyMode = () => {
    const dataTransfer = createDataTransfer();
    const items = createDataTransferItemList(dataTransfer);

    setReadOnlyMode(dataTransfer);

    assert.throws(() => {
      items.add('123', 'text/plain');
    }, 'Invalid state dataTransfer is not in read/write mode');

    assert.throws(() => {
      items.remove(0);
    }, 'Invalid state dataTransfer is not in read/write mode');

    assert.throws(() => {
      items.clear();
    }, 'Invalid state dataTransfer is not in read/write mode');
  };

  testAdding();
  testRemoving();
  testClearing();
  testMutationWhileInProtectedMode();
  testMutationWhileInReadOnlyMode();
});
