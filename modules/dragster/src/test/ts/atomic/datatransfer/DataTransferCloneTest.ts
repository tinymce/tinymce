import { describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { KAssert } from '@ephox/katamari-assertions';
import { assert } from 'chai';

import { cloneDataTransfer, createDataTransfer, getDragImage } from 'ephox/dragster/datatransfer/DataTransfer';

describe('atomic.dragster.datatransfer.DataTransferCloneTest', () => {
  const dragImage = {
    image: document.createElement('div'),
    x: 10,
    y: 20
  };

  const getTestDataTransfer = (): DataTransfer => {
    const dataTransfer = createDataTransfer();

    // set some test data
    dataTransfer.dropEffect = 'copy';
    dataTransfer.effectAllowed = 'copy';
    dataTransfer.setData('text/plain', '123');
    dataTransfer.setData('text/html', '<p>123</p>');
    dataTransfer.setDragImage(dragImage.image, dragImage.x, dragImage.y);
    dataTransfer.items.add(new window.File([ 'Lorem ipsum' ], 'test.txt', { type: 'text/plain' }));

    return dataTransfer;
  };

  const testCloneDataTransfer = () => {
    const original = getTestDataTransfer();
    // setMode(original, mode);
    const clone = cloneDataTransfer(original);

    // Not have same reference as original
    assert.notStrictEqual(clone, original);

    // // Same mode as original
    // KAssert.eqOptional('Clone should have same mode', getMode(original), getMode(clone));

    // // Set to read-only mode to check other data
    // setReadOnlyMode(original);
    // setReadOnlyMode(clone);

    // Not have same items reference as original
    assert.notStrictEqual(clone.items, original.items, 'Clone should not have same items reference as original');

    // Same data as original
    assert.strictEqual(clone.dropEffect, original.dropEffect, 'Clone should have same dropEffect');
    assert.strictEqual(clone.effectAllowed, original.effectAllowed, 'Clone should have same effectAllowed');
    assert.strictEqual(clone.getData('text/plain'), original.getData('text/plain'), 'Clone should have same data');
    assert.strictEqual(clone.getData('text/html'), original.getData('text/html'), 'Clone should have same data');
    assert.deepEqual(clone.types, original.types, 'Clone should have same types');

    // Same drag image as original
    const originalDragImage = getDragImage(original);
    KAssert.eqSome('Original should have expected drag image', dragImage, originalDragImage);
    const cloneDragImage = getDragImage(clone);
    KAssert.eqOptional('Clone should have same drag image data', getDragImage(original), getDragImage(clone));
    originalDragImage.each((originalImage) =>
      cloneDragImage.each((cloneImage) => assert.notStrictEqual(cloneImage, originalImage, 'Clone drag image should not have same reference as original')));

    // Same files as original
    const length = clone.files.length;
    assert.strictEqual(length, original.files.length, 'Clone should have same number of files');
    Arr.range(length, (i) => {
      assert.deepEqual(clone.files.item(i), original.files.item(i), 'Clone should have same file');
    });
  };

  it('TINY-9601: Can create clone of dataTransfer in read-write mode', () => testCloneDataTransfer());

  // it('TINY-9601: Can create clone of dataTransfer in read-only mode', () => testCloneDataTransfer(Mode.ReadOnly));

  // it('TINY-9601: Can create clone of dataTransfer in protected mode', () => testCloneDataTransfer(Mode.Protected));
});
