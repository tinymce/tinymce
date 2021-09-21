const getPrototypeOf = Object.getPrototypeOf;

const hasProto = (v: Object, predicate: (v: Object) => boolean, name: string): boolean => {
  if (predicate(v)) {
    return true;
  } else {
    // String-based fallback time
    const constructor = v.constructor;
    if (isNonNullable(constructor)) {
      return constructor.name === name;
    } else {
      // IE doesn't support the constructor API
      return getPrototypeOf(v).toString() === `[object ${name}]`;
    }
  }
};

const typeOf = (x: any): string => {
  const t = typeof x;
  if (x === null) {
    return 'null';
  } else if (t === 'object' && hasProto(x, (v) => Array.prototype.isPrototypeOf(v), 'Array')) {
    return 'array';
  } else if (t === 'object' && hasProto(x, (v) => String.prototype.isPrototypeOf(v), 'String')) {
    return 'string';
  } else {
    return t;
  }
};

const isType = <Yolo>(type: string) => (value: any): value is Yolo =>
  typeOf(value) === type;

const isSimpleType = <Yolo>(type: string) => (value: any): value is Yolo =>
  typeof value === type;

const eq = <T> (t: T) => (a: any): a is T =>
  t === a;

export const isString: (value: any) => value is string =
  isType('string');

export const isObject: (value: any) => value is Object =
  isType('object');

export const isPlainObject = (value: unknown): value is Object =>
  isObject(value) && hasProto(value, (v) => getPrototypeOf(v) === Object.prototype, 'Object');

export const isArray: (value: any) => value is Array<unknown> =
  isType('array');

export const isNull: (a: any) => a is null =
  eq(null);

export const isBoolean: (value: any) => value is boolean =
  isSimpleType<boolean>('boolean');

export const isUndefined: (a: any) => a is undefined =
  eq(undefined);

export const isNullable = (a: any): a is null | undefined =>
  a === null || a === undefined;

export const isNonNullable = <A> (a: A | null | undefined): a is NonNullable<A> =>
  !isNullable(a);

export const isFunction: (value: any) => value is Function =
  isSimpleType<Function>('function');

export const isNumber: (value: any) => value is number =
  isSimpleType<number>('number');

export const isArrayOf = <E>(value: any, pred: (x: any) => x is E): value is Array<E> => {
  if (isArray(value)) {
    for (let i = 0, len = value.length; i < len; ++i) {
      if (!(pred(value[i]))) {
        return false;
      }
    }
    return true;
  }
  return false;
};
