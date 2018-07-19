import { Arr, Fun, Id, Strings } from '@ephox/katamari';
import { JSON as Json } from '@ephox/sand';

import { assertEq } from '../api/RawAssertions';

const missingValuePlaceholder: string = Id.generate('missing');

const dieWith = function (message: string) {
  return Fun.die(message);
};

const assertOnBool = function (c: boolean, label: string, value: any) {
  const strValue = value === missingValuePlaceholder ? '{missing}' : value;
  assertEq(
    label + ', Actual value: ' + Json.stringify(strValue),
    true,
    c
  );
};

const is = function (target: string) {
  const compare = function (actual: string) {
    return target === actual;
  };

  const strAssert = function (label: string, actual: string) {
    const c = compare(actual);
    assertOnBool(c, label + '\nExpected value: ' + target, actual);
  };

  return {
    show: Fun.constant('is("' + target + '")'),
    strAssert: strAssert,
    arrAssert: dieWith('"is" is not an array assertion. Perhaps you wanted "has"?')
  };
};

const startsWith = function (target: string) {
  const compare = function (actual: string) {
    return Strings.startsWith(actual, target);
  };

  const strAssert = function (label: string, actual: string) {
    const c = compare(actual);
    assertOnBool(c, label + '\nExpected value: ' + 'startsWith(' + target + ')', actual);
  };

  return {
    show: Fun.constant('startsWith("' + target + '")'),
    strAssert: strAssert,
    arrAssert: dieWith('"startsWith" is not an array assertion. Perhaps you wanted "hasPrefix"?')
  };
};

const contains = function (target: string) {
  const compare = function (actual: string) {
    return Strings.contains(actual, target);
  };

  const strAssert = function (label: string, actual: string) {
    const c = compare(actual);
    assertOnBool(c, label + '\nExpected value: ' + 'contains(' + target + ')', actual);
  };

  return {
    show: Fun.constant('contains("' + target + '")'),
    strAssert: strAssert,
    arrAssert: dieWith('"contains" is not an array assertion. Perhaps you wanted "has"?')
  };
};

const none = function (message: string = "[[missing value]]") {
  const compare = function (actual: string) {
    return actual === missingValuePlaceholder;
  };

  const strAssert = function (label: string, actual) {
    const c = compare(actual);
    assertOnBool(c, label + '\nExpected ' + message, actual);
  };

  return {
    show: Fun.constant('none("' + message + '")'),
    strAssert: strAssert,
    arrAssert: dieWith('"none" is not an array assertion. Perhaps you wanted "not"?')
  };
};

const has = function <T>(target: T) {
  const compare = function (t: T) {
    return t === target;
  };

  const arrAssert = function (label: string, array: T[]) {
    const matching = Arr.exists(array, compare);
    assertOnBool(matching, label + 'Expected array to contain: ' + target, array);
  };

  return {
    show: Fun.constant('has("' + target + '")'),
    strAssert: dieWith('"has" is not a string assertion. Perhaps you wanted "is"?'),
    arrAssert: arrAssert
  };
};

const hasPrefix = function (prefix: string) {
  const compare = function (t: string) {
    return Strings.startsWith(t, prefix);
  };

  const arrAssert = function (label: string, array: string[]) {
    const matching = Arr.exists(array, compare);
    assertOnBool(matching, label + 'Expected array to contain something with prefix: ' + prefix, array);
  };

  return {
    show: Fun.constant('hasPrefix("' + prefix + '")'),
    strAssert: dieWith('"hasPrefix" is not a string assertion. Perhaps you wanted "startsWith"?'),
    arrAssert: arrAssert
  };
};

const not = function <T>(target: T) {
  const compare = function (actual: T) {
    return target !== actual;
  };

  const arrAssert = function (label: string, array: T[]) {
    // For not, all have to pass the comparison
    const matching = Arr.forall(array, compare);
    assertOnBool(matching, label + 'Expected array to not contain: ' + target, array);
  };

  return {
    show: Fun.constant('not("' + target + '")'),
    strAssert: dieWith('"not" is not a string assertion. Perhaps you wanted "none"?'),
    arrAssert: arrAssert
  };
};

const missing = Fun.constant(missingValuePlaceholder);

export {
  is,
  startsWith,
  contains,
  none,

  has,
  hasPrefix,
  not,

  missing
};