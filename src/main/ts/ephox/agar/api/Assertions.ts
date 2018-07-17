import { Obj } from '@ephox/katamari';
import { Compare, Element } from '@ephox/sugar';

import * as Truncate from '../alien/Truncate';
import { StructAssert } from '../assertions/ApproxStructures';
import * as Differ from '../assertions/Differ';
import { RunFn } from '../pipe/Pipe';
import * as ApproxStructure from './ApproxStructure';
import { Chain } from './Chain';
import * as Logger from './Logger';
import { assertEq } from './RawAssertions';
import * as Step from './Step';
import * as UiFinder from './UiFinder';

// Note, this requires changes to tunic
const textError = function (label: string, expected: string, actual: string) {
  const err = new Error(label);
  return ({
    diff: {
      expected: expected,
      actual: actual,
      comparison: Differ.htmlDiff(expected, actual)
    },
    label: label,
    stack: err.stack,
    name: 'HtmlAssertion',
    message: err.message
  });
};

const assertHtml = function (label: string, expected: string, actual: string) {
  if (expected !== actual) throw textError(label, expected, actual);
};

const assertHtmlStructure = function (label: string, expected: string, actual: string) {
  assertStructure(label, ApproxStructure.fromHtml(expected), Element.fromHtml(actual));
};

const assertPresence = function (label: string, expected: Record<string, number>, container: Element) {
  Obj.each(expected, function (num: number, selector: string) {
    const actual = UiFinder.findAllIn(container, selector).length;
    assertEq('Did not find ' + num + ' of ' + selector + ', found: ' + actual + '. Test: ' + label, num, actual);
  });
};

const assertStructure = function (label: string, expected: StructAssert, container: Element) {
  Logger.sync(label, function () {
    expected.doAssert(container);
  });
};

const toStep = function (method: Function) {
  return function (...args: any[]) {
    return Step.sync<any>(function () {
      method.apply(undefined, args);
    });
  };
};

const assertDomEq = function (label: string, expected: Element, actual: Element) {
  assertEq(
    label + '\nExpected : ' + Truncate.getHtml(expected) + '\nActual: ' + Truncate.getHtml(actual),
    true,
    Compare.eq(expected, actual)
  );
};

const sAssertEq = function <T, V>(label: string, a: V, b: V) {
  return Step.sync<T>(function () {
    assertEq(label, a, b);
  });
};

const cAssertEq = function <T>(label: string, expected: T) {
  return Chain.op(function (actual: T) {
    assertEq(label, expected, actual);
  });
};

const cAssertHtml = function (label: string, expected: string) {
  return Chain.op(function (actual: string) {
    assertHtml(label, expected, actual);
  });
};

const cAssertDomEq = function (label: string, expected: Element) {
  return Chain.op(function (actual: Element) {
    assertDomEq(label, expected, actual);
  });
};

const sAssertHtml: <T> (label: string, expected: string, actual: string) => RunFn<T, T> = toStep(assertHtml);
const sAssertPresence: <T> (label: string, expected: Record<string, number>, container: Element) => RunFn<T, T> = toStep(assertPresence);
const sAssertStructure: <T> (label: string, expected: StructAssert, container: Element) => RunFn<T, T> = toStep(assertStructure);

export {
  assertHtml,
  assertHtmlStructure,
  assertPresence,
  assertStructure,
  assertEq,
  assertDomEq,

  sAssertHtml,
  sAssertPresence,
  sAssertStructure,
  sAssertEq,

  cAssertHtml,
  cAssertEq,
  cAssertDomEq
};