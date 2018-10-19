import { ResultCombine } from '../combine/ResultCombine';
import * as ObjChanger from '../core/ObjChanger';
import * as ObjReader from '../core/ObjReader';
import * as ObjWriter from '../core/ObjWriter';
import { Option, Result, Results, Merger, Fun, Arr } from '@ephox/katamari';

// Perhaps this level of indirection is unnecessary.
const narrow = function (obj: {}, fields: any[]): {} {
  return ObjChanger.narrow(obj, fields);
};

const exclude = function (obj: {}, fields: any[]): {} {
  return ObjChanger.exclude(obj, fields);
};

const readOpt = function <T>(key: string): ({}) => Option <T> {
  return ObjReader.readOpt(key);
};

const readOr = function <T>(key: string, fallback: T): ({}) => T {
  return ObjReader.readOr(key, fallback);
};

const readOptFrom = <O>(obj: {}, key: string): Option<O> => {
  return ObjReader.readOptFrom<O>(obj, key);
};

const wrap = function (key: string, value: {}): {} {
  return ObjWriter.wrap(key, value);
};

const wrapAll = function (keyvalues: Array<{key: string; value: any}>): {} {
  return ObjWriter.wrapAll(keyvalues);
};

const indexOnKey = function <T> (array: {[T: string]: any}[], key: string): {[T: string]: any} {
  return ObjChanger.indexOnKey(array, key);
};

const mergeValues = function (values, base) {
  return values.length === 0 ? Result.value(base) : Result.value(
    Merger.deepMerge(
      base,
      Merger.merge.apply(undefined, values)
    )
    // Merger.deepMerge.apply(undefined, [ base ].concat(values))
  );
};

const mergeErrors = function (errors) {
  return Fun.compose(Result.error, Arr.flatten)(errors);
};



const consolidate = function (objs, base: {}): Result <{}, string> {
  const partitions = Results.partition(objs);
  return partitions.errors.length > 0 ? mergeErrors(partitions.errors) : mergeValues(partitions.values, base);
};

const hasKey = function (obj: {}, key: string): boolean {
  return ObjReader.hasKey(obj, key);
};

export {
  narrow,
  exclude,
  readOpt,
  readOr,
  readOptFrom,
  wrap,
  wrapAll,
  indexOnKey,
  hasKey,
  consolidate
};