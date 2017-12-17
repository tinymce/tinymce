import { Pipeline } from '@ephox/agar';
import { LegacyUnit } from '@ephox/mcagar';
import I18n from 'tinymce/core/util/I18n';
import JSONRequest from 'tinymce/core/util/JSONRequest';
import Tools from 'tinymce/core/util/Tools';
import XHR from 'tinymce/core/util/XHR';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.core.util.XhrTest', function() {
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
});

