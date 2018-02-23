import { Adt, Arr, Fun, Merger, Obj, Option, Result, Type, Thunk } from '@ephox/katamari';
import { FieldPresence } from '../api/FieldPresence';
import { Objects } from '../api/Objects';
import { ResultCombine } from '../combine/ResultCombine';
import { TypeTokens } from '../format/TypeTokens';
import { ObjReader } from './ObjReader';
import { ObjWriter } from './ObjWriter';
import { SchemaError } from './SchemaError';

// TODO: Handle the fact that strength shouldn't be pushed outside this project.
export type ValueValidator = (a, strength?: () => any) => Result<any, string>;
export type PropExtractor = (path: string[], strength: () => any, val: any) => Result<any, any>;
export type ValueExtractor = (label: string, prop: Processor, strength: () => any, obj: any) => Result<any, string>;
export interface Processor {
  extract: PropExtractor;
  toString: () => any;
  toDsl: () => any;
}

export interface EncodedAdt {
  fold: (...args: any[]) => any;
  match: (branches: {any}) => any;
  log: (label: string) => string;
}
// ^^^ todo , put EncodedAdt as part of Katamari Adt

// data ValueAdt = Field fields | state
const adt: { field: (...args: any[]) => EncodedAdt, state: (...args: any[]) => EncodedAdt } = Adt.generate([
  { field: [ 'key', 'okey', 'presence', 'prop' ] },
  { state: [ 'okey', 'instantiator' ] }
]);

const output = function (okey, value): EncodedAdt {
  return adt.state(okey, Fun.constant(value));
};

const snapshot = function (okey) {
  return adt.state(okey, Fun.identity);
};

const strictAccess = function (path, obj, key) {
  // In strict mode, if it undefined, it is an error.
  return ObjReader.readOptFrom(obj, key).fold(function () {
    return SchemaError.missingStrict(path, key, obj);
  }, Result.value);
};

const fallbackAccess = function (obj, key, fallbackThunk) {
  const v = ObjReader.readOptFrom(obj, key).fold(function () {
    return fallbackThunk(obj);
  }, Fun.identity);
  return Result.value(v);
};

const optionAccess = function (obj, key) {
  return Result.value(ObjReader.readOptFrom(obj, key));
};

const optionDefaultedAccess = function (obj, key, fallback) {
  const opt = ObjReader.readOptFrom(obj, key).map(function (val) {
    return val === true ? fallback(obj) : val;
  });
  return Result.value(opt);
};

const cExtractOne = function (path, obj, field, strength) {
  return field.fold(
    function (key, okey, presence, prop) {
      const bundle = function (av) {
        return prop.extract(path.concat([ key ]), strength, av).map(function (res) {
          return ObjWriter.wrap(okey, strength(res));
        });
      };

      const bundleAsOption = function (optValue) {
        return optValue.fold(function () {
          const outcome = ObjWriter.wrap(okey, strength(Option.none()));
          return Result.value(outcome);
        }, function (ov) {
          return prop.extract(path.concat([ key ]), strength, ov).map(function (res) {
            return ObjWriter.wrap(okey, strength(Option.some(res)));
          });
        });
      };

      return (function () {
        return presence.fold(function () {
          return strictAccess(path, obj, key).bind(bundle);
        }, function (fallbackThunk) {
          return fallbackAccess(obj, key, fallbackThunk).bind(bundle);
        }, function () {
          return optionAccess(obj, key).bind(bundleAsOption);
        }, function (fallbackThunk) {
          // Defaulted option access
          return optionDefaultedAccess(obj, key, fallbackThunk).bind(bundleAsOption);
        }, function (baseThunk) {
          const base = baseThunk(obj);
          return fallbackAccess(obj, key, Fun.constant({})).map(function (v) {
            return Merger.deepMerge(base, v);
          }).bind(bundle);
        });
      })();
    },
    function (okey, instantiator) {
      const state = instantiator(obj);
      return Result.value(ObjWriter.wrap(okey, strength(state)));
    }
  );
};

const cExtract = function (path, obj, fields, strength) {
  const results = Arr.map(fields, function (field) {
    return cExtractOne(path, obj, field, strength);
  });

  return ResultCombine.consolidateObj(results, {});
};

const value = function (validator: ValueValidator): Processor {

  const extract = function (path, strength, val) {
    // NOTE: Intentionally allowing strength to be passed through internally
    return validator(val, strength).fold(function (err) {
      return SchemaError.custom(path, err);
    }, Result.value); // ignore strength
  };

  const toString = function () {
    return 'val';
  };

  const toDsl = function () {
    return TypeTokens.typeAdt.itemOf(validator);
  };

  return {
    extract,
    toString,
    toDsl
  };
};

