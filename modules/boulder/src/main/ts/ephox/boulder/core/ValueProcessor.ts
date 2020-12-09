import { Adt, Arr, Fun, Merger, Obj, Optional, Thunk, Type } from '@ephox/katamari';
import { SimpleResult, SimpleResultType } from '../alien/SimpleResult';

import * as FieldPresence from '../api/FieldPresence';
import * as Objects from '../api/Objects';
import { ResultCombine } from '../combine/ResultCombine';
import * as ObjWriter from './ObjWriter';
import * as SchemaError from './SchemaError';

type SchemaError = SchemaError.SchemaError;

// TODO: Handle the fact that strength shouldn't be pushed outside this project.
export type Strength = (res: any) => any;
export type ValueValidator = (a, strength?: Strength) => SimpleResult<string, any>;
export type PropExtractor = (path: string[], strength: Strength, val: any) => SimpleResult<SchemaError[], any>;
export type ValueExtractor = (label: string, prop: Processor, strength: Strength, obj: any) => SimpleResult<SchemaError[], string>;
export interface Processor {
  extract: PropExtractor;
  toString: () => string;
}

export type FieldValueProcessor<T> = (key: string, okey: string, presence: FieldPresence.FieldPresenceAdt, prop: Processor) => T;
export type StateValueProcessor<T> = (okey: string, instantiator: (obj: any) => Optional<unknown>) => T;

export interface ValueProcessorAdt {
  fold: <T>(
    field: FieldValueProcessor<T>,
    state: StateValueProcessor<T>
  ) => T;
  match: <T>(branches: {
    field: FieldValueProcessor<T>;
    state: StateValueProcessor<T>;
  }) => T;
  log: (label: string) => void;
}
export type FieldProcessorAdt = ValueProcessorAdt;

export interface ValueProcessor {
  field: FieldValueProcessor<ValueProcessorAdt>;
  state: StateValueProcessor<ValueProcessorAdt>;
}

// data ValueAdt = Field fields | state
const adt: ValueProcessor = Adt.generate([
  { field: [ 'key', 'okey', 'presence', 'prop' ] },
  { state: [ 'okey', 'instantiator' ] }
]);

const output = function (okey: string, value: any): ValueProcessorAdt {
  return adt.state(okey, Fun.constant(value));
};

const snapshot = function (okey: string): ValueProcessorAdt {
  return adt.state(okey, Fun.identity);
};

const strictAccess = function <T> (path: string[], obj: Record<string, T>, key: string): SimpleResult<SchemaError[], T> {
  // In strict mode, if it undefined, it is an error.
  return Obj.get(obj, key).fold<SimpleResult<SchemaError[], any>>(function () {
    return SchemaError.missingStrict(path, key, obj);
  }, SimpleResult.svalue);
};

const fallbackAccess = function <T> (obj: Record<string, T>, key: string, fallbackThunk: (obj: Record<string, T>) => T): SimpleResult<SchemaError[], T> {
  const v = Obj.get(obj, key).fold(function () {
    return fallbackThunk(obj);
  }, Fun.identity);
  return SimpleResult.svalue(v);
};

const optionAccess = function <T> (obj: Record<string, T>, key: string): SimpleResult<SchemaError[], Optional<T>> {
  return SimpleResult.svalue(Obj.get(obj, key));
};

const optionDefaultedAccess = function <T> (obj: Record<string, T | true>, key: string, fallback: (obj: Record<string, T | true>) => T): SimpleResult<SchemaError[], Optional<T>> {
  const opt = Obj.get(obj, key).map(function (val) {
    return val === true ? fallback(obj) : val;
  });
  return SimpleResult.svalue(opt);
};

const cExtractOne = function <T> (path: string[], obj: Record<string, T>, field: FieldProcessorAdt, strength: Strength): SimpleResult<SchemaError[], T> {
  return field.fold(
    function (key, okey, presence, prop) {
      const bundle = function (av: any): SimpleResult<SchemaError[], any> {
        const result = prop.extract(path.concat([ key ]), strength, av);
        return SimpleResult.map(result, (res) => ObjWriter.wrap(okey, strength(res)));
      };

      const bundleAsOption = function (optValue: Optional<any>): SimpleResult<SchemaError[], Record<string, Optional<any>>> {
        return optValue.fold(function () {
          const outcome = ObjWriter.wrap(okey, strength(Optional.none()));
          return SimpleResult.svalue(outcome);
        }, function (ov) {
          const result: SimpleResult<any, any> = prop.extract(path.concat([ key ]), strength, ov);
          return SimpleResult.map(result, function (res) {
            return ObjWriter.wrap(okey, strength(Optional.some(res)));
          });
        });
      };

      return (function () {
        return presence.fold(function () {
          return SimpleResult.bind(
            strictAccess(path, obj, key),
            bundle
          );
        }, function (fallbackThunk) {
          return SimpleResult.bind(
            fallbackAccess(obj, key, fallbackThunk),
            bundle
          );
        }, function () {
          return SimpleResult.bind(
            optionAccess(obj, key),
            bundleAsOption
          );
        }, function (fallbackThunk) {
          // Defaulted option access
          return SimpleResult.bind(
            optionDefaultedAccess(obj, key, fallbackThunk),
            bundleAsOption
          );
        }, function (baseThunk) {
          const base = baseThunk(obj);
          const result = SimpleResult.map(
            fallbackAccess(obj, key, Fun.constant({})),
            (v) => Merger.deepMerge(base, v)
          );
          return SimpleResult.bind(result, bundle);
        });
      })();
    },
    function (okey, instantiator) {
      const state = instantiator(obj);
      return SimpleResult.svalue(ObjWriter.wrap(okey, strength(state)));
    }
  );
};

