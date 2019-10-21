import { Assert, UnitTest } from '@ephox/bedrock-client';
import { createDataTransfer, getDragImage } from 'ephox/agar/datatransfer/DataTransfer';
import { Blob, document } from '@ephox/dom-globals';
import { createFile } from 'ephox/agar/api/Files';
import { setProtectedMode, setReadOnlyMode } from 'ephox/agar/datatransfer/Mode';

UnitTest.test('DataTransferTest', () => {
  const testSetEffects = () => {
    const transfer = createDataTransfer();

    Assert.eq('Should be expected initial dropEffect', 'move', transfer.dropEffect);
    Assert.eq('Should be expected initial effectAllowed', 'all', transfer.effectAllowed);

    transfer.dropEffect = 'copy';
    Assert.eq('Should be expected new value', 'copy', transfer.dropEffect);

    transfer.dropEffect = 'xyz';
    Assert.eq('Should be unchanged', 'copy', transfer.dropEffect);

    transfer.effectAllowed = 'copyLink';
    Assert.eq('Should be expected new value', 'copyLink', transfer.effectAllowed);

    transfer.effectAllowed = 'xyz';
    Assert.eq('Should be unchanged', 'copyLink', transfer.effectAllowed);
  };

  const testSetData = () => {
    const transfer = createDataTransfer();

    transfer.setData('text/plain', '123');
    Assert.eq('Should the expected text', '123', transfer.getData('text/plain'));
    Assert.eq('Should the expected type in items', 'text/plain', transfer.items[0].type);

    transfer.setData('text/plain', '1234');
    Assert.eq('Should the expected new text', '1234', transfer.getData('text/plain'));
    Assert.eq('Should the expected type in items', 'text/plain', transfer.items[0].type);

    transfer.setData('text', '12345');
    Assert.eq('Should the expected text', '12345', transfer.getData('text/plain'));
    Assert.eq('Should the expected type in items', 'text/plain', transfer.items[0].type);

    transfer.setData('url', 'http://tiny.cloud');
    Assert.eq('Should the expected url', 'http://tiny.cloud', transfer.getData('text/uri-list'));
    Assert.eq('Should the expected type in items', 'text/uri-list', transfer.items[1].type);
  };

  const testSetDragImage = () => {
    const transfer = createDataTransfer();

    Assert.eq('Should not have a drag image', true, getDragImage(transfer).isNone());

    transfer.setDragImage(document.createElement('div'), 10, 20);

    Assert.eq('Should have a drag image', true, getDragImage(transfer).isSome());
    Assert.eq('Should be expected element', 'DIV', getDragImage(transfer).getOrDie('Failed').image.nodeName);
    Assert.eq('Should be expected x cord', 10, getDragImage(transfer).getOrDie('Failed').x);
    Assert.eq('Should be expected y cord', 20, getDragImage(transfer).getOrDie('Failed').y);
  };

  const testTypes = () => {
    const transfer = createDataTransfer();

    transfer.setData('text/plain', '123');

    Assert.eq('Should the length', 1, transfer.types.length);
    Assert.eq('Should the expected type', 'text/plain', transfer.types[0]);

    transfer.setData('text/html', '123');

    Assert.eq('Should the length', 2, transfer.types.length);
    Assert.eq('Should the expected type', 'text/plain', transfer.types[0]);
    Assert.eq('Should the expected type', 'text/html', transfer.types[1]);

    transfer.items.add(createFile('test.gif', 1234, new Blob(['123'], { type: 'image/gif' })));

    Assert.eq('Should the length', 4, transfer.types.length);
    Assert.eq('Should the expected type 1', 'text/plain', transfer.types[0]);
    Assert.eq('Should the expected type 2', 'text/html', transfer.types[1]);
    Assert.eq('Should the expected type 3', 'image/gif', transfer.types[2]);
    Assert.eq('Should the expected type 4', 'Files', transfer.types[3]);
  };

  const testMutationInProtectedMode = () => {
    const transfer = createDataTransfer();

    transfer.setData('text/html', '123');
    transfer.items.add(createFile('test.gif', 123, new Blob([''], { type: 'image/gif' })));

    setProtectedMode(transfer);

    transfer.setData('text/plain', '123');
    Assert.eq('Should not be any text/plain data', '', transfer.getData('text/plain'));
    Assert.eq('Should not be any text/html data', '', transfer.getData('text/html'));

    Assert.eq('Should only expected length', 3, transfer.types.length);
    Assert.eq('Should only expected mime', 'text/html', transfer.types[0]);
    Assert.eq('Should only expected mime', 'image/gif', transfer.types[1]);
    Assert.eq('Should only expected Files', 'Files', transfer.types[2]);

    transfer.clearData();

    Assert.eq('Should still be expected items', 3, transfer.types.length);

    transfer.clearData('text/html');

    Assert.eq('Should still be expected items', 3, transfer.types.length);
  };

  const testMutationInReadOnlyMode = () => {
    const transfer = createDataTransfer();

    transfer.setData('text/html', '123');
    transfer.items.add(createFile('test.gif', 123, new Blob([''], { type: 'image/gif' })));

    setReadOnlyMode(transfer);

    transfer.setData('text/plain', '123');
    Assert.eq('Should not be any text/plain data', '', transfer.getData('text/plain'));
    Assert.eq('Should not be any text/html data', '123', transfer.getData('text/html'));

    Assert.eq('Should only expected length', 3, transfer.types.length);
    Assert.eq('Should only expected mime', 'text/html', transfer.types[0]);
    Assert.eq('Should only expected mime', 'image/gif', transfer.types[1]);
    Assert.eq('Should only expected Files', 'Files', transfer.types[2]);

    Assert.eq('Should be able to access files length', 1, transfer.files.length);
    Assert.eq('Should be able to access name', 'test.gif', transfer.files[0].name);
    Assert.eq('Should be able to access type', 'image/gif', transfer.files[0].type);

    transfer.clearData();

    Assert.eq('Should still be expected items', 3, transfer.types.length);

    transfer.clearData('text/html');

    Assert.eq('Should still be expected items', 3, transfer.types.length);
  };

  const testAddFiles = () => {
    const transfer = createDataTransfer();

    transfer.items.add(createFile('test.gif', 123, new Blob([''], { type: 'image/gif' })));

    Assert.eq('Should be able to access files length', 1, transfer.files.length);
    Assert.eq('Should be able to access type', 'image/gif', transfer.files[0].type);

    transfer.items.add(createFile('test.jpg', 123, new Blob([''], { type: 'image/jpg' })));

    Assert.eq('Should be expected files length', 2, transfer.files.length);
    Assert.eq('Should be expected type for pos 0', 'image/gif', transfer.files[0].type);
    Assert.eq('Should be expected type for pos 1', 'image/jpg', transfer.files[1].type);

    Assert.eq('Should be expected files length', 2, transfer.items.length);
    Assert.eq('Should be expected kind for pos 0', 'file', transfer.items[0].kind);
    Assert.eq('Should be expected kind for pos 1', 'file', transfer.items[1].kind);
  };

  testSetEffects();
  testSetData();
  testSetDragImage();
  testTypes();
  testMutationInProtectedMode();
  testMutationInReadOnlyMode();
  testAddFiles();
});
