import { Arr, Option } from '@ephox/katamari';

const unique = <T> (xs: T[], eq: (a: T, b: T) => boolean) => {
  const result: T[] = [];
  Arr.each(xs, (x, i) => {
    if (i < xs.length - 1 && !eq(x, xs[i + 1])) {
      result.push(x);
    } else if (i === xs.length - 1) {
      result.push(x);
    }
  });
  return result;
};

const deduce = (xs: Option<number>[], index: number) => {
  if (index < 0 || index >= xs.length - 1) {
    return Option.none<number>();
  }

  const current = xs[index].fold(() => {
    const rest = Arr.reverse(xs.slice(0, index));
    return Arr.findMap(rest, (a, i) => a.map((aa) => ({ value: aa, delta: i + 1 })));
  }, (c) => Option.some({ value: c, delta: 0 }));

  const next = xs[index + 1].fold(() => {
    const rest = xs.slice(index + 1);
    return Arr.findMap(rest, (a, i) => a.map((aa) => ({ value: aa, delta: i + 1 })));
  }, (n) => Option.some({ value: n, delta: 1 }));

  return current.bind((c) => next.map((n) => {
    const extras = n.delta + c.delta;
    return Math.abs(n.value - c.value) / extras;
  }));
};

export { unique, deduce };
