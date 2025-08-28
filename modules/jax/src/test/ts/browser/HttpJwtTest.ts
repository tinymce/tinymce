import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Arr, FutureResult, Result } from '@ephox/katamari';

import { DataType } from 'ephox/jax/core/DataType';
import { HttpError } from 'ephox/jax/core/HttpError';
import * as HttpJwt from 'ephox/jax/core/HttpJwt';
import { JwtTokenFactory } from 'ephox/jax/core/HttpTypes';

/* eslint-disable no-console */

const expectError = (label: string, response: FutureResult<any, HttpError<DataType.JSON>>, expectedCalls: string[], actualCalls: string[]) => FutureResult.nu((callback) => {
  response.get((res) => {
    res.fold((_err) => {
      console.log(label, 'successfully failed');
      Assert.eq('', expectedCalls, actualCalls);
      actualCalls = [];
      callback(Result.value({ }));
    }, (_val) => {
      callback(Result.error('Unexpected value in test: ' + label));
    });
  });
});

const expectValue = (label: string, value: any, response: FutureResult<any, HttpError<DataType.JSON>>, expectedCalls: string[], actualCalls: string[]) => FutureResult.nu((callback) => {
  response.get((res) => {
    res.fold((err) => {
      callback(Result.error(new Error(err.message)));
    }, (val) => {
      try {
        Assert.eq('', value, val);
        console.log(label, 'passed with ', val);
        Assert.eq('', expectedCalls, actualCalls);
        actualCalls = [];
        callback(Result.value({}));
      } catch (err) {
        callback(Result.error(err));
      }
    });
  });
});

UnitTest.asynctest('HttpTest', (success, failure) => {
  const invalidCalls: string[] = [];
  const validCalls: string[] = [];
  const fakeFactory = (calls: string[]): JwtTokenFactory<DataType.JSON> => (fresh) => {
    if (fresh) {
      calls.push('fresh');
      return FutureResult.value('token');
    } else {
      calls.push('cached');
      return FutureResult.value('token');
    }
  };

  const responses = [
    expectError('GET on invalid url', HttpJwt.get<DataType.JSON>(
      {
        url: '/custom/jax/sample/token/invalid',
        responseType: DataType.JSON
      },
      fakeFactory(invalidCalls)
    ), [ 'cached', 'fresh' ], invalidCalls),
    expectValue('GET on valid url', {}, HttpJwt.get<DataType.JSON>(
      {
        url: '/custom/jax/sample/token/valid',
        responseType: DataType.JSON
      },
      fakeFactory(validCalls)
    ), [ 'cached' ], validCalls)
  ];

  Arr.foldr(responses, (res, rest) => {
    return rest.bindFuture(() => {
      return res;
    });
  }, FutureResult.pure({})).get((v) => {
    v.fold((err) => {
      failure(err);
    }, (_) => {
      success();
    });
  });
});
