asynctest(
  'browser.tinymce.core.util.JsonRequestTest',
  [
    'ephox.agar.api.Pipeline',
    'ephox.mcagar.api.LegacyUnit',
    'tinymce.core.util.I18n',
    'tinymce.core.util.JSONRequest'
  ],
  function (Pipeline, LegacyUnit, I18n, JSONRequest) {
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
  }
);
