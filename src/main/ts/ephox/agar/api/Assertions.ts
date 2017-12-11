import RawAssertions from './RawAssertions';
import Truncate from '../alien/Truncate';
import Chain from './Chain';
import Logger from './Logger';
import Step from './Step';
import UiFinder from './UiFinder';
import ApproxStructure from './ApproxStructure';
import Differ from '../assertions/Differ';
import { Obj } from '@ephox/katamari';
import { Compare } from '@ephox/sugar';
import { Element } from '@ephox/sugar';

var assertEq = RawAssertions.assertEq;

// Note, this requires changes to tunic
var textError = function (label, expected, actual) {
  var err = new Error(label);
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

var assertHtml = function (label, expected, actual) {
  if (expected !== actual) throw textError(label, expected, actual);
};

var assertHtmlStructure = function (label, expected, actual) {
  return assertStructure(label, ApproxStructure.fromHtml(expected), Element.fromHtml(actual));
};

var assertPresence = function (label, expected, container) {
  Obj.each(expected, function (num, selector) {
    var actual = UiFinder.findAllIn(container, selector).length;
    assertEq('Did not find ' + num + ' of ' + selector + ', found: ' + actual + '. Test: ' + label, num, actual);
  });
};

var assertStructure = function (label, expected, container) {
  Logger.sync(label, function () {
    expected.doAssert(container);
  });
};

var toStep = function (method) {
  return function (/* args */) {
    var args = arguments;
    return Step.sync(function () {
      var sArgs = Array.prototype.slice.call(args, 0);
      method.apply(undefined, sArgs);
    });
  };
};

var assertDomEq = function (label, expected, actual) {
  assertEq(
    label + '\nExpected : ' + Truncate.getHtml(expected) + '\nActual: ' + Truncate.getHtml(actual),
    true,
    Compare.eq(expected, actual)
  );
};

var sAssertEq = function (label, a, b) {
  return Step.sync(function () {
    assertEq(label, a, b);
  });
};

var cAssertEq = function (label, expected) {
  return Chain.op(function (actual) {
    assertEq(label, expected, actual);
  });
};

var cAssertHtml = function (label, expected) {
  return Chain.op(function (actual) {
    assertHtml(label, expected, actual);
  });
};

var cAssertDomEq = function (label, expected) {
  return Chain.op(function (actual) {
    assertDomEq(label, expected, actual);
  });
};

export default <any> {
  assertHtml: assertHtml,
  assertHtmlStructure: assertHtmlStructure,
  assertPresence: assertPresence,
  assertStructure: assertStructure,
  assertEq: assertEq,
  assertDomEq: assertDomEq,

  sAssertHtml: toStep(assertHtml),
  sAssertPresence: toStep(assertPresence),
  sAssertStructure: toStep(assertStructure),
  sAssertEq: sAssertEq,

  cAssertHtml: cAssertHtml,
  cAssertEq: cAssertEq,
  cAssertDomEq: cAssertDomEq
};