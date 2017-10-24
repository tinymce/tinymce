define(
  'ephox.agar.api.Assertions',

  [
    'ephox.agar.api.RawAssertions',
    'ephox.agar.alien.Truncate',
    'ephox.agar.api.Chain',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Step',
    'ephox.agar.api.UiFinder',
    'ephox.agar.api.ApproxStructure',
    'ephox.agar.assertions.Differ',
    'ephox.katamari.api.Obj',
    'ephox.sugar.api.dom.Compare',
    'ephox.sugar.api.node.Element',
    'global!Array',
    'global!Error',
    'global!window'
  ],
  function (RawAssertions, Truncate, Chain, Logger, Step, UiFinder, ApproxStructure, Differ, Obj, Compare, Element, Array, Error, window) {

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
        assert.eq(num, actual, 'Did not find ' + num + ' of ' + selector + ', found: ' + actual + '. Test: ' + label);
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
      assert.eq(
        true,
        Compare.eq(expected, actual),
        label + '\nExpected : ' + Truncate.getHtml(expected) + '\nActual: ' + Truncate.getHtml(actual)
      );
    };

    var assertEq = RawAssertions.assertEq;

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

    return {
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
  }
);