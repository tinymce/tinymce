import { Arr, Fun, Merger, Obj, Optional, Thunk, Type } from '@ephox/katamari';
import { SimpleResult, SimpleResultType } from '../alien/SimpleResult';
import * as FieldPresence from '../api/FieldPresence';
import * as Objects from '../api/Objects';
import { ResultCombine } from '../combine/ResultCombine';
import * as ObjWriter from './ObjWriter';
import * as SchemaError from './SchemaError';
import * as ValuePresence from './ValuePresence';

type SchemaError = SchemaError.SchemaError;

export type ValueValidator = (a) => SimpleResult<string, any>;
export type PropExtractor = (path: string[], val: any) => SimpleResult<SchemaError[], any>;
export type ValueExtractor = (label: string, prop: Processor, obj: any) => SimpleResult<SchemaError[], string>;
export interface Processor {
  extractProp: PropExtractor;
  toString: () => string;
}

const output = (newKey: string, value: any): ValuePresence.StateProcessorData => ValuePresence.state(newKey, Fun.constant(value));

const snapshot = (newKey: string): ValuePresence.StateProcessorData => ValuePresence.state(newKey, Fun.identity);

const strictAccess = <T>(path: string[], obj: Record<string, T>, key: string): SimpleResult<SchemaError[], T> => {
  // In strict mode, if it undefined, it is an error.
  return Obj.get(obj, key).fold<SimpleResult<SchemaError[], any>>(() =>
    SchemaError.missingStrict(path, key, obj), SimpleResult.svalue);
};

const fallbackAccess = <T>(obj: Record<string, T>, key: string, fallbackThunk: (obj: Record<string, T>) => T): SimpleResult<SchemaError[], T> => {
  const v = Obj.get(obj, key).fold(() => fallbackThunk(obj), Fun.identity);
  return SimpleResult.svalue(v);
};

const optionAccess = <T>(obj: Record<string, T>, key: string): SimpleResult<SchemaError[], Optional<T>> =>
  SimpleResult.svalue(Obj.get(obj, key));

const optionDefaultedAccess = <T>(obj: Record<string, T | true>, key: string, fallback: (obj: Record<string, T | true>) => T): SimpleResult<SchemaError[], Optional<T>> => {
  const opt = Obj.get(obj, key).map((val) => val === true ? fallback(obj) : val);
  return SimpleResult.svalue(opt);
};

type SimpleBundle = SimpleResult<SchemaError[], any>;
type OptionBundle = SimpleResult<SchemaError[], Record<string, Optional<any>>>;

const cExtractOne = <T>(path: string[], obj: Record<string, T>, value: ValuePresence.ValueProcessorTypes): SimpleResult<SchemaError[], T> => {
  return ValuePresence.fold(
    value,
    (key, newKey, presence, prop) => {
      const bundle = (av: any): SimpleBundle => {
        const result = prop.extractProp(path.concat([ key ]), av);
        return SimpleResult.map(result, (res) => ObjWriter.wrap(newKey, res));
      };

      const bundleAsOption = (optValue: Optional<any>): OptionBundle => {
        return optValue.fold(() => {
          const outcome = ObjWriter.wrap(newKey, Optional.none());
          return SimpleResult.svalue(outcome);
        }, (ov) => {
          const result: SimpleResult<any, any> = prop.extractProp(path.concat([ key ]), ov);
          return SimpleResult.map(result, (res) => {
            return ObjWriter.wrap(newKey, Optional.some(res));
          });
        });
      };

      const processPresence = (presence: FieldPresence.FieldPresenceTypes) => {
        switch (presence.discriminator) {
          case 'strict':
            return SimpleResult.bind(
              strictAccess(path, obj, key),
              bundle
            );
          case 'defaultedThunk':
            return SimpleResult.bind(
              fallbackAccess(obj, key, presence.callback),
              bundle
            );
          case 'asOption':
            return SimpleResult.bind(
              optionAccess(obj, key),
              bundleAsOption
            );
          case 'asDefaultedOptionThunk':
            return SimpleResult.bind(
              optionDefaultedAccess(obj, key, presence.callback),
              bundleAsOption
            );
          case 'mergeWithThunk': {
            const base = presence.callback(obj);
            const result = SimpleResult.map(
              fallbackAccess(obj, key, Fun.constant({})),
              (v) => Merger.deepMerge(base, v)
            );
            return SimpleResult.bind(result, bundle);
          }
        }
      };

      return (() => processPresence(presence))();
    },
    (newKey, instantiator) => {
      const state = instantiator(obj);
      return SimpleResult.svalue(ObjWriter.wrap(newKey, state));
    }
  );
};

const cExtract = <T>(path: string[], obj: Record<string, T>, fields: ValuePresence.ValueProcessorTypes[]): SimpleResult<SchemaError[], T> => {
  const results = Arr.map(fields, (field) => cExtractOne(path, obj, field));
  return ResultCombine.consolidateObj(results, {});
};

