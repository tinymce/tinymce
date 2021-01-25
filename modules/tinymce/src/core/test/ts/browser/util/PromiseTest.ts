import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import Promise from 'tinymce/core/api/util/Promise';

describe('browser.tinymce.core.util.PromiseTest', () => {
  it('Promise resolve', (done) => {
    new Promise((resolve) => {
      resolve('123');
    }).then((result) => {
      assert.equal('123', result);
      done();
    });
  });

  it('Promise reject', (done) => {
    new Promise((resolve, reject) => {
      reject('123');
    }).then(() => {
      done(new Error('Promise should not have resolved'));
    }, (result) => {
      assert.equal('123', result);
      done();
    });
  });

  it('Promise all', (done) => {
    const promises = [
      new Promise((resolve) => {
        resolve('123');
      }),

      new Promise((resolve) => {
        resolve('456');
      })
    ];

    Promise.all(promises).then((results) => {
      assert.equal('123', results[0]);
      assert.equal('456', results[1]);
      done();
    });
  });
});
