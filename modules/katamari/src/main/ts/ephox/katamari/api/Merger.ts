import * as Obj from './Obj';
import * as Type from './Type';

type MergeStrategy = (old: any, nu: any) => any;

interface DeepMergeFunc {
  <A, B>(a: A, b: B): A & B;
  <A, B, C>(a: A, b: B, c: C): A & B & C;
  <A, B, C, D>(a: A, b: B, c: C, d: D): A & B & C & D;
  <A, B, C, D, E>(a: A, b: B, c: C, d: D, e: E): A & B & C & D & E;
  <A, B, C, D, E, F>(a: A, b: B, c: C, d: D, e: E, f: F): A & B & C & D & E & F;
  (...objs: Array<Record<string, any>>): Record<string, any>;
}

type MergeOptional<A, B> = A extends undefined ? B : Exclude<B, undefined>;
type ShallowMerge<A, B> = ({
  [K in keyof A]: K extends keyof B ? MergeOptional<A[K], B[K]> : A[K]
} & B);

interface ShallowMergeFunc {
  <A, B>(a: A, b: B): ShallowMerge<A, B>;
  <A, B, C>(a: A, b: B, c: C): ShallowMerge<ShallowMerge<A, B>, C>;
  <A, B, C, D>(a: A, b: B, c: C, d: D): ShallowMerge<ShallowMerge<ShallowMerge<A, B>, C>, D>;
  <A, B, C, D, E>(a: A, b: B, c: C, d: D, e: E): ShallowMerge<ShallowMerge<ShallowMerge<ShallowMerge<A, B>, C>, D>, E>;
  <A, B, C, D, E, F>(a: A, b: B, c: C, d: D, e: E, f: F): ShallowMerge<ShallowMerge<ShallowMerge<ShallowMerge<ShallowMerge<A, B>, C>, D>, E>, F>;
  (...objs: Array<Record<string, any>>): Record<string, any>;
}

const shallow = (old: Record<string, any>, nu: Record<string, any>) => {
  return nu;
};

const deep = (old: Record<string, any>, nu: Record<string, any>) => {
  const bothObjects = Type.isPlainObject(old) && Type.isPlainObject(nu);
  return bothObjects ? deepMerge(old, nu) : nu;
};

const baseMerge = (merger: MergeStrategy): (...objs: Array<Record<string, any>>) => any => {
  return (...objects: any[]) => {
    if (objects.length === 0) {
      throw new Error(`Can't merge zero objects`);
    }

    const ret: Record<string, any> = {};
    for (let j = 0; j < objects.length; j++) {
      const curObject = objects[j];
      for (const key in curObject) {
        if (Obj.has(curObject, key)) {
          ret[key] = merger(ret[key], curObject[key]);
        }
      }
    }
    return ret;
  };
};

export const deepMerge: DeepMergeFunc = baseMerge(deep);
export const merge: ShallowMergeFunc = baseMerge(shallow);
