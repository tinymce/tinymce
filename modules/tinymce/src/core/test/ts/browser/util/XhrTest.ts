import { Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { LegacyUnit } from '@ephox/mcagar';
import XHR, { XHRSettings } from 'tinymce/core/api/util/XHR';

UnitTest.asynctest('browser.tinymce.core.util.XhrTest', (success, failure) => {
  const suite = LegacyUnit.createSuite();

  type XHRTest = XMLHttpRequest & { test?: number };
  type XHRSettingsTest = XHRSettings & { test?: number };

  suite.asyncTest('Successful request', (_, done) => {
    XHR.on('beforeSend', (e: { xhr: XHRTest; settings: XHRSettingsTest }) => {
      e.xhr.test = 123;
      e.settings.test = 456;
    });

    XHR.send({
      url: '/custom/json_rpc_ok',
      success: (data, xhr: XHRTest, input: XHRSettingsTest) => {
        LegacyUnit.equal(JSON.parse(data), { result: 'Hello JSON-RPC', error: null, id: 1 });
        LegacyUnit.equal(xhr.status, 200);
        LegacyUnit.equal(input.url, '/custom/json_rpc_ok');
        LegacyUnit.equal(xhr.test, 123);
        LegacyUnit.equal(input.test, 456);
        done();
      }
    });
  });

  suite.asyncTest('Unsuccessful request', (_, done) => {
    XHR.send({
      url: '/custom/404',
      error: (type, xhr, input) => {
        LegacyUnit.equal(type, 'GENERAL');
        LegacyUnit.equal(xhr.status, 404);
        LegacyUnit.equal(input.url, '/custom/404');
        done();
      }
    });
  });

  Pipeline.async({}, suite.toSteps({}), success, failure);
});
