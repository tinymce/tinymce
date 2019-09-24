import { Obj, Option } from '@ephox/katamari';
import { Compare, Element } from '@ephox/sugar';

import * as Truncate from '../alien/Truncate';
import { StructAssert, elementQueue } from '../assertions/ApproxStructures';
import * as Differ from '../assertions/Differ';
import * as ApproxStructure from './ApproxStructure';
import { Chain } from './Chain';
import * as Logger from './Logger';
import { assertEq } from './RawAssertions';
import { Step } from './Step';
import * as UiFinder from './UiFinder';
import { TestLabel, UnitTest } from '@ephox/bedrock';

const toStep = function <U extends any[]> (method: (...args: U) => void) {
  return function <T> (...args: U) {
    return Step.sync<T>(function () {
      method.apply(undefined, args);
    });
  };
};

const toChain = function <B, C> (method: (label: TestLabel, expected: B, actual: C) => void) {
  return function (label: string, expected: B) {
    return Chain.op<C>(function (actual: C) {
      method.call(undefined, label, expected, actual);
    });
  };
};

const textError = function (label: string, expected: string, actual: string): UnitTest.HtmlDiffError {
  const err: Partial<UnitTest.HtmlDiffError> = new Error(label);
  err.diff = {
    expected,
    actual,
    comparison: Differ.htmlDiff(expected, actual)
  };
  err.label = label;
  err.name = 'HtmlAssertion';

  return err as UnitTest.HtmlDiffError;
};

const assertHtml = function (label: TestLabel, expected: string, actual: string) {
  if (expected !== actual) {
    throw textError(TestLabel.asString(label), expected, actual);
  }
};

const assertStructure = function (label: TestLabel, expected: StructAssert, container: Element) {
  Logger.sync(label, function () {
    if (expected.type === 'advanced') {
      expected.doAssert(elementQueue([container], Option.none()));
    } else {
      expected.doAssert(container);
    }
  });
};

const assertHtmlStructure = function (label: TestLabel, expected: string, actual: string) {
  assertStructure(label, ApproxStructure.fromHtml(expected), Element.fromHtml(actual));
};

const assertHtmlStructure2 = function (label: TestLabel, expected: string, actual: Element) {
  assertStructure(label, ApproxStructure.fromHtml(expected), actual);
};

const assertPresence = function (label: TestLabel, expected: Record<string, number>, container: Element) {
  Obj.each(expected, function (num: number, selector: string) {
    const actual = UiFinder.findAllIn(container, selector).length;
    assertEq(TestLabel.concat('Did not find ' + num + ' of ' + selector + ', found: ' + actual + '. Test: ', label), num, actual);
  });
};

const assertDomEq = function (label: TestLabel, expected: Element, actual: Element) {
  assertEq(
    TestLabel.concat(label, () => '\nExpected : ' + Truncate.getHtml(expected) + '\nActual: ' + Truncate.getHtml(actual)),
    true,
    Compare.eq(expected, actual)
  );
};

const sAssertEq: <T, V> (label: TestLabel, expected: V, actual: V) => Step<T, T> = toStep(assertEq);
const sAssertHtml = toStep(assertHtml);
const sAssertPresence = toStep(assertPresence);
const sAssertStructure = toStep(assertStructure);

const cAssertEq: <T> (label: string, expected: T) => Chain<T, T> = toChain(assertEq);
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
