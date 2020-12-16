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

const output = (okey: string, value: any): ValueProcessorAdt => {
  return adt.state(okey, Fun.constant(value));
};

const snapshot = (okey: string): ValueProcessorAdt => {
  return adt.state(okey, Fun.identity);
};

const strictAccess = <T>(path: string[], obj: Record<string, T>, key: string): SimpleResult<SchemaError[], T> => {
  // In strict mode, if it undefined, it is an error.
  return Obj.get(obj, key).fold<SimpleResult<SchemaError[], any>>(() => {
    return SchemaError.missingStrict(path, key, obj);
  }, SimpleResult.svalue);
};

const fallbackAccess = <T>(obj: Record<string, T>, key: string, fallbackThunk: (obj: Record<string, T>) => T): SimpleResult<SchemaError[], T> => {
  const v = Obj.get(obj, key).fold(() => {
    return fallbackThunk(obj);
  }, Fun.identity);
  return SimpleResult.svalue(v);
};

const optionAccess = <T>(obj: Record<string, T>, key: string): SimpleResult<SchemaError[], Optional<T>> => {
  return SimpleResult.svalue(Obj.get(obj, key));
};

const optionDefaultedAccess = <T>(obj: Record<string, T | true>, key: string, fallback: (obj: Record<string, T | true>) => T): SimpleResult<SchemaError[], Optional<T>> => {
  const opt = Obj.get(obj, key).map((val) => {
    return val === true ? fallback(obj) : val;
  });
  return SimpleResult.svalue(opt);
};

const cExtractOne = <T>(path: string[], obj: Record<string, T>, field: FieldProcessorAdt, strength: Strength): SimpleResult<SchemaError[], T> => {
  return field.fold(
    (key, okey, presence, prop) => {
      const bundle = (av: any): SimpleResult<SchemaError[], any> => {
        const result = prop.extract(path.concat([ key ]), strength, av);
        return SimpleResult.map(result, (res) => ObjWriter.wrap(okey, strength(res)));
      };

      const bundleAsOption = (optValue: Optional<any>): SimpleResult<SchemaError[], Record<string, Optional<any>>> => {
        return optValue.fold(() => {
          const outcome = ObjWriter.wrap(okey, strength(Optional.none()));
          return SimpleResult.svalue(outcome);
        }, (ov) => {
          const result: SimpleResult<any, any> = prop.extract(path.concat([ key ]), strength, ov);
          return SimpleResult.map(result, (res) => {
            return ObjWriter.wrap(okey, strength(Optional.some(res)));
          });
        });
      };

      return (() => {
        return presence.fold(() => {
          return SimpleResult.bind(
            strictAccess(path, obj, key),
            bundle
          );
        }, (fallbackThunk) => {
          return SimpleResult.bind(
            fallbackAccess(obj, key, fallbackThunk),
            bundle
          );
        }, () => {
          return SimpleResult.bind(
            optionAccess(obj, key),
            bundleAsOption
          );
        }, (fallbackThunk) => {
          // Defaulted option access
          return SimpleResult.bind(
            optionDefaultedAccess(obj, key, fallbackThunk),
            bundleAsOption
          );
        }, (baseThunk) => {
          const base = baseThunk(obj);
          const result = SimpleResult.map(
            fallbackAccess(obj, key, Fun.constant({})),
            (v) => Merger.deepMerge(base, v)
          );
          return SimpleResult.bind(result, bundle);
        });
      })();
    },
    (okey, instantiator) => {
      const state = instantiator(obj);
      return SimpleResult.svalue(ObjWriter.wrap(okey, strength(state)));
    }
  );
};

const cExtract = <T> (path: string[], obj: Record<string, T>, fields: FieldProcessorAdt[], strength: Strength): SimpleResult<SchemaError[], T> => {
  const results = Arr.map(fields, (field) => {
    return cExtractOne(path, obj, field, strength);
  });

  return ResultCombine.consolidateObj(results, {});
};

