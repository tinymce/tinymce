import { Arr } from '@ephox/katamari';
import { Obj } from '@ephox/katamari';

var trueType = function (x) {
  var t = typeof x;
  if (t === 'object' && Array.prototype.isPrototypeOf(x))
    return 'array';
  if (x === null)
    return 'null';
  return t;
};

var pass = function () {
  return { eq: true };
};

var fail = function (why) {
  return { eq: false, why: why };
};

var failCompare = function (x, y, prefix) {
  var prefix_ = prefix || 'Values were different';
  return fail(prefix_ + ': [' + String(x) + '] vs [' + String(y) + ']');
};

var isEquatableType = function (x) {
  return Arr.contains([ 'undefined', 'boolean', 'number', 'string', 'function', 'xml', 'null' ], x);
};

var compareArrays = function (x, y) {
  if (x.length !== y.length)
    return failCompare(x.length, y.length, 'Array lengths were different');

  for (var i = 0; i < x.length; i++) {
    var result = doCompare(x[i], y[i]);
    if (!result.eq)
      return fail('Array elements ' + i + ' were different: ' + result.why);
  }
  return pass();
};

var sortArray = function (x) {
  var y = x.slice();
  y.sort();
  return y;
};

var sortedKeys = function (o) {
  return sortArray(Obj.keys(o));
};

var compareObjects = function (x, y) {
  var constructorX = x.constructor;
  var constructorY = y.constructor;
  if (constructorX !== constructorY)
    return failCompare(constructorX, constructorY, 'Constructors were different');

  var keysX = sortedKeys(x);
  var keysY = sortedKeys(y);

  var keysResult = compareArrays(keysX, keysY);
  if (!keysResult.eq)
    return failCompare(JSON.stringify(keysX), JSON.stringify(keysY), 'Object keys were different');

  for (var i in x) {
    if (x.hasOwnProperty(i)) {
      var xValue = x[i];
      var yValue = y[i];
      var valueResult = doCompare(xValue, yValue);
      if (!valueResult.eq)
        return fail('Objects were different for key: [' + i + ']: ' + valueResult.why);
    }
  }
  return pass();
};

var doCompare = function (x, y) {
  var typeX = trueType(x);
  var typeY = trueType(y);

  if (typeX !== typeY) return failCompare(typeX, typeY, 'Types were different');

  if (isEquatableType(typeX)) {
    if (x !== y) return failCompare(x, y);

  } else if (x == null) {
    if (y !== null) return failCompare(x, y);

  } else if (typeX === 'array') {
    var arrayResult = compareArrays(x, y);
    if (!arrayResult.eq) return arrayResult;

  } else if (typeX === 'object') {
    var objectResult = compareObjects(x, y);
    if (!objectResult.eq) return objectResult;
  }
  return pass();
};

var compare = function (x, y) {
  var result = doCompare(x, y);
  var bar = '-----------------------------------------------------------------------';

  return {
    eq: result.eq,
    why: result.why + '\n' + bar + '\n' + JSON.stringify(x) + '\n' + bar + '\n' + JSON.stringify(y) + '\n' + bar + '\n'
  };
};

export default <any> {
  compare: compare
};