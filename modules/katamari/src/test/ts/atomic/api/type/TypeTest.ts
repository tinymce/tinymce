// noinspection JSPrimitiveTypeWrapperUsage

import { Assert, context, describe, it } from '@ephox/bedrock-client';
import { Pprint } from '@ephox/dispute';
import { assert } from 'chai';
import * as fc from 'fast-check';

import * as Arr from 'ephox/katamari/api/Arr';
import * as Fun from 'ephox/katamari/api/Fun';
import { Optional } from 'ephox/katamari/api/Optional';
import * as Type from 'ephox/katamari/api/Type';

const check = (method: (u: unknown) => boolean, methodName: string) => (expected: boolean, input: unknown) => {
  const actual = method(input);
  assert.equal(
    actual,
    expected,
    'Expected: ' + methodName + '(' + Pprint.render(input, Pprint.pprintAny) + ') to be ' + expected
  );
};

// eslint-disable-next-line no-new-wrappers
const objectString = new String('ball');
const noop = Fun.noop;

const checkIsNull = check(Type.isNull, 'isNull');
const checkIsUndefined = check(Type.isUndefined, 'isUndefined');
const checkIsBoolean = check(Type.isBoolean, 'isBoolean');
const checkIsString = check(Type.isString, 'isString');
const checkIsObject = check(Type.isObject, 'isObject');
const checkIsArray = check(Type.isArray, 'isArray');
const checkIsFunction = check(Type.isFunction, 'isFunction');
const checkIsNumber = check(Type.isNumber, 'isNumber');

