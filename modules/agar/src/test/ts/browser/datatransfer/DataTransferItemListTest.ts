import { assert, Assert, UnitTest } from '@ephox/bedrock-client';
import { createFile } from 'ephox/agar/api/Files';
import { Blob } from '@ephox/dom-globals';
import { Type } from '@ephox/katamari';
import { createDataTransferItemList } from 'ephox/agar/datatransfer/DataTransferItemList';
import { getData } from 'ephox/agar/datatransfer/DataTransferItem';
import { createDataTransfer } from 'ephox/agar/datatransfer/DataTransfer';
import { setProtectedMode, setReadOnlyMode } from 'ephox/agar/datatransfer/Mode';

UnitTest.test('DataTransferItemListTest', () => {
  const testAdding = () => {
    const items = createDataTransferItemList(createDataTransfer());

    Assert.eq('Should not be an array', false, Type.isArray(items));

    items.add(createFile('a.txt', 1234, new Blob([ '123' ], { type: 'text/html' })));
    Assert.eq('Should be expected kind', 'file', items[0].kind);
    Assert.eq('Should be expected length', 1, items.length);

    items.add('123', 'text/plain');
    Assert.eq('Should be expected kind', 'string', items[1].kind);
    Assert.eq('Should be expected length', 2, items.length);
    Assert.eq('Should be expected data', '123', getData(items[1]).getOr(''));

    assert.throwsError(() => {
      items.add('123', 'text/plain');
    }, `Failed to execute 'add' on 'DataTransferItemList': An item already exists for type 'text/plain'.`);
  };

  const testRemoving = () => {
    const items = createDataTransferItemList(createDataTransfer());

    items.add(createFile('a.txt', 1234, new Blob([ '123' ], { type: 'text/html' })));
    items.add('123', 'text/plain');
    items.add('1234', 'text/something');

    items.remove(1);

    Assert.eq('Should be expected length', 2, items.length);
    Assert.eq('Should be expected kind', 'file', items[0].kind);
    Assert.eq('Should be expected kind', 'string', items[1].kind);
  };

  const testClearing = () => {
    const items = createDataTransferItemList(createDataTransfer());

    items.add(createFile('a.txt', 1234, new Blob([ '123' ], { type: 'text/html' })));
    items.add('123', 'text/plain');
    items.add('1234', 'text/something');

    items.clear();

    Assert.eq('Should be expected length', 0, items.length);
  };

  const testMutationWhileInProtectedMode = () => {
    const dataTransfer = createDataTransfer();
    const items = createDataTransferItemList(dataTransfer);

    setProtectedMode(dataTransfer);

    assert.throwsError(() => {
      items.add('123', 'text/plain');
    }, 'Invalid state dataTransfer is not in read/write mode');

    assert.throwsError(() => {
      items.remove(0);
    }, 'Invalid state dataTransfer is not in read/write mode');

    assert.throwsError(() => {
      items.clear();
    }, 'Invalid state dataTransfer is not in read/write mode');
  };

  const testMutationWhileInReadOnlyMode = () => {
    const dataTransfer = createDataTransfer();
    const items = createDataTransferItemList(dataTransfer);

    setReadOnlyMode(dataTransfer);

    assert.throwsError(() => {
      items.add('123', 'text/plain');
    }, 'Invalid state dataTransfer is not in read/write mode');

    assert.throwsError(() => {
      items.remove(0);
    }, 'Invalid state dataTransfer is not in read/write mode');

    assert.throwsError(() => {
      items.clear();
    }, 'Invalid state dataTransfer is not in read/write mode');
  };

  testAdding();
  testRemoving();
  testClearing();
  testMutationWhileInProtectedMode();
  testMutationWhileInReadOnlyMode();
});
