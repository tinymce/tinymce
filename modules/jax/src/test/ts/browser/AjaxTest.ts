import { assert, UnitTest } from '@ephox/bedrock-client';
import { Blob, console } from '@ephox/dom-globals';
import { Arr, FutureResult, Result } from '@ephox/katamari';
import { readBlobAsText } from 'ephox/jax/core/BlobReader';
import { DataType } from 'ephox/jax/core/DataType';
import * as Http from 'ephox/jax/core/Http';
import { HttpError } from 'ephox/jax/core/HttpError';

/* tslint:disable:no-console */

const expectError = (label: string, response: FutureResult<any, HttpError>) => FutureResult.nu((callback) => {
  response.get((res) => {
    res.fold((_err) => {
      console.log(label, 'successfully failed');
      callback(Result.value({ }));
    }, (_val) => {
      callback(Result.error('Unexpected value in test: ' + label));
    });
  });
});

const expectValue = (label: string, value: any, response: FutureResult<any, HttpError>) => FutureResult.nu((callback) => {
  response.get((res) => {
    res.fold((err) => {
      callback(Result.error(new Error(err.message)));
    }, (val) => {
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

const expectBlobJson = (label: string, value: any, response: FutureResult<Blob, HttpError>) => FutureResult.nu((callback) => {
  response.get((res) => {
    res.fold((err) => {
      callback(Result.error(new Error(err.message)));
    }, (blob) => {
      readBlobAsText(blob).get((text) => {
        try {
          assert.eq(JSON.stringify(value, null, '  '), text);
          console.log(label, 'passed with ', text);
          callback(Result.value({}));
        } catch (err) {
          callback(Result.error(new Error(err)));
        }
      });
    });
  });
});

UnitTest.asynctest('HttpTest', (success, failure) => {
  const responses = [
    expectError('GET Query parameters incorrect', Http.get(
      {
        url: '/custom/jax/sample/get/1?word=beta',
        responseType: DataType.JSON
      }
    )),

    expectValue('GET Query parameters correct', {
      results: { good: [ 'alpha' ] }
    }, Http.get(
      {
        url: '/custom/jax/sample/get/1?word=alpha',
        responseType: DataType.JSON
      }
    )),

    expectValue('GET with query parameters alpha, beta', {
      good: [ 'alpha', 'beta' ]
    }, Http.get(
      {
        url: '/custom/jax/sample/get/1',
        query: { alpha: '1', beta: '2' },
        responseType: DataType.JSON
      }
    )),

    expectValue('GET with url query parameter alpha and query parameter beta', {
      good: [ 'alpha', 'beta' ]
    }, Http.get(
      {
        url: '/custom/jax/sample/get/1?alpha=1',
        query: { beta: '2' },
        responseType: DataType.JSON
      }
    )),

    expectValue('GET with url query parameters alpha and beeta and query parameter gamma', {
      good: [ 'alpha', 'beta', 'gamma' ]
    }, Http.get(
      {
        url: '/custom/jax/sample/get/2?alpha=1&beta=2',
        query: { gamma: '3' },
        responseType: DataType.JSON
      }
    )),

    expectError('GET Query parameters incorrect because of custom header value', Http.get(
      {
        url: '/custom/jax/sample/get/1?word=beta',
        responseType: DataType.JSON,
        headers: {
          'X-custom-header': 'X-custom-header-value-wrong'
        }
      }
    )),

    expectValue('GET Query parameters correct because of custom header', {
      results: {
        bad: 'custom-header'
      }
    }, Http.get(
      {
        url: '/custom/jax/sample/get/1?word=beta',
        responseType: DataType.JSON,
        headers: {
          'X-custom-header': 'X-custom-header-value'
        }
      }
    )),

    expectError('POST with wrong data: ', Http.post(
      {
        url: '/custom/jax/sample/post/1',
        body: {
          type: DataType.JSON,
          data: {
            'send-data': 'wrong-number'
          }
        },
        responseType: DataType.JSON
      }
    )),

    expectValue('POST with correct data: ', {
      'post-output': [ 'Australia', 'US' ]
    }, Http.post(
      {
        url: '/custom/jax/sample/post/1',
        body: {
          type: DataType.JSON,
          data: {
            'send-data': '10'
          }
        },
        responseType: DataType.JSON
      }
    )),

    expectError('PUT with wrong data: ', Http.put(
      {
        url: '/custom/jax/sample/put/1',
        body: {
          type: DataType.JSON,
          data: {
            'send-data': '10'
          }
        },
        responseType: DataType.JSON
      }
    )),

    expectValue('PUT with correct data: ', {
      'put-output': [ 'Australia', 'US' ]
    }, Http.put(
      {
        url: '/custom/jax/sample/put/1',
        body: {
          type: DataType.JSON,
          data: {
            'send-data': '15'
          }
        },
        responseType: DataType.JSON
      }
    )),

    expectError('DELETE Query parameters incorrect', Http.del(
      {
        url: 'custom/jax/sample/del/1?word=beta',
        responseType: DataType.JSON
      }
    )),

    expectValue('DELETE Query parameters correct', {
      results: { 'del-good': [ 'alpha' ] }
    }, Http.del(
      {
        url: 'custom/jax/sample/del/1?word=alpha',
        responseType: DataType.JSON
      }
    )),

    expectError('DELETE Query parameters incorrect because of custom header value', Http.del(
      {
        url: '/custom/jax/sample/del/1?word=beta',
        responseType: DataType.JSON,
        headers: {
          'X-custom-header': 'X-del-custom-header-value-wrong'
        }
      }
    )),

    expectValue('DELETE Query parameters correct because of custom header', {
      results: {
        'del-bad': 'custom-header'
      }
    }, Http.del(
      {
        url: '/custom/jax/sample/del/1?word=beta',
        responseType: DataType.JSON,
        headers: {
          'X-custom-header': 'X-del-custom-header-value'
        }
      }
    )),

    expectBlobJson('Download with correct blob data', { results: { data: '123' }}, Http.download(
      {
        url: '/custom/jax/blob',
        headers: {
          'x-custom-header': 'custom'
        }
      }
    ))
  ];

  Arr.foldr(responses, (res, rest) => rest.bindFuture(() => res), FutureResult.pure({})).get((v) => {
    v.fold((err) => {
      failure(err);
    }, (_) => {
      success();
    });
  });
});
