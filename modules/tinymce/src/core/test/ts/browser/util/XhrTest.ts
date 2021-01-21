import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import XHR, { XHRSettings } from 'tinymce/core/api/util/XHR';

type XHRTest = XMLHttpRequest & { test?: number };
type XHRSettingsTest = XHRSettings & { test?: number };

describe('browser.tinymce.core.util.XhrTest', () => {
  it('Successful request', (done) => {
    XHR.on('beforeSend', (e: { xhr: XHRTest; settings: XHRSettingsTest }) => {
      e.xhr.test = 123;
      e.settings.test = 456;
    });

    XHR.send({
      url: '/custom/json_rpc_ok',
      success: (data, xhr: XHRTest, input: XHRSettingsTest) => {
        assert.deepEqual(JSON.parse(data), { result: 'Hello JSON-RPC', error: null, id: 1 });
        assert.equal(xhr.status, 200);
        assert.equal(input.url, '/custom/json_rpc_ok');
        assert.equal(xhr.test, 123);
        assert.equal(input.test, 456);
        done();
      }
    });
  });

  it('Unsuccessful request', (done) => {
    XHR.send({
      url: '/custom/404',
      error: (type, xhr, input) => {
        assert.equal(type, 'GENERAL');
        assert.equal(xhr.status, 404);
        assert.equal(input.url, '/custom/404');
        done();
      }
    });
  });
});
