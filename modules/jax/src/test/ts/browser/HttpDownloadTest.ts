import { FutureResult } from '@ephox/katamari';
import { UnitTest, assert } from '@ephox/bedrock-client';
import * as Http from 'ephox/jax/core/Http';
import { HttpError } from 'ephox/jax/core/HttpError';
import { readBlobAsText } from 'ephox/jax/core/BlobReader';

UnitTest.asynctest('HttpDownloadTest', (success, failure) => {
  let progressCalls = 0;
  let total = 0;

  Http.download(
    {
      url: '/custom/jax/blob',
      headers: {
        'x-custom-header': 'custom'
      },
      progress: (loaded) => {
        progressCalls++;
        total += loaded;
      }
    }
  ).bindFuture((blob) => FutureResult.fromFuture<string, HttpError>(readBlobAsText(blob))).get((result) => {
    result.fold(
      (err) => failure(err.message),
      (actualText) => {
        const expectedText = JSON.stringify({ results: { data: '123' }}, null, '  ');

        assert.eq(expectedText, actualText, 'Should be the expected text');
        assert.eq(true, progressCalls > 1, 'Should be more than 1 progress calls');
        assert.eq(40, total, 'Should be 40 bytes of data in total');

        success();
      }
    );
  });
});