const cExtract = function <T> (path: string[], obj: Record<string, T>, fields: FieldProcessorAdt[], strength: Strength): SimpleResult<SchemaError[], T> {
  const results = Arr.map(fields, function (field) {
    return cExtractOne(path, obj, field, strength);
  });

  return ResultCombine.consolidateObj(results, {});
};

const valueThunk = (getDelegate: () => Processor): Processor => {
  const extract = function (path, strength, val) {
    return getDelegate().extract(path, strength, val);
  };

  const toString = function () {
    return getDelegate().toString();
  };

  return {
    extract,
    toString
  };
};

const value = function (validator: ValueValidator): Processor {
  const extract = function (path, strength, val) {
    return SimpleResult.bindError(
      // NOTE: Intentionally allowing strength to be passed through internally
      validator(val, strength),
      function (err) {
        return SchemaError.custom(path, err);
      }
    );
  };

  const toString = function () {
    return 'val';
  };

  return {
    extract,
    toString
  };
};

// This is because Obj.keys can return things where the key is set to undefined.
const getSetKeys = (obj) => Obj.keys(Obj.filter(obj, (value) => value !== undefined && value !== null));

const objOfOnly = function (fields: ValueProcessorAdt[]): Processor {
  const delegate = objOf(fields);

  const fieldNames = Arr.foldr<ValueProcessorAdt, Record<string, string>>(fields, function (acc, f: ValueProcessorAdt) {
    return f.fold(function (key) {
      return Merger.deepMerge(acc, Objects.wrap(key, true));
    }, Fun.constant(acc));
  }, { });

  const extract = function (path, strength, o) {
    const keys = Type.isBoolean(o) ? [ ] : getSetKeys(o);
    const extra = Arr.filter(keys, function (k) {
      return !Obj.hasNonNullableKey(fieldNames, k);
    });

    return extra.length === 0 ? delegate.extract(path, strength, o) :
      SchemaError.unsupportedFields(path, extra);
  };

  return {
    extract,
    toString: delegate.toString
  };
};

const objOf = function (fields: ValueProcessorAdt[]): Processor {
  const extract = function (path: string[], strength: Strength, o: Record<string, any>) {
    return cExtract(path, o, fields, strength);
  };

  const toString = function () {
    const fieldStrings = Arr.map(fields, function (field) {
      return field.fold(function (key, okey, presence, prop) {
        return key + ' -> ' + prop.toString();
      }, function (okey, _instantiator) {
        return 'state(' + okey + ')';
      });
    });
    return 'obj{\n' + fieldStrings.join('\n') + '}';
  };

  return {
    extract,
    toString
  };
};

const arrOf = function (prop: Processor): Processor {
  const extract = function (path, strength, array) {
    const results = Arr.map(array, function (a, i) {
      return prop.extract(path.concat([ '[' + i + ']' ]), strength, a);
    });
    return ResultCombine.consolidateArr(results);
  };

  const toString = function () {
    return 'array(' + prop.toString() + ')';
  };

  return {
    extract,
    toString
  };
};

const oneOf = function (props: Processor[]): Processor {
  const extract = function (path: string[], strength, val: any): SimpleResult<SchemaError[], any> {
    const errors: Array<SimpleResult<SchemaError[], any>> = [];

    // Return on first match
    for (const prop of props) {
      const res = prop.extract(path, strength, val);
      if (res.stype === SimpleResultType.Value) {
        return res;
      }
      errors.push(res);
    }

    // All failed, return errors
    return ResultCombine.consolidateArr(errors);
  };

  const toString = function () {
    return 'oneOf(' + Arr.map(props, (prop) => prop.toString()).join(', ') + ')';
  };

  return {
    extract,
    toString
  };
};

const setOf = function (validator: ValueValidator, prop: Processor): Processor {
  const validateKeys = function (path, keys) {
    return arrOf(value(validator)).extract(path, Fun.identity, keys);
  };
  const extract = function (path, strength, o) {
    //
    const keys = Obj.keys(o);
    const validatedKeys = validateKeys(path, keys);
    return SimpleResult.bind(validatedKeys, function (validKeys) {
      const schema = Arr.map(validKeys, function (vk) {
        return adt.field(vk, vk, FieldPresence.strict(), prop);
      });

      return objOf(schema).extract(path, strength, o);
    });
  };

  const toString = function () {
    return 'setOf(' + prop.toString() + ')';
  };

  return {
    extract,
    toString
  };
};

// retriever is passed in. See funcOrDie in ValueSchema
const func = function (args: string[], schema: Processor, retriever: (obj: any, strength: Strength) => any): Processor {
  const delegate = value(function (f, strength) {
    return Type.isFunction(f) ? SimpleResult.svalue<any, () => any>(function () {
      const gArgs = Array.prototype.slice.call(arguments, 0);
      const allowedArgs = gArgs.slice(0, args.length);
      const o = f.apply(null, allowedArgs);
      return retriever(o, strength);
    }) : SimpleResult.serror('Not a function');
  });

  return {
    extract: delegate.extract,
    toString() {
      return 'function';
    }
  };
};

const thunk = function (desc: string, processor: () => Processor): Processor {
  const getP = Thunk.cached(function () {
    return processor();
  });

  const extract = function (path, strength, val) {
    return getP().extract(path, strength, val);
  };

  const toString = function () {
    return getP().toString();
  };

  return {
    extract,
    toString
  };
};

const anyValue = Fun.constant(value(SimpleResult.svalue));
const arrOfObj = Fun.compose(arrOf, objOf);

const state = adt.state;
const field = adt.field;

export {
  anyValue,
  value,
  valueThunk,

  objOf,
  objOfOnly,
  arrOf,
  oneOf,
  setOf,
  arrOfObj,

  state,
  field,
  output,
  snapshot,
  thunk,
  func
};