// This is because Obj.keys can return things where the key is set to undefined.
const getSetKeys = function (obj) {
  const keys = Obj.keys(obj);
  return Arr.filter(keys, function (k) {
    return Objects.hasKey(obj, k);
  });
};

const objOfOnly = function (fields: EncodedAdt[]) {
  const delegate = objOf(fields);

  const fieldNames = Arr.foldr(fields, function (acc, f: EncodedAdt) {
    return f.fold(function (key) {
      return Merger.deepMerge(acc, Objects.wrap(key, true));
    }, Fun.constant(acc));
  }, { });

  const extract = function (path, strength, o) {
    const keys = Type.isBoolean(o) ? [ ] : getSetKeys(o);
    const extra = Arr.filter(keys, function (k) {
      return !Objects.hasKey(fieldNames, k);
    });

    return extra.length === 0  ? delegate.extract(path, strength, o) :
      SchemaError.unsupportedFields(path, extra);
  };

  return {
    extract,
    toString: delegate.toString,
    toDsl: delegate.toDsl
  };
};

const objOf = function (fields: EncodedAdt[]) {
  const extract = function (path, strength, o) {
    return cExtract(path, o, fields, strength);
  };

  const toString = function () {
    const fieldStrings = Arr.map(fields, function (field) {
      return field.fold(function (key, okey, presence, prop) {
        return key + ' -> ' + prop.toString();
      }, function (okey, instantiator) {
        return 'state(' + okey + ')';
      });
    });
    return 'obj{\n' + fieldStrings.join('\n') + '}';
  };

  const toDsl = function () {
    return TypeTokens.typeAdt.objOf(
      Arr.map(fields, function (f) {
        return f.fold(function (key, okey, presence, prop) {
          return TypeTokens.fieldAdt.field(key, presence, prop);
        }, function (okey, instantiator) {
          return TypeTokens.fieldAdt.state(okey);
        });
      })
    );
  };

  return {
    extract,
    toString,
    toDsl
  };
};

const arrOf = function (prop): Processor { // TODO: no test coverage
  const extract = function (path, strength, array) {
    const results = Arr.map(array, function (a, i) {
      return prop.extract(path.concat(['[' + i + ']' ]), strength, a);
    });
    return ResultCombine.consolidateArr(results);
  };

  const toString = function () {
    return 'array(' + prop.toString() + ')';
  };

  const toDsl = function () {
    return TypeTokens.typeAdt.arrOf(prop);
  };

  return {
    extract,
    toString,
    toDsl
  };
};

const setOf = function (validator, prop) {
  const validateKeys = function (path, keys) {
    return arrOf(value(validator)).extract(path, Fun.identity, keys);
  };
  const extract = function (path, strength, o) {
    //
    const keys = Obj.keys(o);
    return validateKeys(path, keys).bind(function (validKeys) {
      const schema = Arr.map(validKeys, function (vk) {
        return adt.field(vk, vk, FieldPresence.strict(), prop);
      });

      return objOf(schema).extract(path, strength, o);
    });
  };

  const toString = function () {
    return 'setOf(' + prop.toString() + ')';
  };

  const toDsl = function () {
    return TypeTokens.typeAdt.setOf(validator, prop);
  };

  return {
    extract,
    toString,
    toDsl
  };
};

// retriever is passed in. See funcOrDie in ValueSchema
const func = function (args, schema, retriever) {
  const delegate = value(function (f, strength) {
    return Type.isFunction(f) ? Result.value(function () {
      const gArgs = Array.prototype.slice.call(arguments, 0);
      const allowedArgs = gArgs.slice(0, args.length);
      const o = f.apply(null, allowedArgs);
      return retriever(o, strength);
    }) : Result.error('Not a function');
  });

  return {
    extract: delegate.extract,
    toString () {
      return 'function';
    },
    toDsl () {
      return TypeTokens.typeAdt.func(args, schema);
    }
  };
};

const thunk = function (desc, processor) {
  const getP = Thunk.cached(function () {
    return processor();
  });

  const extract = function (path, strength, val) {
    return getP().extract(path, strength, val);
  };

  const toString = function () {
    return getP().toString();
  };

  const toDsl = function () {
    return TypeTokens.typeAdt.thunk(desc);
  };

  return {
    extract,
    toString,
    toDsl
  };
};

const anyValue = value(Result.value);
const arrOfObj = Fun.compose(arrOf, objOf);

const state = adt.state;
const field = adt.field;

export const ValueProcessor = {
  anyValue: Fun.constant(anyValue),
  value,

  objOf,
  objOfOnly,
  arrOf,
  setOf,
  arrOfObj,

  state: adt.state,
  field: adt.field,
  output,
  snapshot,
  thunk,
  func
};
