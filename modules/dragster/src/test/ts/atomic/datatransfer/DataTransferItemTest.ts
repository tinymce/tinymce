import { Assert, describe, it } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { KAssert } from '@ephox/katamari-assertions';

import { createDataTransfer } from 'ephox/dragster/datatransfer/DataTransfer';
import { createDataTransferItemFromFile, createDataTransferItemFromString, getData } from 'ephox/dragster/datatransfer/DataTransferItem';
import { createFile } from 'ephox/dragster/file/Files';

describe('atomic.dragster.datatransfer.DataTransferItemTest', () => {
  it('Create transfer item from file', () => {
    const fileItem = createDataTransferItemFromFile(createDataTransfer(), createFile('a.txt', 1234, new Blob([ '123' ], { type: 'text/plain' })));

    Assert.eq('Should be the expected kind', 'file', fileItem.kind);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    Assert.eq('Should be a noop', Fun.noop, fileItem.getAsString);
    Assert.eq('Should be expected file', 'a.txt', fileItem.getAsFile()?.name);
    Assert.eq('Should be expected file', 'text/plain', fileItem.getAsFile()?.type);
    KAssert.eqNone('Should not have any data', getData(fileItem));
  });

  it('Create transfer item from string', () => {
    const stringItem = createDataTransferItemFromString(createDataTransfer(), 'text/plain', '123');

    Assert.eq('Should be the expected kind', 'string', stringItem.kind);
    Assert.eq('Should be null for a string kind', null, stringItem.getAsFile());
    KAssert.eqSome('Should have some data', '123', getData(stringItem));

    stringItem.getAsString((text) => {
      try {
        Assert.eq('Should be expected contents', '123', text);
      } catch (_) {
        Assert.fail('Error in getAsString callback');
      }
    });
  });
});
