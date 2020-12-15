import { Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { LegacyUnit } from '@ephox/mcagar';
import Promise from 'tinymce/core/api/util/Promise';

UnitTest.asynctest('browser.tinymce.core.util.PromiseTest', (success, failure) => {
  const suite = LegacyUnit.createSuite();

  suite.asyncTest('Promise resolve', (_, done) => {
    new Promise((resolve) => {
      resolve('123');
    }).then((result) => {
      LegacyUnit.equal('123', result);
      done();
    });
  });

  suite.asyncTest('Promise reject', (_, done) => {
    new Promise((resolve, reject) => {
      reject('123');
    }).then(Fun.noop, (result) => {
      LegacyUnit.equal('123', result);
      done();
    });
  });

  suite.asyncTest('Promise reject', (_, done) => {
    const promises = [
      new Promise((resolve) => {
        resolve('123');
      }),

      new Promise((resolve) => {
        resolve('456');
      })
    ];

    Promise.all(promises).then((results) => {
      LegacyUnit.equal('123', results[0]);
      LegacyUnit.equal('456', results[1]);
      done();
    });
  });

  Pipeline.async({}, suite.toSteps({}), success, failure);
});
