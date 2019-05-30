import { Pipeline } from '@ephox/agar';
import { LegacyUnit } from '@ephox/mcagar';
import XHR, { XHRSettings } from 'tinymce/core/api/util/XHR';
import { UnitTest } from '@ephox/bedrock';
import { XMLHttpRequest } from '@ephox/dom-globals';

UnitTest.asynctest('browser.tinymce.core.util.XhrTest', function (success, failure) {
  const suite = LegacyUnit.createSuite();

  suite.asyncTest('Successful request', function (_, done) {
    XHR.on('beforeSend', function (e) {
      e.xhr.test = 123;
      e.settings.test = 456;
    });

    XHR.send({
      url: '/custom/json_rpc_ok',
      success (data, xhr: XMLHttpRequest & { test: string }, input: XHRSettings & { test: string }) {
        LegacyUnit.equal(JSON.parse(data), { result: 'Hello JSON-RPC', error: null, id: 1 });
        LegacyUnit.equal(xhr.status, 200);
        LegacyUnit.equal(input.url, '/custom/json_rpc_ok');
        LegacyUnit.equal(xhr.test, 123);
        LegacyUnit.equal(input.test, 456);
        done();
      }
    });
  });

  suite.asyncTest('Unsuccessful request', function (_, done) {
    XHR.send({
      url: '/custom/404',
      error (type, xhr, input) {
        LegacyUnit.equal(type, 'GENERAL');
        LegacyUnit.equal(xhr.status, 404);
        LegacyUnit.equal(input.url, '/custom/404');
        done();
      }
    });
  });

  Pipeline.async({}, suite.toSteps({}), function () {
    success();
  }, failure);
});
