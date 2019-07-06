import * as Arr from 'ephox/katamari/api/Arr';
import * as Type from 'ephox/katamari/api/Type';
import Jsc from '@ephox/wrap-jsverify';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('Type', function () {
  const check = function (expected, method, input) {
    const actual = Type[method](input);
    assert.eq(expected, actual, 'I\'m a failure.');
  };

  // tslint:disable-next-line:no-construct
  const objectString = new String('ball');
  const noop = function () { };

  check(true, 'isNull', null);
  check(false, 'isNull', undefined);
  check(false, 'isNull', true);
  check(false, 'isNull', false);
  check(false, 'isNull', 'ball');
  check(false, 'isNull', {});
  check(false, 'isNull', objectString);
  check(false, 'isNull', []);
  check(false, 'isNull', noop);
  check(false, 'isNull', [1, 3, 4, 5]);
  check(false, 'isNull', 1);

  check(false, 'isUndefined', null);
  check(true, 'isUndefined', undefined);
  check(false, 'isUndefined', true);
  check(false, 'isUndefined', false);
  check(false, 'isUndefined', 'ball');
  check(false, 'isUndefined', {});
  check(false, 'isUndefined', objectString);
  check(false, 'isUndefined', []);
  check(false, 'isUndefined', noop);
  check(false, 'isUndefined', [1, 3, 4, 5]);
  check(false, 'isUndefined', 1);

  check(false, 'isBoolean', null);
  check(false, 'isBoolean', undefined);
  check(true, 'isBoolean', true);
  check(true, 'isBoolean', false);
  check(false, 'isBoolean', 'ball');
  check(false, 'isBoolean', {});
  check(false, 'isBoolean', objectString);
  check(false, 'isBoolean', []);
  check(false, 'isBoolean', noop);
  check(false, 'isBoolean', [1, 3, 4, 5]);
  check(false, 'isBoolean', 1);

  check(false, 'isString', null);
  check(false, 'isString', undefined);
  check(false, 'isString', true);
  check(false, 'isString', false);
  check(true, 'isString', 'ball');
  check(false, 'isString', {});
  check(true, 'isString', objectString);
  check(false, 'isString', []);
  check(false, 'isString', noop);
  check(false, 'isString', [1, 3, 4, 5]);
  check(false, 'isString', 1);

  check(false, 'isObject', null);
  check(false, 'isObject', undefined);
  check(false, 'isObject', true);
  check(false, 'isObject', false);
  check(false, 'isObject', 'ball');
  check(true, 'isObject', {});
  check(false, 'isObject', objectString);
  check(false, 'isObject', []);
  check(false, 'isObject', noop);
  check(false, 'isObject', [1, 3, 4, 5]);
  check(false, 'isObject', 1);

  check(false, 'isArray', null);
  check(false, 'isArray', undefined);
  check(false, 'isArray', true);
  check(false, 'isArray', false);
  check(false, 'isArray', 'ball');
  check(false, 'isArray', {});
  check(false, 'isArray', objectString);
  check(true, 'isArray', []);
  check(false, 'isArray', noop);
  check(true, 'isArray', [1, 3, 4, 5]);
  check(false, 'isArray', 1);

  check(false, 'isFunction', null);
  check(false, 'isFunction', undefined);
  check(false, 'isFunction', true);
  check(false, 'isFunction', false);
  check(false, 'isFunction', 'ball');
  check(false, 'isFunction', {});
  check(false, 'isFunction', objectString);
  check(false, 'isFunction', []);
  check(true, 'isFunction', noop);
  check(false, 'isFunction', [1, 3, 4, 5]);
  check(false, 'isFunction', 1);

  check(false, 'isNumber', null);
  check(false, 'isNumber', undefined);
  check(false, 'isNumber', true);
  check(false, 'isNumber', false);
  check(false, 'isNumber', 'ball');
  check(false, 'isNumber', {});
  check(false, 'isNumber', objectString);
  check(false, 'isNumber', []);
  check(false, 'isNumber', noop);
  check(false, 'isNumber', [1, 3, 4, 5]);
  check(true, 'isNumber', 1);

  Jsc.property('Check Type.is* :: only one should match for every value', Jsc.json, function (json) {
    const classifiers = [
      Type.isString,
      Type.isObject,
      Type.isArray,
      Type.isNull,
      Type.isBoolean,
      Type.isUndefined,
      Type.isFunction,
      Type.isNumber
    ];

    const matches = Arr.filter(classifiers, function (c) {
      return c(json);
    });

    return matches.length === 1;
  });
});