const valueThunk = (getDelegate: () => Processor): Processor => {
  const extract = (path, strength, val) => {
    return getDelegate().extract(path, strength, val);
  };

  const toString = () => {
    return getDelegate().toString();
  };

  return {
    extract,
    toString
  };
};

const value = (validator: ValueValidator): Processor => {
  const extract = (path, strength, val) => {
    return SimpleResult.bindError(
      // NOTE: Intentionally allowing strength to be passed through internally
      validator(val, strength),
      (err) => {
        return SchemaError.custom(path, err);
      }
    );
  };

  const toString = () => {
    return 'val';
  };

  return {
    extract,
    toString
  };
};

// This is because Obj.keys can return things where the key is set to undefined.
const getSetKeys = (obj) => Obj.keys(Obj.filter(obj, (value) => value !== undefined && value !== null));

const objOfOnly = (fields: ValueProcessorAdt[]): Processor => {
  const delegate = objOf(fields);

  const fieldNames = Arr.foldr<ValueProcessorAdt, Record<string, string>>(fields, (acc, f: ValueProcessorAdt) => {
    return f.fold((key) => {
      return Merger.deepMerge(acc, Objects.wrap(key, true));
    }, Fun.constant(acc));
  }, { });

  const extract = (path, strength, o) => {
    const keys = Type.isBoolean(o) ? [ ] : getSetKeys(o);
    const extra = Arr.filter(keys, (k) => {
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

const objOf = (fields: ValueProcessorAdt[]): Processor => {
  const extract = (path: string[], strength: Strength, o: Record<string, any>) => {
    return cExtract(path, o, fields, strength);
  };

  const toString = () => {
    const fieldStrings = Arr.map(fields, (field) => {
      return field.fold((key, okey, presence, prop) => {
        return key + ' -> ' + prop.toString();
      }, (okey, _instantiator) => {
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

const arrOf = (prop: Processor): Processor => {
  const extract = (path, strength, array) => {
    const results = Arr.map(array, (a, i) => {
      return prop.extract(path.concat([ '[' + i + ']' ]), strength, a);
    });
    return ResultCombine.consolidateArr(results);
  };

  const toString = () => {
    return 'array(' + prop.toString() + ')';
  };

  return {
    extract,
    toString
  };
};

const oneOf = (props: Processor[]): Processor => {
  const extract = (path: string[], strength, val: any): SimpleResult<SchemaError[], any> => {
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

  const toString = () => {
    return 'oneOf(' + Arr.map(props, (prop) => prop.toString()).join(', ') + ')';
  };

  return {
    extract,
    toString
  };
};

const setOf = (validator: ValueValidator, prop: Processor): Processor => {
  const validateKeys = (path, keys) => {
    return arrOf(value(validator)).extract(path, Fun.identity, keys);
  };
  const extract = (path, strength, o) => {
    //
    const keys = Obj.keys(o);
    const validatedKeys = validateKeys(path, keys);
    return SimpleResult.bind(validatedKeys, (validKeys) => {
      const schema = Arr.map(validKeys, (vk) => {
        return adt.field(vk, vk, FieldPresence.strict(), prop);
      });

      return objOf(schema).extract(path, strength, o);
    });
  };

  const toString = () => {
    return 'setOf(' + prop.toString() + ')';
  };

  return {
    extract,
    toString
  };
};

// retriever is passed in. See funcOrDie in ValueSchema
const func = (args: string[], schema: Processor, retriever: (obj: any, strength: Strength) => any): Processor => {
  const delegate = value((f, strength) => {
    return Type.isFunction(f) ? SimpleResult.svalue<any, () => any>((...gArgs: any[]) => {
      const allowedArgs = gArgs.slice(0, args.length);
      const o = f.apply(null, allowedArgs);
      return retriever(o, strength);
    }) : SimpleResult.serror('Not a function');
  });

  return {
    extract: delegate.extract,
    toString: Fun.constant('function')
  };
};

const thunk = (desc: string, processor: () => Processor): Processor => {
  const getP = Thunk.cached(() => {
    return processor();
  });

  const extract = (path, strength, val) => {
    return getP().extract(path, strength, val);
  };

  const toString = () => {
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
