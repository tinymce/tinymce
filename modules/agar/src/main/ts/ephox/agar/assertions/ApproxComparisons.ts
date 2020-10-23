import { Assert, TestLabel } from '@ephox/bedrock-client';
import { Arr, Fun, Id, Strings } from '@ephox/katamari';
import { ArrayAssert, StringAssert } from './ApproxStructures';

const missingValuePlaceholder: string = Id.generate('missing');

const dieWith = (message: string): () => never => Fun.die(message);

const assertOnBool = (c: boolean, label: TestLabel, value: any): void => {
  const strValue = value === missingValuePlaceholder ? '{missing}' : value;
  Assert.eq(
    TestLabel.concat(label, () => ', Actual value: ' + JSON.stringify(strValue)),
    true,
    c
  );
};

export type CombinedAssert = StringAssert & ArrayAssert;

const is = (target: string): CombinedAssert => {
  const compare = (actual: string) => target === actual;

  const strAssert = (label: TestLabel, actual: string) => {
    const c = compare(actual);
    assertOnBool(c, TestLabel.concat(label, '\nExpected value: ' + JSON.stringify(target)), actual);
  };

  return {
    show: Fun.constant('is("' + target + '")'),
    strAssert,
    arrAssert: dieWith('"is" is not an array assertion. Perhaps you wanted "has"?')
  };
};

const startsWith = (target: string): CombinedAssert => {
  const compare = (actual: string) => Strings.startsWith(actual, target);

  const strAssert = (label: TestLabel, actual: string) => {
    const c = compare(actual);
    assertOnBool(c, TestLabel.concat(label, '\nExpected value: ' + 'startsWith(' + target + ')'), actual);
  };

  return {
    show: Fun.constant('startsWith("' + target + '")'),
    strAssert,
    arrAssert: dieWith('"startsWith" is not an array assertion. Perhaps you wanted "hasPrefix"?')
  };
};

const contains = (target: string): CombinedAssert => {
  const compare = (actual: string) => Strings.contains(actual, target);

  const strAssert = (label: TestLabel, actual: string) => {
    const c = compare(actual);
    assertOnBool(c, TestLabel.concat(label, '\nExpected value: ' + 'contains(' + target + ')'), actual);
  };

  return {
    show: Fun.constant('contains("' + target + '")'),
    strAssert,
    arrAssert: dieWith('"contains" is not an array assertion. Perhaps you wanted "has"?')
  };
};

const none = (message: string = '[[missing value]]'): CombinedAssert => {
  const compare = (actual: string) => actual === missingValuePlaceholder;

  const strAssert = (label: TestLabel, actual) => {
    const c = compare(actual);
    assertOnBool(c, TestLabel.concat(label, '\nExpected ' + message), actual);
  };

  return {
    show: Fun.constant('none("' + message + '")'),
    strAssert,
    arrAssert: dieWith('"none" is not an array assertion. Perhaps you wanted "not"?')
  };
};

const has = <T>(target: T): CombinedAssert => {
  const compare = (t: T) => t === target;

  const arrAssert = (label: TestLabel, array: T[]) => {
    const matching = Arr.exists(array, compare);
    assertOnBool(matching, TestLabel.concat(label, 'Expected array to contain: ' + target), array);
  };

  return {
    show: Fun.constant('has("' + target + '")'),
    strAssert: dieWith('"has" is not a string assertion. Perhaps you wanted "is"?'),
    arrAssert
  };
};

const hasPrefix = (prefix: string): CombinedAssert => {
  const compare = (t: string) => Strings.startsWith(t, prefix);

  const arrAssert = (label: TestLabel, array: string[]) => {
    const matching = Arr.exists(array, compare);
    assertOnBool(matching, TestLabel.concat(label, 'Expected array to contain something with prefix: ' + prefix), array);
  };

  return {
    show: Fun.constant('hasPrefix("' + prefix + '")'),
    strAssert: dieWith('"hasPrefix" is not a string assertion. Perhaps you wanted "startsWith"?'),
    arrAssert
  };
};

const not = <T>(target: T): CombinedAssert => {
  const compare = (actual: T) => target !== actual;

  const arrAssert = (label: TestLabel, array: T[]) => {
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

const missing: () => string = Fun.constant(missingValuePlaceholder);

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
