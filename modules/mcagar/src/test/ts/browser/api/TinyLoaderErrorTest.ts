import { Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import * as TinyLoader from 'ephox/mcagar/api/pipeline/TinyLoader';

describe('TinyLoaderErrorTest', () => {
  it('should fail (instead of timeout) when exception is thrown in callback function', async () => {
    let failed = false;

    TinyLoader.setup(
      () => {
        throw new Error('boo!');
      },
      { base_url: '/project/tinymce/js/tinymce' },
      () => assert.fail(),  // If the success callback is called, fail this test
      () => failed = true
    );

    await Waiter.pTryUntil('Wait for the TinyLoader failure callback', () => {
      assert.isTrue(failed);
    });
  });
});
