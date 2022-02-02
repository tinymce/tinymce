import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { KAssert } from '@ephox/katamari-assertions';

import { createFile } from 'ephox/agar/api/Files';
import * as Logger from 'ephox/agar/api/Logger';
import { Pipeline } from 'ephox/agar/api/Pipeline';
import { Step } from 'ephox/agar/api/Step';
import { createDataTransfer } from 'ephox/agar/datatransfer/DataTransfer';
import { createDataTransferItemFromFile, createDataTransferItemFromString, getData } from 'ephox/agar/datatransfer/DataTransferItem';

UnitTest.asynctest('DataTransferItemTest', (success, failure) => {
  Pipeline.async({}, [
    Logger.t('Create transfer item from file', Step.sync(() => {
      const fileItem = createDataTransferItemFromFile(createDataTransfer(), createFile('a.txt', 1234, new Blob([ '123' ], { type: 'text/plain' })));

      Assert.eq('Should be the expected kind', 'file', fileItem.kind);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      Assert.eq('Should be a noop', Fun.noop, fileItem.getAsString);
      Assert.eq('Should be expected file', 'a.txt', fileItem.getAsFile().name);
      Assert.eq('Should be expected file', 'text/plain', fileItem.getAsFile().type);
      KAssert.eqNone('Should not have any data', getData(fileItem));
    })),

    Logger.t('Create transfer item from string', Step.async((next, die) => {
      const stringItem = createDataTransferItemFromString(createDataTransfer(), 'text/plain', '123');

      Assert.eq('Should be the expected kind', 'string', stringItem.kind);
      Assert.eq('Should be null for a string kind', null, stringItem.getAsFile());
      KAssert.eqSome('Should have some data', '123', getData(stringItem));

      stringItem.getAsString((text) => {
        try {
          Assert.eq('Should be expected contents', '123', text);
          next();
        } catch (e) {
          die(e);
        }
      });
    }))
  ], success, failure);
});
