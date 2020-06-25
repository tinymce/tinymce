const typeOf = (x: any): string => {
  const t = typeof x;
  if (x === null) {
    return 'null';
  } else if (t === 'object' && (Array.prototype.isPrototypeOf(x) || x.constructor && x.constructor.name === 'Array')) {
    return 'array';
  } else if (t === 'object' && (String.prototype.isPrototypeOf(x) || x.constructor && x.constructor.name === 'String')) {
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

export const isArray: (value: any) => value is Array<unknown> =
  isType('array');

export const isNull: (a: any) => a is null =
  eq(null);

export const isBoolean: (value: any) => value is boolean =
  isSimpleType<boolean>('boolean');

export const isUndefined: (a: any) => a is undefined =
  eq(undefined);

export const isNullable = (a: any): boolean =>
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
