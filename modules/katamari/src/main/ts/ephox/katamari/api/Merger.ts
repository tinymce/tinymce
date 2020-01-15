import * as Type from './Type';

type MergeStrategy = (old: any, nu: any) => any;

type DeepMergeFunc = {
  <A, B>(a: A, b: B): A & B;
  <A, B, C>(a: A, b: B, c: C): A & B & C;
  <A, B, C, D>(a: A, b: B, c: C, d: D): A & B & C & D;
  <A, B, C, D, E>(a: A, b: B, c: C, d: D, e: E): A & B & C & D & E;
  <A, B, C, D, E, F>(a: A, b: B, c: C, d: D, e: E, f: F): A & B & C & D & E & F;
  (...objs: Array<Record<string, any>>): Record<string, any>;
};

type MergeOptional<A, B> = A extends undefined ? B : Exclude<B, undefined>;
type ShallowMerge<A, B> = ({
  [K in keyof A]: K extends keyof B ? MergeOptional<A[K], B[K]> : A[K]
} & B);

type ShallowMergeFunc = {
  <A, B>(a: A, b: B): ShallowMerge<A, B>;
  <A, B, C>(a: A, b: B, c: C): ShallowMerge<ShallowMerge<A, B>, C>;
  <A, B, C, D>(a: A, b: B, c: C, d: D): ShallowMerge<ShallowMerge<ShallowMerge<A, B>, C>, D>;
  <A, B, C, D, E>(a: A, b: B, c: C, d: D, e: E): ShallowMerge<ShallowMerge<ShallowMerge<ShallowMerge<A, B>, C>, D>, E>;
  <A, B, C, D, E, F>(a: A, b: B, c: C, d: D, e: E, f: F): ShallowMerge<ShallowMerge<ShallowMerge<ShallowMerge<ShallowMerge<A, B>, C>, D>, E>, F>;
  (...objs: Array<Record<string, any>>): Record<string, any>;
};

const hasOwnProperty = Object.prototype.hasOwnProperty;

const shallow = function (old: Record<string, any>, nu: Record<string, any>) {
  return nu;
};

const deep = function (old: Record<string, any>, nu: Record<string, any>) {
  const bothObjects = Type.isObject(old) && Type.isObject(nu);
  return bothObjects ? deepMerge(old, nu) : nu;
};

const baseMerge = function (merger: MergeStrategy): (...objs: Array<Record<string, any>>) => any {
  return function () {
    // Don't use array slice(arguments), makes the whole function unoptimisable on Chrome
    const objects = new Array(arguments.length);
    for (let i = 0; i < objects.length; i++) {
      objects[i] = arguments[i];
    }

    if (objects.length === 0) {
      throw new Error('Can\'t merge zero objects');
    }

    const ret: Record<string, any> = {};
    for (let j = 0; j < objects.length; j++) {
      const curObject = objects[j];
      for (const key in curObject) {
        if (hasOwnProperty.call(curObject, key)) {
          ret[key] = merger(ret[key], curObject[key]);
        }
      }
    }
    return ret;
  };
};

export const deepMerge: DeepMergeFunc = baseMerge(deep);
export const merge: ShallowMergeFunc = baseMerge(shallow);
