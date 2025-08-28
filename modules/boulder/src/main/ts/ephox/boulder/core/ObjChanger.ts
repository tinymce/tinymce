import { Arr, Obj } from '@ephox/katamari';

const narrow = <T extends Record<string, any>, F extends Array<keyof T>>(obj: T, fields: F): Pick<T, F[number]> => {
  const r = { } as Pick<T, F[number]>;
  Arr.each(fields, (field) => {
    // TODO: Investigate if the undefined check is relied upon by something
    if (obj[field] !== undefined && Obj.has(obj, field)) {
      r[field] = obj[field];
    }
  });

  return r;
};

const indexOnKey = <T extends Record<string, any>, K extends keyof T>(array: ArrayLike<T>, key: K): { [A in T[K]]: T } => {
  const obj = { } as { [A in T[K]]: T };
  Arr.each(array, (a) => {
    // FIX: Work out what to do here.
    const keyValue: string | number = a[key];
    obj[keyValue] = a;
  });
  return obj;
};

const exclude = <T extends Record<string, any>, F extends Array<keyof T>>(obj: T, fields: F): Omit<T, F[number]> => {
  const r = { } as Omit<T, F[number]>;
  Obj.each(obj, (v, k) => {
    if (!Arr.contains(fields, k)) {
      r[k as string] = v;
    }
  });
  return r;
};

export {
  narrow,
  exclude,
  indexOnKey
};
