import { Pipeline } from '@ephox/agar';
import { LegacyUnit } from '@ephox/mcagar';
import I18n from 'tinymce/core/util/I18n';
import JSONRequest from 'tinymce/core/util/JSONRequest';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.core.util.JsonRequestTest', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];
  var suite = LegacyUnit.createSuite();

  suite.asyncTest("Successful request - send method", function (editor, done) {
    new JSONRequest({}).send({
      type: 'GET',
      url: '/custom/json_rpc_ok',
      success: function (data) {
        LegacyUnit.equal(data, 'Hello JSON-RPC');
        done();
      }
    });
  });

  suite.asyncTest("Successful request - sendRPC static method", function (editor, done) {
    JSONRequest.sendRPC({
      type: 'GET',
      url: '/custom/json_rpc_ok',
      success: function (data) {
        LegacyUnit.equal(data, 'Hello JSON-RPC');
        done();
      }
    });
  });

  suite.asyncTest("Error request - send method", function (editor, done) {
    new JSONRequest({}).send({
      type: 'GET',
      url: '/custom/json_rpc_fail',
      error: function (error) {
        LegacyUnit.equal(error.code, 42);
        done();
      }
    });
  });

  suite.asyncTest("Error request - sendRPC static method", function (editor, done) {
    JSONRequest.sendRPC({
      type: 'GET',
      url: '/custom/json_rpc_fail',
      error: function (error) {
        LegacyUnit.equal(error.code, 42);
        done();
      }
    });
  });

  Pipeline.async({}, suite.toSteps({}), function () {
    success();
  }, failure);
});

