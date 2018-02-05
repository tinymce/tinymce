import { Arr } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import { Options } from '@ephox/katamari';

// Rename this module, and repeat should be in Arr.
var repeat = function(repititions, f) {
  var r = [];
  for (var i = 0; i < repititions; i++) {
    r.push(f(i));
  }
  return r;
};

var range = function (start, end) {
  var r = [];
  for (var i = start; i < end; i++) {
    r.push(i);
  }
  return r;
};

var unique = function (xs, comparator) {
  var result = [];
  Arr.each(xs, function (x, i) {
    if (i < xs.length - 1 && !comparator(x, xs[i + 1])) {
      result.push(x);
    } else if (i === xs.length - 1) {
      result.push(x);
    }
  });
  return result;
};

var deduce = function (xs, index) {
  if (index < 0 || index >= xs.length - 1) return Option.none();

  var current = xs[index].fold(function () {
    var rest = Arr.reverse(xs.slice(0, index));
    return Options.findMap(rest, function (a: any, i) {
      return a.map(function (aa) {
        return { value: aa, delta: i+1 };
      });
    });
  }, function (c) {
    return Option.some({ value: c, delta: 0 });
  });
  var next = xs[index + 1].fold(function () {
    var rest = xs.slice(index + 1);
    return Options.findMap(rest, function (a: any, i) {
      return a.map(function (aa) {
        return { value: aa, delta: i + 1 };
      });
    });
  }, function (n) {
    return Option.some({ value: n, delta: 1 });
  });

  return current.bind(function (c) {
    return next.map(function (n) {
      var extras = n.delta + c.delta;
      return Math.abs(n.value - c.value) / extras;
    });
  });
};

export default <any> {
  repeat: repeat,
  range: range,
  unique: unique,
  deduce: deduce
};