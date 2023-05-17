import { describe, context, it } from '@ephox/bedrock-client';
import { PlatformDetection } from '@ephox/sand';
import { assert } from 'chai';

import { createDataTransfer } from 'ephox/dragster/datatransfer/DataTransfer';
import { isInProtectedMode, isInReadOnlyMode, isInReadWriteMode, setProtectedMode, setReadOnlyMode } from 'ephox/dragster/datatransfer/Mode';

describe('browser.dragster.datatransfer.DataTransferModeTest', () => {
  const browser = PlatformDetection.detect().browser;

  const testFile1 = new window.File([ 'Lorem ipsum' ], 'file1.txt', { type: 'text/plain', lastModified: 123 });
  const testFile2 = new window.File([ '<p>Lorem ipsum</p>' ], 'file2.txt', { type: 'text/html', lastModified: 456 });

  const createAndAssertTestDataTransfer = (): { transfer: DataTransfer; initialTypes: string[] } => {
    const transfer = createDataTransfer();
    assert.isTrue(isInReadWriteMode(transfer), 'Should be in read-write mode by default');

    transfer.setData('text/plain', 'Hello');
    assert.strictEqual(transfer.getData('text/plain'), 'Hello', 'Should be able to write data');

    transfer.items.add(testFile1);
    assert.deepEqual(transfer.files.item(0), testFile1, 'Should be able to add file');

    const initialTypes = browser.isSafari() ? [ 'Files', 'text/plain' ] : [ 'text/plain', 'Files' ];
    assert.deepEqual(transfer.types, initialTypes, 'Should have expected initial types');
    assert.strictEqual(transfer.types.length, initialTypes.length, 'Should have expected initial number of types');
    assert.strictEqual(transfer.files.length, 1, 'Should have expected initial number of files');
    assert.strictEqual(transfer.items.length, 2, 'Should have expected initial number of items');

    return { transfer, initialTypes };
  };

  context('Read-write mode', () => {
    it('TINY-9601: Can read and write data in read-write mode', () => {
      createAndAssertTestDataTransfer();
    });
  });

  context('Read-only mode', () => {
    it('TINY-9601: Can read but not write data in read-only mode', () => {
      const { transfer, initialTypes } = createAndAssertTestDataTransfer();

      setReadOnlyMode(transfer);
      assert.isTrue(isInReadOnlyMode(transfer), 'Should be in read-only mode');

      transfer.setData('text/html', '<p>Hello</p>');
      assert.strictEqual(transfer.getData('text/html'), '', 'Should not be able to write data');
      assert.deepEqual(transfer.types, initialTypes, 'Should not be able to add new type');
      assert.strictEqual(transfer.types.length, initialTypes.length, 'Should have initial number of types');
      assert.strictEqual(transfer.files.length, 1, 'Files list should be of expected length');

      assert.strictEqual(transfer.getData('text/plain'), 'Hello', 'Should be able to read initial data');
      assert.deepEqual(transfer.files.item(0), testFile1, 'Should be able to read initial file');

      transfer.items.add(testFile2);
      assert.strictEqual(transfer.files.length, 1, 'Files length should not have changed');
      assert.isNull(transfer.files.item(1), 'Should not be able to add file');
      assert.deepEqual(transfer.files.item(0), testFile1, 'Should still have initial file');

      assert.deepEqual(transfer.types, initialTypes, 'Should have expected types');
      assert.strictEqual(transfer.types.length, initialTypes.length, 'Should have expected number of types');
      assert.strictEqual(transfer.files.length, 1, 'Should have expected number of files');

      transfer.clearData();
      assert.strictEqual(transfer.types.length, initialTypes.length, 'clearData should not remove any items');
      transfer.clearData('text/plain');
      assert.strictEqual(transfer.types.length, initialTypes.length, 'clearData of specific format should not remove any items');
    });
  });

  context('Protected mode', () => {
    it('TINY-9601: Cannot read or write data in protected mode', () => {
      const { transfer, initialTypes } = createAndAssertTestDataTransfer();

      setProtectedMode(transfer);
      assert.isTrue(isInProtectedMode(transfer), 'Should be in protected mode');

      transfer.setData('text/html', '<p>Hello</p>');
      assert.strictEqual(transfer.getData('text/html'), '', 'Should not be able to write data');
      assert.deepEqual(transfer.types, initialTypes, 'Should not be able to add new type');
      assert.strictEqual(transfer.types.length, initialTypes.length, 'Should have initial number of types');
      assert.strictEqual(transfer.files.length, 0, 'Files list should be empty');

      assert.strictEqual(transfer.getData('text/plain'), '', 'Should not be able to read initial data');
      assert.isNull(transfer.files.item(0), 'Should not be able to read initial file');

      transfer.items.add(testFile2);
      assert.strictEqual(transfer.files.length, 0, 'Files list should remain empty');
      assert.isNull(transfer.files.item(0), 'Should still not be able to read initial file');

      assert.deepEqual(transfer.types, initialTypes, 'Should have expected types');
      assert.strictEqual(transfer.types.length, initialTypes.length, 'Should have expected number of types');

      transfer.clearData();
      assert.strictEqual(transfer.types.length, initialTypes.length, 'clearData should not remove any items');
      transfer.clearData('text/plain');
      assert.strictEqual(transfer.types.length, initialTypes.length, 'clearData of specific format should not remove any items');
    });
  });
});