describe('atomic.katamari.api.struct.TypeTest', () => {
  it('isNull', () => {
    checkIsNull(true, null);
    checkIsNull(false, undefined);
    checkIsNull(false, true);
    checkIsNull(false, false);
    checkIsNull(false, 'ball');
    checkIsNull(false, {});
    checkIsNull(false, objectString);
    checkIsNull(false, []);
    checkIsNull(false, noop);
    checkIsNull(false, [ 1, 3, 4, 5 ]);
    checkIsNull(false, 1);
  });

  it('isUndefined', () => {
    checkIsUndefined(false, null);
    checkIsUndefined(true, undefined);
    checkIsUndefined(false, true);
    checkIsUndefined(false, false);
    checkIsUndefined(false, 'ball');
    checkIsUndefined(false, {});
    checkIsUndefined(false, objectString);
    checkIsUndefined(false, []);
    checkIsUndefined(false, noop);
    checkIsUndefined(false, [ 1, 3, 4, 5 ]);
    checkIsUndefined(false, 1);
  });

  it('isBoolean', () => {
    checkIsBoolean(false, null);
    checkIsBoolean(false, undefined);
    checkIsBoolean(true, true);
    checkIsBoolean(true, false);
    checkIsBoolean(false, 'ball');
    checkIsBoolean(false, {});
    checkIsBoolean(false, objectString);
    checkIsBoolean(false, []);
    checkIsBoolean(false, noop);
    checkIsBoolean(false, [ 1, 3, 4, 5 ]);
    checkIsBoolean(false, 1);
  });

  it('isString', () => {
    checkIsString(false, null);
    checkIsString(false, undefined);
    checkIsString(false, true);
    checkIsString(false, false);
    checkIsString(true, 'ball');
    checkIsString(false, {});
    checkIsString(true, objectString);
    checkIsString(false, []);
    checkIsString(false, noop);
    checkIsString(false, [ 1, 3, 4, 5 ]);
    checkIsString(false, 1);
  });

  it('isObject', () => {
    checkIsObject(false, null);
    checkIsObject(false, undefined);
    checkIsObject(false, true);
    checkIsObject(false, false);
    checkIsObject(false, 'ball');
    checkIsObject(true, {});
    checkIsObject(false, objectString);
    checkIsObject(false, []);
    checkIsObject(false, noop);
    checkIsObject(false, [ 1, 3, 4, 5 ]);
    checkIsObject(false, 1);
  });

  it('isArray', () => {
    checkIsArray(false, null);
    checkIsArray(false, undefined);
    checkIsArray(false, true);
    checkIsArray(false, false);
    checkIsArray(false, 'ball');
    checkIsArray(false, {});
    checkIsArray(false, objectString);
    checkIsArray(true, []);
    checkIsArray(false, noop);
    checkIsArray(true, [ 1, 3, 4, 5 ]);
    checkIsArray(false, 1);
  });

  it('isFunction', () => {
    checkIsFunction(false, null);
    checkIsFunction(false, undefined);
    checkIsFunction(false, true);
    checkIsFunction(false, false);
    checkIsFunction(false, 'ball');
    checkIsFunction(false, {});
    checkIsFunction(false, objectString);
    checkIsFunction(false, []);
    checkIsFunction(true, noop);
    checkIsFunction(false, [ 1, 3, 4, 5 ]);
    checkIsFunction(false, 1);
  });

  it('isNumber', () => {
    checkIsNumber(false, null);
    checkIsNumber(false, undefined);
    checkIsNumber(false, true);
    checkIsNumber(false, false);
    checkIsNumber(false, 'ball');
    checkIsNumber(false, {});
    checkIsNumber(false, objectString);
    checkIsNumber(false, []);
    checkIsNumber(false, noop);
    checkIsNumber(false, [ 1, 3, 4, 5 ]);
    checkIsNumber(true, 1);
  });

  it('Type.is*: only one should match for every value', () => {
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

    fc.assert(fc.property(fc.anything(), (x) => {
      const matches = Arr.filter(classifiers, (c) => c(x));
      assert.lengthOf(matches, 1);
    }));
  });

  it('Type.isNullable', () => {
    assert.isTrue(Type.isNullable(null));
    assert.isTrue(Type.isNullable(undefined));
    fc.assert(fc.property(fc.string(), (s) => {
      assert.isFalse(Type.isNullable(s));
    }));
    fc.assert(fc.property(fc.integer(), (i) => {
      assert.isFalse(Type.isNullable(i));
    }));
  });

  it('Type.isNonNullable', () => {
    assert.isFalse(Type.isNonNullable(null));
    assert.isFalse(Type.isNonNullable(undefined));
    fc.assert(fc.property(fc.string(), (s) => {
      assert.isTrue(Type.isNonNullable(s));
    }));
    fc.assert(fc.property(fc.integer(), (i) => {
      assert.isTrue(Type.isNonNullable(i));
    }));

    // this is testing a compile-time check of the type guard
    const os: string | null | undefined = 'hello';
    if (Type.isNonNullable(os)) {
      // noinspection UnnecessaryLocalVariableJS
      const s: string = os;
      Assert.eq('s', s, os);
    }
  });

  context('Type.isPlainObject', () => {
    it('returns false for null and undefined', () => {
      assert.isFalse(Type.isPlainObject(null));
      assert.isFalse(Type.isPlainObject(undefined));
    });

    it('returns false for things that are not even objects', () => {
      assert.isFalse(Type.isPlainObject('hello'));
      assert.isFalse(Type.isPlainObject(5));
      assert.isFalse(Type.isPlainObject([ 1, 2, 4 ]));
    });

    it('returns true for actual plain objects', () => {
      assert.isTrue(Type.isPlainObject({}));
      assert.isTrue(Type.isPlainObject({ a: 3 }));
      assert.isTrue(Type.isPlainObject({ field: 'more-fields', next: 'other-field' }));
    });

    it('returns false for classes', () => {
      assert.isFalse(Type.isPlainObject(new Set()));
      assert.isFalse(Type.isPlainObject(new Map()));
      assert.isFalse(Type.isPlainObject(Optional.none()));
      assert.isFalse(Type.isPlainObject(Optional.some(5)));
    });
  });

  context('Type.is', () => {
    it('returns false for null or undefined', () => {
      assert.isFalse(Type.is(null, RegExp));
      assert.isFalse(Type.is(undefined, RegExp));
    });

    it('returns false for things that are not even objects', () => {
      assert.isFalse(Type.is('hello', RegExp));
      assert.isFalse(Type.is(5, RegExp));
      assert.isFalse(Type.is([ 1, 2, 4 ], RegExp));
    });

    it('returns true for items that match the constructor', () => {
      assert.isTrue(Type.is(/test/, RegExp));
      assert.isTrue(Type.is(new Set(), Set));
    });
  });
});
