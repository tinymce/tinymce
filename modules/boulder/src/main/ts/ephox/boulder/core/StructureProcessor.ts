import { Arr, Fun, Merger, Obj, Optional, Thunk, Type } from '@ephox/katamari';

import { SimpleResult, SimpleResultType } from '../alien/SimpleResult';
import { FieldPresence, FieldPresenceTag, required } from '../api/FieldPresence';
import { ResultCombine } from '../combine/ResultCombine';
import * as FieldProcessor from './FieldProcessor';
import * as SchemaError from './SchemaError';
import { value } from './Utils';

type FieldProcessor = FieldProcessor.FieldProcessor;
type SchemaError = SchemaError.SchemaError;

export type ValueValidator = (a) => SimpleResult<string, any>;
export type PropExtractor = (path: string[], val: any) => SimpleResult<SchemaError[], any>;
export interface StructureProcessor {
  readonly extract: PropExtractor;
  readonly toString: () => string;
}

type SimpleBundle<T> = SimpleResult<SchemaError[], T>;
type OptionBundle<T> = SimpleResult<SchemaError[], Optional<T>>;
type SimpleBundler<T, U> = (val: T) => SimpleBundle<U>;
type OptionBundler<T, U> = (val: Optional<T>) => OptionBundle<U>;

const output = (newKey: string, value: any): FieldProcessor => FieldProcessor.customField(newKey, Fun.constant(value));

const snapshot = (newKey: string): FieldProcessor => FieldProcessor.customField(newKey, Fun.identity);

const requiredAccess = <T, U>(path: string[], obj: Record<string, T>, key: string, bundle: SimpleBundler<T, U>): SimpleBundle<U> =>
  // In required mode, if it is undefined, it is an error.
  Obj.get(obj, key).fold(() => SchemaError.missingRequired(path, key, obj), bundle);

const fallbackAccess = <T, U>(
  obj: Record<string, T>,
  key: string,
  fallback: (obj: Record<string, T>) => T,
  bundle: SimpleBundler<T, U>
): SimpleBundle<U> => {
  const v = Obj.get(obj, key).getOrThunk(() => fallback(obj));
  return bundle(v);
};

const optionAccess = <T, U>(obj: Record<string, T>, key: string, bundle: OptionBundler<T, U>): OptionBundle<U> =>
  bundle(Obj.get(obj, key));

const optionDefaultedAccess = <T, U>(
  obj: Record<string, T | true>,
  key: string,
  fallback: (obj: Record<string, T | true>) => T,
  bundle: OptionBundler<T, U>
): OptionBundle<U> => {
  const opt = Obj.get(obj, key).map((val) => val === true ? fallback(obj) : val);
  return bundle(opt);
};

const extractField = <T, U>(
  field: FieldPresence,
  path: string[],
  obj: Record<string, T>,
  key: string,
  prop: StructureProcessor
): SimpleResult<SchemaError[], U | Optional<U>> => {
  const bundle = (av: T): SimpleBundle<U> => prop.extract(path.concat([ key ]), av);

  const bundleAsOption = (optValue: Optional<T>): OptionBundle<U> => optValue.fold(
    () => SimpleResult.svalue(Optional.none()),
    (ov) => {
      const result = prop.extract(path.concat([ key ]), ov);
      return SimpleResult.map(result, Optional.some);
    }
  );

  switch (field.tag) {
    case FieldPresenceTag.Required:
      return requiredAccess(path, obj, key, bundle);
    case FieldPresenceTag.DefaultedThunk:
      return fallbackAccess(obj, key, field.process, bundle);
    case FieldPresenceTag.Option:
      return optionAccess(obj, key, bundleAsOption);
    case FieldPresenceTag.DefaultedOptionThunk:
      return optionDefaultedAccess(obj, key, field.process, bundleAsOption);
    case FieldPresenceTag.MergeWithThunk: {
      return fallbackAccess(obj, key, Fun.constant({}), (v) => {
        const result = Merger.deepMerge(field.process(obj), v);
        return bundle(result);
      });
    }
  }
};

const extractFields = <T, U>(
  path: string[],
  obj: Record<string, T>,
  fields: FieldProcessor[]
): SimpleResult<SchemaError[], Record<string, U | Optional<U>>> => {
  const success: Record<string, U | Optional<U>> = {};
  const errors: SchemaError[] = [];

  // PERFORMANCE: We use a for loop here instead of Arr.each as this is a hot code path
  for (const field of fields) {
    FieldProcessor.fold(
      field,
      (key, newKey, presence, prop) => {
        const result = extractField<T, U>(presence, path, obj, key, prop);
        SimpleResult.fold(result, (err) => {
          errors.push(...err);
        }, (res) => {
          success[newKey] = res;
        });
      },
      (newKey, instantiator) => {
        success[newKey] = instantiator(obj);
      }
    );
  }

  return errors.length > 0 ? SimpleResult.serror(errors) : SimpleResult.svalue(success);
};