const valueThunk = (getDelegate: () => Processor): Processor => {
  const extract = (path: string[], val: any) => getDelegate().extractProp(path, val);

  const toString = () => getDelegate().toString();

  return {
    extractProp: extract,
    toString
  };
};

const value = (validator: ValueValidator): Processor => {
  const extract = (path, val) => {
    return SimpleResult.bindError(
      validator(val),
      (err) => SchemaError.custom(path, err)
    );
  };

  const toString = () => 'val';

  return {
    extractProp: extract,
    toString
  };
};

// This is because Obj.keys can return things where the key is set to undefined.
const getSetKeys = (obj) => Obj.keys(Obj.filter(obj, (value) => value !== undefined && value !== null));

const objOfOnly = (fields: ValuePresence.ValueProcessorTypes[]): Processor => {
  const delegate = objOf(fields);

  const fieldNames = Arr.foldr<ValuePresence.ValueProcessorTypes, Record<string, string>>(fields, (acc, value: ValuePresence.ValueProcessorTypes) => {
    return ValuePresence.fold(
      value,
      (key) => Merger.deepMerge(acc, Objects.wrap(key, true)),
      Fun.constant(acc)
    );
  }, {});

  const extract = (path, o) => {
    const keys = Type.isBoolean(o) ? [] : getSetKeys(o);
    const extra = Arr.filter(keys, (k) => !Obj.hasNonNullableKey(fieldNames, k));

    return extra.length === 0 ? delegate.extractProp(path, o) : SchemaError.unsupportedFields(path, extra);
  };

  return {
    extractProp: extract,
    toString: delegate.toString
  };
};

const objOf = (values: ValuePresence.ValueProcessorTypes[]): Processor => {
  const extract = (path: string[], o: Record<string, any>) => cExtract(path, o, values);

  const toString = () => {
    const fieldStrings = Arr.map(values, (value) => ValuePresence.fold(
      value,
      (key, _okey, _presence, prop) => key + ' -> ' + prop.toString(),
      (newKey, _instantiator) => 'state(' + newKey + ')'
    ));
    return 'obj{\n' + fieldStrings.join('\n') + '}';
  };

  return {
    extractProp: extract,
    toString
  };
};

const arrOf = (prop: Processor): Processor => {
  const extract = (path, array) => {
    const results = Arr.map(array, (a, i) => prop.extractProp(path.concat([ '[' + i + ']' ]), a));
    return ResultCombine.consolidateArr(results);
  };

  const toString = () => 'array(' + prop.toString() + ')';

  return {
    extractProp: extract,
    toString
  };
};

const oneOf = (props: Processor[]): Processor => {
  const extract = (path: string[], val: any): SimpleResult<SchemaError[], any> => {
    const errors: Array<SimpleResult<SchemaError[], any>> = [];

    // Return on first match
    for (const prop of props) {
      const res = prop.extractProp(path, val);
      if (res.stype === SimpleResultType.Value) {
        return res;
      }
      errors.push(res);
    }

    // All failed, return errors
    return ResultCombine.consolidateArr(errors);
  };

  const toString = () => 'oneOf(' + Arr.map(props, (prop) => prop.toString()).join(', ') + ')';

  return {
    extractProp: extract,
    toString
  };
};

const setOf = (validator: ValueValidator, prop: Processor): Processor => {
  const validateKeys = (path, keys) => arrOf(value(validator)).extractProp(path, keys);
  const extract = (path, o) => {
    //
    const keys = Obj.keys(o);
    const validatedKeys = validateKeys(path, keys);
    return SimpleResult.bind(validatedKeys, (validKeys) => {
      const schema = Arr.map(validKeys, (vk) => {
        return ValuePresence.field(vk, vk, FieldPresence.strict(), prop);
      });

      return objOf(schema).extractProp(path, o);
    });
  };

  const toString = () => 'setOf(' + prop.toString() + ')';

  return {
    extractProp: extract,
    toString
  };
};

// retriever is passed in. See funcOrDie in ValueSchema
const func = (args: string[], _schema: Processor, retriever: (obj: any) => any): Processor => {
  const delegate = value((f) => {
    return Type.isFunction(f) ? SimpleResult.svalue<any, () => any>((...gArgs: any[]) => {
      const allowedArgs = gArgs.slice(0, args.length);
      const o = f.apply(null, allowedArgs);
      return retriever(o);
    }) : SimpleResult.serror('Not a function');
  });

  return {
    extractProp: delegate.extractProp,
    toString: Fun.constant('function')
  };
};

const thunk = (_desc: string, processor: () => Processor): Processor => {
  const getP = Thunk.cached(processor);

  const extract = (path: string[], val: any) => getP().extractProp(path, val);

  const toString = () => getP().toString();

  return {
    extractProp: extract,
    toString
  };
};

const anyValue = Fun.constant(value(SimpleResult.svalue));
const arrOfObj = Fun.compose(arrOf, objOf);

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

  output,
  snapshot,
  thunk,
  func
};
