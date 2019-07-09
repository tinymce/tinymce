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

const toStep = function <U extends any[]> (method: (...args: U) => void) {
  return function <T> (...args: U) {
    return Step.sync<T>(function () {
      method.apply(undefined, args);
    });
  };
};

const toChain = function <B, C> (method: (label: string, expected: B, actual: C) => void) {
  return function (label: string, expected: B) {
    return Chain.op<C>(function (actual: C) {
      method.call(undefined, label, expected, actual);
    });
  };
};

// Note, this requires changes to tunic
const textError = function (label: string, expected: string, actual: string) {
  const err = new Error(label);
  return ({
    diff: {
      expected,
      actual,
      comparison: Differ.htmlDiff(expected, actual)
    },
    label,
    stack: err.stack,
    name: 'HtmlAssertion',
    message: err.message
  });
};

const assertHtml = function (label: string, expected: string, actual: string) {
  if (expected !== actual) {
    throw textError(label, expected, actual);
  }
};

const assertStructure = function (label: string, expected: StructAssert, container: Element) {
  Logger.sync(label, function () {
    if (expected.type === 'advanced') {
      expected.doAssert(elementQueue([container], Option.none()));
    } else {
      expected.doAssert(container);
    }
  });
};

const assertHtmlStructure = function (label: string, expected: string, actual: string) {
  assertStructure(label, ApproxStructure.fromHtml(expected), Element.fromHtml(actual));
};

const assertHtmlStructure2 = function (label: string, expected: string, actual: Element) {
  assertStructure(label, ApproxStructure.fromHtml(expected), actual);
};

const assertPresence = function (label: string, expected: Record<string, number>, container: Element) {
  Obj.each(expected, function (num: number, selector: string) {
    const actual = UiFinder.findAllIn(container, selector).length;
    assertEq('Did not find ' + num + ' of ' + selector + ', found: ' + actual + '. Test: ' + label, num, actual);
  });
};

const assertDomEq = function (label: string, expected: Element, actual: Element) {
  assertEq(
    label + '\nExpected : ' + Truncate.getHtml(expected) + '\nActual: ' + Truncate.getHtml(actual),
    true,
    Compare.eq(expected, actual)
  );
};

const sAssertEq: <T, V> (label: string, expected: V, actual: V) => Step<T, T> = toStep(assertEq);
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
