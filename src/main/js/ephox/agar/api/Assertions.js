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
    'ephox.katamari.api.Obj',
    'ephox.sugar.api.dom.Compare',
    'ephox.sugar.api.node.Element',
    'global!Array',
    'global!Error',
    'global!window'
  ],

  function (RawAssertions, Truncate, Chain, Logger, Step, UiFinder, ApproxStructure, Obj, Compare, Element, Array, Error, window) {

    var assertHtml = function (label, expected, actual) {
      var wrapHtml = function (html) {
        return '<div>' + html + '</div>'; // make sure that there's a single root element
      };
      return assertStructure(label, ApproxStructure.fromHtml(wrapHtml(expected)), Element.fromHtml(wrapHtml(actual)));
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

    var assertEq = RawAssertions.windowAssertEq;

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