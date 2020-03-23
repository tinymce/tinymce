import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Logger, Pipeline, Step } from 'ephox/agar/api/Main';
import { createFile } from 'ephox/agar/api/Files';
import { Blob } from '@ephox/dom-globals';
import { readBlobAsText } from 'ephox/agar/test/BlobReader';

UnitTest.asynctest('FilesTest', (success, failure) => {
  Pipeline.async({}, [
    Logger.t('Create file', Step.sync(() => {
      const file = createFile('test.txt', 1234, new Blob([ '123' ], { type: 'text/plain' }));

      Assert.eq('Should have expected file name', 'test.txt', file.name);
      Assert.eq('Should have expected size', 3, file.size);
      Assert.eq('Should have expected date', 1234, file.lastModified);
      Assert.eq('Should be expected file', 'text/plain', file.type);
    })),

    Logger.t('Create file and read blob data', Step.async((next, die) => {
      const file = createFile('test.txt', 1234, new Blob([ '123' ], { type: 'text/plain' }));

      readBlobAsText(file).get((result) => {
        result.fold(
          failure,
          (text) => {
            try {
              Assert.eq('Should be the expected blob contents', '123', text);
              next();
            } catch (e) {
              die(e);
            }
          }
        );
      });
    }))
  ], () => success(), failure);
});
