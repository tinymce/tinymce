import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Logger, Pipeline, Step } from 'ephox/agar/api/Main';
import { createFile } from 'ephox/agar/api/Files';
import { Blob } from '@ephox/dom-globals';
import { Fun, Type } from '@ephox/katamari';
import {
  createDataTransferItemFromFile,
  createDataTransferItemFromString,
  getData
} from 'ephox/agar/datatransfer/DataTransferItem';
import { createDataTransfer } from 'ephox/agar/datatransfer/DataTransfer';

UnitTest.asynctest('DataTransferItemTest', (success, failure) => {
  Pipeline.async({}, [
    Logger.t('Create transfer item from file', Step.sync(() => {
      const fileItem = createDataTransferItemFromFile(createDataTransfer(), createFile('a.txt', 1234, new Blob(['123'], { type: 'text/plain' })));

      Assert.eq('Should be the expected kind', 'file', fileItem.kind);
      Assert.eq('Should be a noop', Fun.noop, fileItem.getAsString);
      Assert.eq('Should be expected file', 'a.txt', fileItem.getAsFile().name);
      Assert.eq('Should be expected file', 'text/plain', fileItem.getAsFile().type);
      Assert.eq('Should not have any data', true, getData(fileItem).isNone());
    })),

    Logger.t('Create transfer item from string', Step.async((next, die) => {
      const stringItem = createDataTransferItemFromString(createDataTransfer(), 'text/plain', '123');

      Assert.eq('Should be the expected kind', 'string', stringItem.kind);
      Assert.eq('Should be null for a string kind', true, Type.isNull(stringItem.getAsFile()));
      Assert.eq('Should have some data', '123', getData(stringItem).getOr(''));

      stringItem.getAsString((text) => {
        try {
          Assert.eq('Should be expected contents', '123', text);
          next();
        } catch (e) {
          die(e);
        }
      });
    }))
  ], () => {
    success();
  }, failure);
});
