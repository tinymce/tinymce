import { describe, it } from '@ephox/bedrock-client';
import { Type } from '@ephox/katamari';
import { KAssert } from '@ephox/katamari-assertions';
import { assert } from 'chai';

import { cloneDataTransfer, createDataTransfer, getDragImage } from 'ephox/dragster/datatransfer/DataTransfer';
import { getMode, Mode, setMode, setReadOnlyMode } from 'ephox/dragster/datatransfer/Mode';
import { createFile } from 'ephox/dragster/file/Files';

describe('atomic.dragster.datatransfer.DataTransferCloneTest', () => {
  const getTestDataTransfer = (): DataTransfer => {
    const dataTransfer = createDataTransfer();

    // set some test data
    dataTransfer.dropEffect = 'copy';
    dataTransfer.effectAllowed = 'copy';
    dataTransfer.setData('text/plain', '123');
    dataTransfer.setData('text/html', '<p>123</p>');
    dataTransfer.setDragImage(document.createElement('div'), 10, 20);
    dataTransfer.items.add(createFile('a.txt', 1234, new Blob([ '123' ], { type: 'text/html' })));

    return dataTransfer;
  };

  const testCloneDataTransfer = (mode: Mode) => {
    const original = getTestDataTransfer();
    setMode(original, mode);
    const clone = cloneDataTransfer(original);

    // Should not have same reference as original
    assert.notStrictEqual(clone, original);

    // Has same mode as original
    KAssert.eqOptional('Clone should have same mode', getMode(original), getMode(clone));

    // Set to read-only mode to check other data
    setReadOnlyMode(original);
    setReadOnlyMode(clone);

    // Not have same items reference as original
    assert.notStrictEqual(clone.items, original.items);

    // Same data as original
    assert.strictEqual(clone.dropEffect, original.dropEffect, 'Clone should have same dropEffect');
    assert.strictEqual(clone.effectAllowed, original.effectAllowed, 'Clone should have same effectAllowed');
    assert.strictEqual(clone.getData('text/plain'), original.getData('text/plain'), 'Clone should have same data');
    assert.strictEqual(clone.getData('text/html'), original.getData('text/html'), 'Clone should have same data');
    assert.deepEqual(clone.types, original.types, 'Clone should have same types');
    KAssert.eqOptional('Clone should have same drag image data', getDragImage(original), getDragImage(clone));

    // Same files as original
    assert.strictEqual(original.files.length, clone.files.length, 'Clone should have same number of files');
    let i = 0;
    let currentFile = original.files.item(i);
    while (!Type.isUndefined(currentFile)) {
      assert.deepEqual(clone.files.item(i), currentFile);
      currentFile = original.files.item(++i);
    }
  };

  it('TINY-9601: Can create clone of dataTransfer in read-write mode', () => testCloneDataTransfer(Mode.ReadWrite));

  it('TINY-9601: Can create clone of dataTransfer in read-only mode', () => testCloneDataTransfer(Mode.ReadOnly));

  it('TINY-9601: Can create clone of dataTransfer in protected mode', () => testCloneDataTransfer(Mode.Protected));
});