const valueThunk = (getDelegate: () => StructureProcessor): StructureProcessor => {
  const extract = (path: string[], val: any) => getDelegate().extract(path, val);

  const toString = () => getDelegate().toString();

  return {
    extract,
    toString
  };
};

// This is because Obj.keys can return things where the key is set to undefined.
const getSetKeys = (obj: Record<string, unknown>) => Obj.keys(Obj.filter(obj, Type.isNonNullable));

const objOfOnly = (fields: FieldProcessor[]): StructureProcessor => {
  const delegate = objOf(fields);

  const fieldNames = Arr.foldr(fields, (acc, value) => {
    return FieldProcessor.fold(
      value,
      (key) => Merger.deepMerge(acc, { [key]: true }),
      Fun.constant(acc)
    );
  }, {} as Record<string, boolean>);

  const extract = (path: string[], o: Record<string, any> | boolean) => {
    const keys = Type.isBoolean(o) ? [] : getSetKeys(o);
    const extra = Arr.filter(keys, (k) => !Obj.hasNonNullableKey(fieldNames, k));

    return extra.length === 0 ? delegate.extract(path, o) : SchemaError.unsupportedFields(path, extra);
  };

  return {
    extract,
    toString: delegate.toString
  };
};

const objOf = (values: FieldProcessor[]): StructureProcessor => {
  const extract = (path: string[], o: Record<string, any>) => extractFields(path, o, values);

  const toString = () => {
    const fieldStrings = Arr.map(values, (value) => FieldProcessor.fold(
      value,
      (key, _okey, _presence, prop) => key + ' -> ' + prop.toString(),
      (newKey, _instantiator) => 'state(' + newKey + ')'
    ));
    return 'obj{\n' + fieldStrings.join('\n') + '}';
  };

  return {
    extract,
    toString
  };
};

const arrOf = (prop: StructureProcessor): StructureProcessor => {
  const extract = (path, array) => {
    const results = Arr.map(array, (a, i) => prop.extract(path.concat([ '[' + i + ']' ]), a));
    return ResultCombine.consolidateArr(results);
  };

  const toString = () => 'array(' + prop.toString() + ')';

  return {
    extract,
    toString
  };
};

const oneOf = (props: StructureProcessor[], rawF?: (x: any) => any): StructureProcessor => {
  // If f is not supplied, then use identity.
  const f = rawF !== undefined ? rawF : Fun.identity;
  const extract = (path: string[], val: any): SimpleResult<SchemaError[], any> => {
    const errors: Array<SimpleResult<SchemaError[], any>> = [];

    // Return on first match
    for (const prop of props) {
      const res = prop.extract(path, val);
      if (res.stype === SimpleResultType.Value) {
        return {
          stype: SimpleResultType.Value,
          svalue: f(res.svalue)
        };
      }
      errors.push(res);
    }

    // All failed, return errors
    return ResultCombine.consolidateArr(errors);
  };

  const toString = () => 'oneOf(' + Arr.map(props, (prop) => prop.toString()).join(', ') + ')';

  return {
    extract,
    toString
  };
};

const setOf = (validator: ValueValidator, prop: StructureProcessor): StructureProcessor => {
  const validateKeys = (path, keys) => arrOf(value(validator)).extract(path, keys);
  const extract = (path, o) => {
    //
    const keys = Obj.keys(o);
    const validatedKeys = validateKeys(path, keys);
    return SimpleResult.bind(validatedKeys, (validKeys) => {
      const schema = Arr.map(validKeys, (vk) => {
        return FieldProcessor.field(vk, vk, required(), prop);
      });

      return objOf(schema).extract(path, o);
    });
  };

  const toString = () => 'setOf(' + prop.toString() + ')';

  return {
    extract,
    toString
  };
};

// retriever is passed in. See funcOrDie in StructureSchema
const func = (args: string[], _schema: StructureProcessor, retriever: (obj: any) => any): StructureProcessor => {
  const delegate = value((f) => {
    return Type.isFunction(f) ? SimpleResult.svalue<any, () => any>((...gArgs: any[]) => {
      const allowedArgs = gArgs.slice(0, args.length);
      const o = f.apply(null, allowedArgs);
      return retriever(o);
    }) : SimpleResult.serror('Not a function');
  });

  return {
    extract: delegate.extract,
    toString: Fun.constant('function')
  };
};

const thunk = (_desc: string, processor: () => StructureProcessor): StructureProcessor => {
  const getP = Thunk.cached(processor);

  const extract = (path: string[], val: any) => getP().extract(path, val);

  const toString = () => getP().toString();

  return {
    extract,
    toString
  };
};

const arrOfObj = Fun.compose(arrOf, objOf);

export {
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
