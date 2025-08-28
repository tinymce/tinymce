import { Assert, UnitTest } from '@ephox/bedrock-client';
import { FutureResult } from '@ephox/katamari';

import { readBlobAsText } from 'ephox/jax/core/BlobReader';
import * as Http from 'ephox/jax/core/Http';

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
  ).bindFuture((blob) => FutureResult.fromFuture(readBlobAsText(blob))).get((result) => {
    result.fold(
      (err) => failure(err.message),
      (actualText) => {
        const expectedText = JSON.stringify({ results: { data: '123' }}, null, '  ');

        Assert.eq('Should be the expected text', expectedText, actualText);
        Assert.eq('Should be more than 1 progress calls', true, progressCalls > 1);
        Assert.eq('Should be 40 bytes of data in total', 40, total);

        success();
      }
    );
  });
});
