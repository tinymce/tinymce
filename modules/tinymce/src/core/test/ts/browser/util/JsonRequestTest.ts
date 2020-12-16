import { Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { LegacyUnit } from '@ephox/mcagar';
import JSONRequest from 'tinymce/core/api/util/JSONRequest';

UnitTest.asynctest('browser.tinymce.core.util.JsonRequestTest', (success, failure) => {
  const suite = LegacyUnit.createSuite();

  suite.asyncTest('Successful request - send method', (editor, done) => {
    new JSONRequest({}).send({
      type: 'GET',
      url: '/custom/json_rpc_ok',
      success: (data) => {
        LegacyUnit.equal(data, 'Hello JSON-RPC');
        done();
      }
    });
  });

  suite.asyncTest('Successful request - sendRPC static method', (editor, done) => {
    JSONRequest.sendRPC({
      type: 'GET',
      url: '/custom/json_rpc_ok',
      success: (data) => {
        LegacyUnit.equal(data, 'Hello JSON-RPC');
        done();
      }
    });
  });

  suite.asyncTest('Error request - send method', (editor, done) => {
    new JSONRequest({}).send({
      type: 'GET',
      url: '/custom/json_rpc_fail',
      error: (error) => {
        LegacyUnit.equal(error.code, 42);
        done();
      }
    });
  });

  suite.asyncTest('Error request - sendRPC static method', (editor, done) => {
    JSONRequest.sendRPC({
      type: 'GET',
      url: '/custom/json_rpc_fail',
      error: (error) => {
        LegacyUnit.equal(error.code, 42);
        done();
      }
    });
  });

  Pipeline.async({}, suite.toSteps({}), success, failure);
});
