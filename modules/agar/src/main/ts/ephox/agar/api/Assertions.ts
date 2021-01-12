import { Assert, TestError, TestLabel } from '@ephox/bedrock-client';
import { Obj, Optional } from '@ephox/katamari';
import { Compare, SugarElement, Truncate } from '@ephox/sugar';

import { elementQueue, StructAssert } from '../assertions/ApproxStructures';
import * as Differ from '../assertions/Differ';
import * as ApproxStructure from './ApproxStructure';
import { Chain } from './Chain';
import * as Logger from './Logger';
import { Step } from './Step';
import * as UiFinder from './UiFinder';

const toStep = <U extends any[]>(method: (...args: U) => void) =>
  <T>(...args: U) => Step.sync<T>(() => {
    method.apply(undefined, args);
  });

const toChain = <B, C>(method: (label: TestLabel, expected: B, actual: C) => void) =>
  (label: string, expected: B): Chain<C, C> =>
    Chain.op<C>((actual: C) => {
      method.call(undefined, label, expected, actual);
    });

const textError = (label: string, expected: string, actual: string): TestError.HtmlDiffAssertionError => {
  const err: Partial<TestError.HtmlDiffAssertionError> = new Error(label);
  err.diff = {
    expected,
    actual,
    comparison: Differ.htmlDiff(expected, actual)
  };
  err.label = label;
  err.name = 'HtmlAssertion';

  return err as TestError.HtmlDiffAssertionError;
};

const assertHtml = (label: TestLabel, expected: string, actual: string): void => {
  if (expected !== actual) {
    throw textError(TestLabel.asString(label), expected, actual);
  }
};

const assertStructure = (label: TestLabel, expected: StructAssert, container: SugarElement<any>): void => {
  Logger.sync(label, () => {
    if (expected.type === 'advanced') {
      expected.doAssert(elementQueue([ container ], Optional.none()));
    } else {
      expected.doAssert(container);
    }
  });
};

const assertHtmlStructure = (label: TestLabel, expected: string, actual: string): void => {
  assertStructure(label, ApproxStructure.fromHtml(expected), SugarElement.fromHtml(actual));
};

const assertHtmlStructure2 = (label: TestLabel, expected: string, actual: SugarElement<any>): void => {
  assertStructure(label, ApproxStructure.fromHtml(expected), actual);
};

const assertPresence = (label: TestLabel, expected: Record<string, number>, container: SugarElement<any>): void => {
  Obj.each(expected, (num: number, selector: string) => {
    const actual = UiFinder.findAllIn(container, selector).length;
    Assert.eq(TestLabel.concat('Did not find ' + num + ' of ' + selector + ', found: ' + actual + '. Test: ', label), num, actual);
  });
};

const assertEq = Assert.eq;

const assertDomEq = (label: TestLabel, expected: SugarElement<any>, actual: SugarElement<any>): void => {
  Assert.eq(
    TestLabel.concat(label, () => '\nExpected : ' + Truncate.getHtml(expected) + '\nActual: ' + Truncate.getHtml(actual)),
    true,
    Compare.eq(expected, actual)
  );
};

const sAssertEq: <T, V> (label: TestLabel, expected: V, actual: V) => Step<T, T> = toStep(Assert.eq);
const sAssertHtml = toStep(assertHtml);
const sAssertPresence = toStep(assertPresence);
const sAssertStructure = toStep(assertStructure);

const cAssertEq: <T> (label: string, expected: T) => Chain<T, T> = toChain(Assert.eq);
const cAssertDomEq = toChain(assertDomEq);
const cAssertHtml = toChain(assertHtml);
const cAssertPresence = toChain(assertPresence);
const cAssertHtmlStructure = toChain(assertHtmlStructure2);
const cAssertStructure = toChain(assertStructure);

export {
  assertEq,
  assertDomEq,
  assertHtml,
  assertPresence,
  assertHtmlStructure,
  assertStructure,

  sAssertEq,
  sAssertHtml,
  sAssertPresence,
  sAssertStructure,

  cAssertEq,
  cAssertDomEq,
  cAssertHtml,
  cAssertPresence,
  cAssertHtmlStructure,
  cAssertStructure
};
