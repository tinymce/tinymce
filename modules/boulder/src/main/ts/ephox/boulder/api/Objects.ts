import { Arr, Merger, Result, Results } from '@ephox/katamari';
import * as ObjChanger from '../core/ObjChanger';
import * as ObjWriter from '../core/ObjWriter';

// Perhaps this level of indirection is unnecessary.
const narrow = <T extends Record<string, any>, F extends Array<keyof T>>(obj: T, fields: F): Pick<T, F[number]> => {
  return ObjChanger.narrow(obj, fields);
};

const exclude = <T extends Record<string, any>, F extends Array<keyof T>>(obj: T, fields: F): Omit<T, F[number]> => {
  return ObjChanger.exclude(obj, fields);
};

const wrap = <V>(key: string, value: V): {[key: string]: V} => {
  return ObjWriter.wrap(key, value);
};

const wrapAll = <K extends string | number, T>(keyvalues: Array<{ key: K; value: T }>): Record<K, T> => {
  return ObjWriter.wrapAll(keyvalues);
};

const indexOnKey = <T extends Record<string, any>, K extends keyof T>(array: T[], key: K): {[A in T[K]]: T} => {
  return ObjChanger.indexOnKey(array, key);
};

const mergeValues = <T>(values: T[], base: T) => {
  return values.length === 0 ? Result.value(base) : Result.value(
    Merger.deepMerge(
      base,
      Merger.merge.apply(undefined, values)
    )
    // Merger.deepMerge.apply(undefined, [ base ].concat(values))
  );
};

const mergeErrors = (errors: string[][]): Result<unknown, string[]> => {
  return Result.error(Arr.flatten(errors));
};

const consolidate = <T>(objs: Array<Result<T, string[]>>, base: T): Result <T, string> => {
  const partitions = Results.partition(objs);
  return partitions.errors.length > 0 ? mergeErrors(partitions.errors) : mergeValues(partitions.values, base);
};

export {
  narrow,
  exclude,
  wrap,
  wrapAll,
  indexOnKey,
  consolidate
};
