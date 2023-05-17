import { describe, it } from '@ephox/bedrock-client';
import { KAssert } from '@ephox/katamari-assertions';
import { PlatformDetection } from '@ephox/sand';
import { assert } from 'chai';

import { cloneDataTransfer, createDataTransfer, getDragImage } from 'ephox/dragster/datatransfer/DataTransfer';
import { DragImageData } from 'ephox/dragster/datatransfer/DragImage';
import { Event, getEvent, setDragstartEvent } from 'ephox/dragster/datatransfer/Event';
import { getMode, Mode, setMode, setReadOnlyMode, setReadWriteMode } from 'ephox/dragster/datatransfer/Mode';

describe('browser.dragster.datatransfer.DataTransferCloneTest', () => {
  const dragImage: DragImageData = {
    image: document.createElement('div'),
    x: 10,
    y: 20
  };

  const testFile1 = new window.File([ 'Lorem ipsum' ], 'test.txt', { type: 'text/plain' });
  const testFile2 = new window.File([ '<p>Lorem ipsum</p>' ], 'test2.html', { type: 'text/html' });

  const getTestDataTransfer = (mode: Mode): DataTransfer => {
    const dataTransfer = createDataTransfer();

    setReadWriteMode(dataTransfer);

    // Add some test data
    setDragstartEvent(dataTransfer);
    dataTransfer.dropEffect = 'copy';
    dataTransfer.effectAllowed = 'copy';
    dataTransfer.setData('text/plain', '123');
    dataTransfer.setData('text/html', '<p>123</p>');
    dataTransfer.setDragImage(dragImage.image, dragImage.x, dragImage.y);
    dataTransfer.items.add(testFile1);
    dataTransfer.items.add(testFile2);

    setMode(dataTransfer, mode);

    return dataTransfer;
  };

  const assertTestDataTransfer = (dataTransfer: DataTransfer, isClone: boolean) => {
    const normalizeLabel = (label: string): string => `${isClone ? 'Clone' : 'Original'} ${label}`;

    KAssert.eqSome(normalizeLabel('should have expected event'), Event.Dragstart, getEvent(dataTransfer));
    assert.strictEqual(dataTransfer.dropEffect, 'copy', normalizeLabel('should have expected dropEffect'));
    assert.strictEqual(dataTransfer.effectAllowed, 'copy', normalizeLabel('should have expected effectAllowed'));
    assert.strictEqual(dataTransfer.getData('text/plain'), '123', normalizeLabel('should have expected text/plain data'));
    assert.strictEqual(dataTransfer.getData('text/html'), '<p>123</p>', normalizeLabel('should have expected text/html data'));
    KAssert.eqSome(normalizeLabel('should have expected drag image'), dragImage, getDragImage(dataTransfer));
    assert.deepEqual(dataTransfer.types,
      PlatformDetection.detect().browser.isSafari() ? [ 'Files', 'text/plain', 'text/html' ] : [ 'text/plain', 'text/html', 'Files' ],
      normalizeLabel('should have expected types'));
    const files = dataTransfer.files;
    assert.strictEqual(files.length, 2, normalizeLabel('should have expected number of files'));
    assert.deepEqual(files.item(0), testFile1, normalizeLabel('should have expected file 1'));
    assert.deepEqual(files.item(1), testFile2, normalizeLabel('should have expected file 2'));
  };

  const testCloneDataTransfer = (mode: Mode) => {
    const original = getTestDataTransfer(mode);
    const clone = cloneDataTransfer(original);

    // Not have same reference as original
    assert.notStrictEqual(clone, original);

    KAssert.eqOptional('Clone should have same mode', getMode(original), getMode(clone));

    // Set to read-only mode to check other data
    setReadOnlyMode(original);
    setReadOnlyMode(clone);

    // Original has not been modified in the cloning process
    assertTestDataTransfer(original, false);

    // Clone has expected data
    assertTestDataTransfer(clone, true);

    assert.notStrictEqual(clone.items, original.items, 'Clone should not have same items reference as original');

    getDragImage(original).each((originalImage) =>
      getDragImage(clone).each((cloneImage) => assert.notStrictEqual(cloneImage, originalImage, 'Clone drag image should not have same reference as original')));

    assert.notStrictEqual(clone.files, original.files, 'Clone should not have same files reference as original');
  };

  it('TINY-9601: Can create clone of dataTransfer in read-write mode', () => testCloneDataTransfer(Mode.ReadWrite));

  it('TINY-9601: Can create clone of dataTransfer in read-only mode', () => testCloneDataTransfer(Mode.ReadOnly));

  it('TINY-9601: Can create clone of dataTransfer in protected mode', () => testCloneDataTransfer(Mode.Protected));
});
