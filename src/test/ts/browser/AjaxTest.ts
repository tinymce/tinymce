import Ajax from 'ephox/jax/api/Ajax';
import ContentType from 'ephox/jax/api/ContentType';
import Credentials from 'ephox/jax/api/Credentials';
import ResponseType from 'ephox/jax/api/ResponseType';
import { Arr } from '@ephox/katamari';
import { FutureResult } from '@ephox/katamari';
import { Result } from '@ephox/katamari';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.asynctest('AjaxTest', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];

  var expectError = function (label, response) {
    return FutureResult.nu(function (callback) {
      response.get(function (res) {
        res.fold(function (err) {
          console.log(label, 'successfully failed');
          callback(Result.value({ }));
        }, function (val) {
          callback(Result.error('Unexpected value in test: ' + label));
        });
      });
    });
  };

  var expectValue = function (label, value, response) {
    return FutureResult.nu(function (callback) {
      response.get(function (res) {
        res.fold(function (err) {
          callback(Result.error(new Error(err.message())));
        }, function (val) {
          try {
            assert.eq(value, val);
            console.log(label, 'passed with ', val);
            callback(Result.value({}));
          } catch (err) {
            callback(Result.error(new Error(err)));
          }
        });
      });
    });
  };

  var responses = [
    expectError('GET Query parameters incorrect', Ajax.get(
      '/custom/sample/get/1?word=beta',
      ResponseType.json(),
      Credentials.none(),
      { }
    )),
    expectValue('GET Query parameters correct', {
      results: { good: [ 'alpha' ] }
    }, Ajax.get(
      '/custom/sample/get/1?word=alpha',
      ResponseType.json(),
      Credentials.none(),
      { }
    )),

    expectError('GET Query parameters incorrect because of custom header value', Ajax.get(
      '/custom/sample/get/1?word=beta',
      ResponseType.json(),
      Credentials.none(),
      {
        'X-custom-header': 'X-custom-header-value-wrong'
      }
    )),

    expectValue('GET Query parameters correct because of custom header', {
      results: {
        bad: 'custom-header'
      }
     }, Ajax.get(
      '/custom/sample/get/1?word=beta',
      ResponseType.json(),
      Credentials.none(),
      {
        'X-custom-header': 'X-custom-header-value'
      }
    )),

    expectError('POST with wrong data: ', Ajax.post(
      '/custom/sample/post/1',
      ContentType.json({
        'send-data': 'wrong-number'
      }),
      ResponseType.json(),
      Credentials.none(),
      { }
    )),

    expectValue('POST with correct data: ', {
      'post-output': [ 'Australia', 'US' ]
    }, Ajax.post(
      '/custom/sample/post/1',
      ContentType.json({
        'send-data': '10'
      }),
      ResponseType.json(),
      Credentials.none(),
      { }
    )),

    expectError('PUT with wrong data: ', Ajax.put(
      '/custom/sample/put/1',
      ContentType.json({
        'send-data': '10'
      }),
      ResponseType.json(),
      Credentials.none(),
      { }
    )),

    expectValue('PUT with correct data: ', {
      'put-output': [ 'Australia', 'US' ]
    }, Ajax.put(
      '/custom/sample/put/1',
      ContentType.json({
        'send-data': '15'
      }),
      ResponseType.json(),
      Credentials.none(),
      { }
    )),

    expectError('DELETE Query parameters incorrect', Ajax.del(
      '/custom/sample/del/1?word=beta',
      ResponseType.json(),
      Credentials.none(),
      { }
    )),
    expectValue('DELETE Query parameters correct', {
      results: { 'del-good': [ 'alpha' ] }
    }, Ajax.del(
      '/custom/sample/del/1?word=alpha',
      ResponseType.json(),
      Credentials.none(),
      { }
    )),

    expectError('DELETE Query parameters incorrect because of custom header value', Ajax.del(
      '/custom/sample/del/1?word=beta',
      ResponseType.json(),
      Credentials.none(),
      {
        'X-custom-header': 'X-del-custom-header-value-wrong'
      }
    )),

    expectValue('DELETE Query parameters correct because of custom header', {
      results: {
        'del-bad': 'custom-header'
      }
     }, Ajax.del(
      '/custom/sample/del/1?word=beta',
      ResponseType.json(),
      Credentials.none(),
      {
        'X-custom-header': 'X-del-custom-header-value'
      }
    ))
  ];

  Arr.foldr(responses, function (res, rest) {
    return rest.bindFuture(function () {
      return res;
    });
  }, FutureResult.pure({})).get(function (v) {
    v.fold(function (err) {
      failure(err);
    }, function (_) {
      success();
    });
  });
});

