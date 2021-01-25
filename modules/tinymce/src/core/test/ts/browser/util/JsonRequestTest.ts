import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import JSONRequest from 'tinymce/core/api/util/JSONRequest';

describe('browser.tinymce.core.util.JsonRequestTest', () => {
  it('Successful request - send method', (done) => {
    new JSONRequest({}).send({
      type: 'GET',
      url: '/custom/json_rpc_ok',
      success: (data) => {
        assert.equal(data, 'Hello JSON-RPC');
        done();
      }
    });
  });

  it('Successful request - sendRPC static method', (done) => {
    JSONRequest.sendRPC({
      type: 'GET',
      url: '/custom/json_rpc_ok',
      success: (data) => {
        assert.equal(data, 'Hello JSON-RPC');
        done();
      }
    });
  });

  it('Error request - send method', (done) => {
    new JSONRequest({}).send({
      type: 'GET',
      url: '/custom/json_rpc_fail',
      error: (error) => {
        assert.equal(error.code, 42);
        done();
      }
    });
  });

  it('Error request - sendRPC static method', (done) => {
    JSONRequest.sendRPC({
      type: 'GET',
      url: '/custom/json_rpc_fail',
      error: (error) => {
        assert.equal(error.code, 42);
        done();
      }
    });
  });
});
