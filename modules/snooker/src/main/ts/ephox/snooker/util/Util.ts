import { Arr, Option } from '@ephox/katamari';

// Rename this module, and repeat should be in Arr.
const repeat = function <T>(repititions: number, f: (idx: number) => T) {
  const r: T[] = [];
  for (let i = 0; i < repititions; i++) {
    r.push(f(i));
  }
  return r;
};

const range = function (start: number, end: number) {
  const r: number[] = [];
  for (let i = start; i < end; i++) {
    r.push(i);
  }
  return r;
};

const unique = function <T>(xs: T[], eq: (a: T, b: T) => boolean) {
  const result: T[] = [];
  Arr.each(xs, function (x, i) {
    if (i < xs.length - 1 && !eq(x, xs[i + 1])) {
      result.push(x);
    } else if (i === xs.length - 1) {
      result.push(x);
    }
  });
  return result;
};

const deduce = function (xs: Option<number>[], index: number) {
  if (index < 0 || index >= xs.length - 1) {
    return Option.none<number>();
  }

  const current = xs[index].fold(function () {
    const rest = Arr.reverse(xs.slice(0, index));
    return Arr.findMap(rest, function (a, i) {
      return a.map(function (aa) {
        return { value: aa, delta: i + 1 };
      });
    });
  }, function (c) {
    return Option.some({ value: c, delta: 0 });
  });
  const next = xs[index + 1].fold(function () {
    const rest = xs.slice(index + 1);
    return Arr.findMap(rest, function (a, i) {
      return a.map(function (aa) {
        return { value: aa, delta: i + 1 };
      });
    });
  }, function (n) {
    return Option.some({ value: n, delta: 1 });
  });

  return current.bind(function (c) {
    return next.map(function (n) {
      const extras = n.delta + c.delta;
      return Math.abs(n.value - c.value) / extras;
    });
  });
};

export {
  repeat,
  range,
  unique,
  deduce
};
