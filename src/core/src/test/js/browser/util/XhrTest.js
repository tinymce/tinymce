asynctest(
  'browser.tinymce.core.util.XhrTest',
  [
    'ephox.agar.api.Pipeline',
    'ephox.mcagar.api.LegacyUnit',
    'tinymce.core.util.I18n',
    'tinymce.core.util.JSONRequest',
    'tinymce.core.util.Tools',
    'tinymce.core.util.XHR'
  ],
  function (Pipeline, LegacyUnit, I18n, JSONRequest, Tools, XHR) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];
    var suite = LegacyUnit.createSuite();

    suite.asyncTest("Successful request", function (_, done) {
      XHR.on('beforeSend', function (e) {
        e.xhr.test = 123;
        e.settings.test = 456;
      });

      XHR.send({
        url: '/custom/json_rpc_ok',
        success: function (data, xhr, input) {
          LegacyUnit.equal(JSON.parse(data), { "result": "Hello JSON-RPC", "error": null, "id": 1 });
          LegacyUnit.equal(xhr.status, 200);
          LegacyUnit.equal(input.url, '/custom/json_rpc_ok');
          LegacyUnit.equal(xhr.test, 123);
          LegacyUnit.equal(input.test, 456);
          done();
        }
      });
    });

    suite.asyncTest("Unsuccessful request", function (_, done) {
      XHR.send({
        url: '/custom/404',
        error: function (type, xhr, input) {
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
  }
);
