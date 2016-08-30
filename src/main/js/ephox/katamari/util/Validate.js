define(
  'ephox.katamari.util.Validate',

  [
    'global!Error',
    'global!Math',
    'global!isFinite',
    'global!isNaN',
    'global!parseFloat'
  ],

  function(Error, Math, isFinite, isNaN, parseFloat) {
    var vType = function(expectedType) {
      return function(name, value) {
        var t = typeof value;
        if (t !== expectedType) throw new Error(name + ' was not a ' + expectedType + '. Was: ' + value + ' (' + t + ')');
      };
    };

    var vString = vType('string');

    var vChar = function(name, value) {
      vString(name, value);
      var length = value.length;
      if (length !== 1) throw new Error(name + ' was not a single char. Was: ' + value);
    };

    var vNumber = vType('number');

    var vInt = function(name, value) {
      vNumber(name, value);
      if (value !== Math.abs(value)) throw new Error(name + ' was not an integer. Was: ' + value);
    };

    var pNum = function(value) {
      return !isNaN(parseFloat(value)) && isFinite(value);
    };

    var vNat = function(name, value) {
      vInt(name, value);
      if (value < 0) throw new Error(name + ' was not a natural number. Was: ' + value);
    };

    return {
      vString: vString,
      vChar: vChar,
      vInt: vInt,
      vNat: vNat,
      pNum: pNum
    };
  }
);