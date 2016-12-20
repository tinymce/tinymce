define(
  'ephox.agar.api.Assertions',

  [
    'ephox.agar.alien.Truncate',
    'ephox.agar.api.Chain',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Step',
    'ephox.agar.api.UiFinder',
    'ephox.agar.assertions.Differ',
    'ephox.katamari.api.Obj',
    'ephox.sand.api.JSON',
    'ephox.sugar.api.dom.Compare',
    'global!Array',
    'global!Error',
    'global!window'
  ],

  function (Truncate, Chain, Logger, Step, UiFinder, Differ, Obj, Json, Compare, Array, Error, window) {
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

    var assertEq = function (label, a, b) {
      var stringify = function (v) {
        try {
          return Json.stringify(v);
        } catch (_) {
          return v;
        }
      };

      var extra = function () {
        return '.\n  Expected: ' + stringify(a) + '\n  Actual: ' + stringify(b);
      };

      if (window.assertEq) window.assertEq(a, b, label + extra());
      else if (window.assert && window.assert.eq) window.assert.eq(a, b, label + extra());
      else if (a !== b) throw new Error('[Equality]: ' + label + extra());
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

    return {
      assertHtml: assertHtml,
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