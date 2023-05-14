import { context, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { KAssert } from '@ephox/katamari-assertions';
import { PlatformDetection } from '@ephox/sand';
import { assert } from 'chai';

import { createDataTransfer, getDragImage } from 'ephox/dragster/datatransfer/DataTransfer';
import { setDragendEvent, setDragstartEvent, setDropEvent } from 'ephox/dragster/datatransfer/Event';

describe('atomic.dragster.datatransfer.DataTransferTest', () => {
  const browser = PlatformDetection.detect().browser;

  context('dropEffect', () => {
    it('TINY-9601: Should initially have "move" dropEffect', () => {
      const transfer = createDataTransfer();
      assert.equal(transfer.dropEffect, 'move', 'Should be expected initial dropEffect');
    });

    it('TINY-9601: Can set dropEffect to a valid value', () => {
      const transfer = createDataTransfer();
      transfer.dropEffect = 'copy';
      assert.equal(transfer.dropEffect, 'copy', 'Should be expected new value');
    });

    it('TINY-9601: Cannot set dropEffect to an invalid value', () => {
      const transfer = createDataTransfer();
      transfer.dropEffect = 'xyz' as any;
      assert.equal(transfer.dropEffect, 'move', 'Should be unchanged');
    });
  });

  context('effectAllowed', () => {
    it('TINY-9601: Should initially have "all" effectAllowed', () => {
      const transfer = createDataTransfer();
      assert.equal(transfer.effectAllowed, 'all', 'Should be expected initial effectAllowed');
    });

    it('TINY-9601: Can set effectAllowed to a valid value in dragstart event', () => {
      const transfer = createDataTransfer();
      setDragstartEvent(transfer);
      transfer.effectAllowed = 'copyLink';
      assert.equal(transfer.effectAllowed, 'copyLink', 'Should be expected new value');
    });

    it('TINY-9601: Cannot set effectAllowed to an invalid value in dragstart event', () => {
      const transfer = createDataTransfer();
      setDragstartEvent(transfer);
      transfer.effectAllowed = 'xyz' as any;
      assert.equal(transfer.effectAllowed, 'all', 'Should be unchanged');
    });

    it('TINY-9601: Cannot set effectAllowed to a valid value without an event set', () => {
      const transfer = createDataTransfer();
      transfer.effectAllowed = 'copyLink';
      assert.equal(transfer.effectAllowed, 'all', 'Should be unchanged');
    });

    it('TINY-9601: Cannot set effectAllowed to an valid value in drop event', () => {
      const transfer = createDataTransfer();
      setDropEvent(transfer);
      transfer.effectAllowed = 'copyLink';
      assert.equal(transfer.effectAllowed, 'all', 'Should be unchanged');
    });

    it('TINY-9601: Cannot set effectAllowed to an valid value in dragend event', () => {
      const transfer = createDataTransfer();
      setDragendEvent(transfer);
      transfer.effectAllowed = 'copyLink';
      assert.equal(transfer.effectAllowed, 'all', 'Should be unchanged');
    });
  });

  context('setData', () => {
    it('TINY-9601: Can set data as expected', () => {
      const transfer = createDataTransfer();

      transfer.setData('text/plain', 'Hello');
      assert.equal(transfer.getData('text/plain'), 'Hello', 'Should be expected plain text');
      assert.equal(transfer.items[0].type, 'text/plain', 'Should be expected plain text type');

      transfer.setData('text/html', '<p>Hello</p>');
      assert.equal(transfer.getData('text/html'), '<p>Hello</p>', 'Should be expected html');
      assert.equal(transfer.items[1].type, 'text/html', 'Should be expected html type');

      transfer.setData('text/plain', 'World');
      assert.equal(transfer.getData('text/plain'), 'World', 'Should be expected plain text after overwriting original plain text data');
      assert.equal(transfer.items[1].type, 'text/plain', 'Should be expected plain text type after overwriting original plain text data');

      transfer.setData('text/uri-list', 'http://tiny.cloud/');
      assert.equal(transfer.getData('url'), 'http://tiny.cloud/', 'Should be expected url');
      assert.equal(transfer.items[2].type, 'text/uri-list', 'Should be expected url type');
    });
  });

  context('setDragImage', () => {
    it('TINY-9601: Should initially not have a drag image', () => {
      const transfer = createDataTransfer();
      KAssert.eqNone('Should not have a drag image', getDragImage(transfer));
    });

    it('TINY-9601: Can set a drag image as expected', () => {
      const dragImage = {
        image: document.createElement('div'),
        x: 10,
        y: 20
      };
      const transfer = createDataTransfer();
      transfer.setDragImage(dragImage.image, dragImage.x, dragImage.y);
      KAssert.eqSome('Should be expected element', 'DIV', getDragImage(transfer).map((x) => x.image.nodeName));
      KAssert.eqSome('Should be expected x cord', 10, getDragImage(transfer).map((x) => x.x));
      KAssert.eqSome('Should be expected y cord', 20, getDragImage(transfer).map((x) => x.y));
    });
  });

  context('types', () => {
    it('TINY-9601: Should initially have no types', () => {
      const transfer = createDataTransfer();
      assert.equal(transfer.types.length, 0, 'Should be expected initial types');
    });

    it('TINY-9601: Types are added as as data is added', () => {
      const transfer = createDataTransfer();

      transfer.setData('text/plain', 'Hello');
      assert.equal(transfer.types.length, 1, 'Should be expected length');
      assert.equal(transfer.types[0], 'text/plain', 'Should be expected type');

      transfer.setData('text/html', '<p>Hello</p>');
      assert.equal(transfer.types.length, 2, 'Should be expected length');
      assert.equal(transfer.types[1], 'text/html', 'Should be expected type');

      transfer.setData('text/uri-list', 'http://tiny.cloud/');
      assert.equal(transfer.types.length, 3, 'Should be expected length');
      assert.equal(transfer.types[2], 'text/uri-list', 'Should be expected type');

      transfer.items.add(new window.File([ 'Lorem ipsum' ], 'file.txt', { type: 'text/plain' }));
      assert.equal(transfer.types.length, 4, 'Should be expected length');
      assert.equal(browser.isSafari() ? transfer.types[0] : transfer.types[3], 'Files', 'Should be expected type');

      transfer.items.add(new window.File([ '<p>Lorem ipsum</p>' ], 'file2.txt', { type: 'text/html' }));
      assert.equal(transfer.types.length, 4, 'Should not add another "Files" type after adding multiple files');
      assert.equal(browser.isSafari() ? transfer.types[0] : transfer.types[3], 'Files', 'Should not add another "Files" type after adding multiple files');

      assert.deepEqual(transfer.types,
        browser.isSafari() ? [ 'Files', 'text/plain', 'text/html', 'text/uri-list' ] : [ 'text/plain', 'text/html', 'text/uri-list', 'Files' ],
        'Should have expected types array at the end');
    });
  });

  context('files', () => {
    it('TINY-9601: Should initially have no files', () => {
      const transfer = createDataTransfer();
      assert.equal(transfer.files.length, 0, 'Should be expected initial files');
    });

    it('TINY-9601: Only adding files adds to files array', () => {
      const transfer = createDataTransfer();

      transfer.setData('text/plain', 'Hello');
      assert.equal(transfer.files.length, 0, 'Should have no files after adding plain text');

      transfer.setData('text/html', '<p>Hello</p>');
      assert.equal(transfer.files.length, 0, 'Should have no files after adding html');

      transfer.setData('text/uri-list', 'http://tiny.cloud/');
      assert.equal(transfer.files.length, 0, 'Should have no files after adding url');

      transfer.items.add(new window.File([ 'Lorem ipsum' ], 'file.txt', { type: 'text/plain', lastModified: 123 }));
      assert.equal(transfer.files.length, 1, 'Should be expected length');
      assert.equal(transfer.files[0].name, 'file.txt', 'Should be expected name');
      assert.equal(transfer.files[0].type, 'text/plain', 'Should be expected type');
      assert.equal(transfer.files[0].lastModified, 123, 'Should be expected lastModified');

      transfer.items.add(new window.File([ '<p>Lorem ipsum</p>' ], 'file2.txt', { type: 'text/html', lastModified: 456 }));
      assert.equal(transfer.files.length, 2, 'Should be expected length');
      assert.equal(transfer.files[1].name, 'file2.txt', 'Should be expected name');
      assert.equal(transfer.files[1].type, 'text/html', 'Should be expected type');
      assert.equal(transfer.files[1].lastModified, 456, 'Should be expected lastModified');

      assert.deepEqual(Arr.map(transfer.items, (x) => x.kind), [ 'string', 'string', 'string', 'file', 'file' ], 'Should have expected kinds at the end');
    });
  });
});
