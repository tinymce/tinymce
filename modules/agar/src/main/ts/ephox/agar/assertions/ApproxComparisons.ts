import { Arr, Fun, Id, Strings } from '@ephox/katamari';

import { assertEq } from '../api/RawAssertions';
import { TestLabel } from '@ephox/bedrock';
import { ArrayAssert, StringAssert } from './ApproxStructures';

const missingValuePlaceholder: string = Id.generate('missing');

const dieWith = function (message: string) {
  return Fun.die(message);
};

const assertOnBool = function (c: boolean, label: TestLabel, value: any): void {
  const strValue = value === missingValuePlaceholder ? '{missing}' : value;
  assertEq(
    TestLabel.concat(label, () => ', Actual value: ' + JSON.stringify(strValue)),
    true,
    c
  );
};

export type CombinedAssert = StringAssert & ArrayAssert;

const is = function (target: string): CombinedAssert {
  const compare = function (actual: string) {
    return target === actual;
  };

  const strAssert = function (label: TestLabel, actual: string) {
    const c = compare(actual);
    assertOnBool(c, TestLabel.concat(label, '\nExpected value: ' + target), actual);
  };

  return {
    show: Fun.constant('is("' + target + '")'),
    strAssert,
    arrAssert: dieWith('"is" is not an array assertion. Perhaps you wanted "has"?')
  };
};

const startsWith = function (target: string): CombinedAssert {
  const compare = function (actual: string) {
    return Strings.startsWith(actual, target);
  };

  const strAssert = function (label: TestLabel, actual: string) {
    const c = compare(actual);
    assertOnBool(c, TestLabel.concat(label, '\nExpected value: ' + 'startsWith(' + target + ')'), actual);
  };

  return {
    show: Fun.constant('startsWith("' + target + '")'),
    strAssert,
    arrAssert: dieWith('"startsWith" is not an array assertion. Perhaps you wanted "hasPrefix"?')
  };
};

const contains = function (target: string): CombinedAssert {
  const compare = function (actual: string) {
    return Strings.contains(actual, target);
  };

  const strAssert = function (label: TestLabel, actual: string) {
    const c = compare(actual);
    assertOnBool(c, TestLabel.concat(label, '\nExpected value: ' + 'contains(' + target + ')'), actual);
  };

  return {
    show: Fun.constant('contains("' + target + '")'),
    strAssert,
    arrAssert: dieWith('"contains" is not an array assertion. Perhaps you wanted "has"?')
  };
};

const none = function (message: string = '[[missing value]]'): CombinedAssert {
  const compare = function (actual: string) {
    return actual === missingValuePlaceholder;
  };

  const strAssert = function (label: TestLabel, actual) {
    const c = compare(actual);
    assertOnBool(c, TestLabel.concat(label, '\nExpected ' + message), actual);
  };

  return {
    show: Fun.constant('none("' + message + '")'),
    strAssert,
    arrAssert: dieWith('"none" is not an array assertion. Perhaps you wanted "not"?')
  };
};

const has = function <T>(target: T): CombinedAssert {
  const compare = function (t: T) {
    return t === target;
  };

  const arrAssert = function (label: TestLabel, array: T[]) {
    const matching = Arr.exists(array, compare);
    assertOnBool(matching, TestLabel.concat(label, 'Expected array to contain: ' + target), array);
  };

  return {
    show: Fun.constant('has("' + target + '")'),
    strAssert: dieWith('"has" is not a string assertion. Perhaps you wanted "is"?'),
    arrAssert
  };
};

const hasPrefix = function (prefix: string): CombinedAssert {
  const compare = function (t: string) {
    return Strings.startsWith(t, prefix);
  };

  const arrAssert = function (label: TestLabel, array: string[]) {
    const matching = Arr.exists(array, compare);
    assertOnBool(matching, TestLabel.concat(label, 'Expected array to contain something with prefix: ' + prefix), array);
  };

  return {
    show: Fun.constant('hasPrefix("' + prefix + '")'),
    strAssert: dieWith('"hasPrefix" is not a string assertion. Perhaps you wanted "startsWith"?'),
    arrAssert
  };
};

const not = function <T>(target: T): CombinedAssert {
  const compare = function (actual: T) {
    return target !== actual;
  };

  const arrAssert = function (label: TestLabel, array: T[]) {
    // For not, all have to pass the comparison
    const matching = Arr.forall(array, compare);
    assertOnBool(matching, TestLabel.concat(label, 'Expected array to not contain: ' + target), array);
  };

  return {
    show: Fun.constant('not("' + target + '")'),
    strAssert: dieWith('"not" is not a string assertion. Perhaps you wanted "none"?'),
    arrAssert
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
