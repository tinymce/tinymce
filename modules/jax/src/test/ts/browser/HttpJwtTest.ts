import { Arr, FutureResult, Result } from '@ephox/katamari';
import { UnitTest, assert } from '@ephox/bedrock-client';
import { console } from '@ephox/dom-globals';
import * as HttpJwt from 'ephox/jax/core/HttpJwt';
import { JwtTokenFactory } from 'ephox/jax/core/HttpTypes';
import { DataType } from 'ephox/jax/core/DataType';
import { HttpError } from 'ephox/jax/core/HttpError';

/* tslint:disable:no-console */

const expectError = (label: string, response: FutureResult<any, HttpError>, expectedCalls: string[], actualCalls: string[]) => {
  return FutureResult.nu((callback) => {
    response.get((res) => {
      res.fold((err) => {
        console.log(label, 'successfully failed');
        assert.eq(expectedCalls, actualCalls);
        actualCalls = [];
        callback(Result.value({ }));
      }, (val) => {
        callback(Result.error('Unexpected value in test: ' + label));
      });
    });
  });
};

const expectValue = (label: string, value: any, response: FutureResult<any, HttpError>, expectedCalls: string[], actualCalls: string[]) => {
  return FutureResult.nu((callback) => {
    response.get((res) => {
      res.fold((err) => {
        callback(Result.error(new Error(err.message)));
      }, (val) => {
        try {
          assert.eq(value, val);
          console.log(label, 'passed with ', val);
          assert.eq(expectedCalls, actualCalls);
          actualCalls = [];
          callback(Result.value({}));
        } catch (err) {
          callback(Result.error(err));
        }
      });
    });
  });
};

UnitTest.asynctest('HttpTest', (success, failure) => {
  const invalidCalls: string[] = [];
  const validCalls: string[] = [];
  const fakeFactory = (calls: string[]): JwtTokenFactory => (fresh) => {
    if (fresh) {
      calls.push('fresh');
      return FutureResult.value('token');
    } else {
      calls.push('cached');
      return FutureResult.value('token');
    }
  };

  const responses = [
    expectError('GET on invalid url', HttpJwt.get(
      {
        url: '/custom/jax/sample/token/invalid',
        responseType: DataType.JSON,
      },
      fakeFactory(invalidCalls)
    ), [ 'cached', 'fresh'], invalidCalls),
    expectValue('GET on valid url', {}, HttpJwt.get(
      {
        url: '/custom/jax/sample/token/valid',
        responseType: DataType.JSON,
      },
      fakeFactory(validCalls)
    ), [ 'cached'], validCalls)
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
