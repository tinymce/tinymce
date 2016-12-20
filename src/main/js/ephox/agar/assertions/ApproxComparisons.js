define(
  'ephox.agar.assertions.ApproxComparisons',

  [
    'ephox.agar.api.Assertions',
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Id',
    'ephox.sand.api.JSON',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Strings'
  ],

  function (Assertions, Arr, Id, Json, Fun, Strings) {
    var missing = Id.generate('missing');

    var dieWith = function (message) {
      return Fun.die(message);
    };

    var assertOnBool = function (c, label, value) {
      var strValue = value === missing ? '{missing}' : value;
      Assertions.assertEq(
        label + ', Actual value: ' + Json.stringify(strValue),
        true,
        c
      );      
    };

    var is = function (target) {
      var compare = function (actual) {
        return target === actual;
      };

      var strAssert = function (label, actual) {
        var c = compare(actual);
        assertOnBool(c, label + '\nExpected value: ' + target, actual);
      };

      return {
        show: Fun.constant('is("' + target + '")'),
        strAssert: strAssert,
        arrAssert: dieWith('"is" is not an array assertion. Perhaps you wanted "has"?')
      };
    };

    var startsWith = function (target) {
      var compare = function (actual) {
        return Strings.startsWith(actual, target);
      };

      var strAssert = function (label, actual) {
        var c = compare(actual);
        assertOnBool(c, label + '\nExpected value: ' +  'startsWith(' + target + ')', actual);
      };

      return {
        show: Fun.constant('startsWith("' + target + '")'),
        strAssert: strAssert,
        arrAssert: dieWith('"startsWith" is not an array assertion. Perhaps you wanted "hasPrefix"?')
      };
    };

    var none = function (message) {
      var compare = function (actual) {
        return actual === missing;
      };

      var strAssert = function (label, actual) {
        var c = compare(actual);
        assertOnBool(c, label + '\nExpected ' + message, actual);
      };

      return {
        show: Fun.constant('none("' + message + '")'),
        strAssert: strAssert,
        arrAssert: dieWith('"none" is not an array assertion. Perhaps you wanted "not"?')
      };
    };

    var has = function (target) {
      var compare = function (t) {
        return t === target;
      };

      var arrAssert = function (label, array) {
        var matching = Arr.exists(array, compare);
        assertOnBool(matching, label + 'Expected array to contain: ' + target, array);
      };

      return {
        show: Fun.constant('has("' + target + '")'),
        strAssert: dieWith('"has" is not a string assertion. Perhaps you wanted "is"?'),
        arrAssert: arrAssert
      };
    };

    var hasPrefix = function (prefix) {
      var compare = function (t) {
        return Strings.startsWith(t, prefix);
      };

      var arrAssert = function (label, array) {
        var matching = Arr.exists(array, compare);
        assertOnBool(matching, label + 'Expected array to contain something with prefix: ' + prefix, array);
      };

      return {
        show: Fun.constant('hasPrefix("' + prefix + '")'),
        strAssert: dieWith('"hasPrefix" is not a string assertion. Perhaps you wanted "startsWith"?'),
        arrAssert: arrAssert
      };
    };

    var not = function (target) {
      var compare = function (actual) {
        return target !== actual;
      };

      var arrAssert = function (label, array) {
        // For not, all have to pass the comparison
        var matching = Arr.forall(array, compare);
        assertOnBool(matching, label + 'Expected array to not contain: ' + target, array);
      };

      return {
        show: Fun.constant('not("' + target + '")'),
        strAssert: dieWith('"not" is not a string assertion. Perhaps you wanted "none"?'),
        arrAssert: arrAssert
      };
    };

    return {
      is: is,
      startsWith: startsWith,
      none: none,

      has: has,
      hasPrefix: hasPrefix,
      not: not,

      missing: Fun.constant(missing)
    };
  }
);