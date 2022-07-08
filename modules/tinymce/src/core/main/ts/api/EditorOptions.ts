import { Fun, Obj, Strings, Type } from '@ephox/katamari';

import Editor from './Editor';
import { EditorOptions, NormalizedEditorOptions } from './OptionTypes';

interface ProcessorSuccess<T> {
  valid: true;
  value: T;
}

interface ProcessorError {
  valid: false;
  message: string;
}

type SimpleProcessor = (value: unknown) => boolean;
type Processor<T> = (value: unknown) => ProcessorSuccess<T> | ProcessorError;

export interface BuiltInOptionTypeMap {
  'string': string;
  'number': number;
  'boolean': boolean;
  'array': any[];
  'function': Function;
  'object': any;
  'string[]': string[];
  'object[]': any[];
  'regexp': RegExp;
}

export type BuiltInOptionType = keyof BuiltInOptionTypeMap;

interface BaseOptionSpec {
  immutable?: boolean;
  deprecated?: boolean;
  docsUrl?: string;
}

export interface BuiltInOptionSpec<K extends BuiltInOptionType> extends BaseOptionSpec {
  processor: K;
  default?: BuiltInOptionTypeMap[K];
}

export interface SimpleOptionSpec<T> extends BaseOptionSpec {
  processor: SimpleProcessor;
  default?: T;
}

export interface OptionSpec<T, U> extends BaseOptionSpec {
  processor: Processor<U>;
  default?: T;
}

/**
 * TinyMCE Editor Options API. The options API provides the ability to register, lookup and set editor options.
 *
 * @summary All options need to be registered before they can be used in the editor. This is done by using the `register()` API which requires a name
 * and an option specification. The specification should contain a `processor` and an optional `default` value. The processor is used to parse
 * and validate the option value either passed in the initial configuration or via the `set()` API.
 * <br><br>
 * The processor can either be a custom function that returns if the option value is valid, or one of the following built-in processors:
 * <br><br>
 * - `string`<br>
 * - `number`<br>
 * - `boolean`<br>
 * - `array`<br>
 * - `function`<br>
 * - `object`<br>
 * - `string[]`<br>
 * - `object[]`<br>
 * - `regexp`
 *
 * @class tinymce.EditorOptions
 * @example
 * // Register an option
 * editor.options.register('custom_option', {
 *   processor: 'string',
 *   default: 'myoption'
 * });
 *
 * // Lookup an option
 * editor.options.get('custom_option');
 *
 * // Set an option
 * editor.options.set('custom_option', 'value');
 */

export interface Options {
  /**
   * Register a new option that can be used within TinyMCE.
   *
   * @method register
   * @param {String} name Name of the option.
   * @param {OptionSpec} spec An option spec describing how to validate the option with other optional metadata.
   */
  register: {
    <K extends BuiltInOptionType>(name: string, spec: BuiltInOptionSpec<K>): void;
    <K extends keyof NormalizedEditorOptions>(name: K, spec: OptionSpec<NormalizedEditorOptions[K], EditorOptions[K]> | SimpleOptionSpec<NormalizedEditorOptions[K]>): void;
    <T, U>(name: string, spec: OptionSpec<T, U>): void;
    <T>(name: string, spec: SimpleOptionSpec<T>): void;
  };

  /**
   * Check if an option has been registered.
   *
   * @method isRegistered
   * @param {String} name Name of the option.
   * @return {Boolean} True if the option has already been registered, otherwise false.
   */
  isRegistered: (name: string) => boolean;

  /**
   * Get the value of a registered option.
   *
   * @method get
   * @param {String} name Name of a registered option.
   * @return {Object} An option value, the registered default if not set, or undefined if not registered.
   */
  get: {
    <K extends keyof EditorOptions>(name: K): EditorOptions[K];
    <T>(name: string): T | undefined;
  };

  /**
   * Set the value for a registered option.
   *
   * @method set
   * @param {String} name Name of a registered option.
   * @return {Boolean} True if the option value was successfully set, otherwise false.
   */
  set: <K extends string, T>(name: K, value: K extends keyof NormalizedEditorOptions ? NormalizedEditorOptions[K] : T) => boolean;

  /**
   * Clear the set value for the specified option and revert back to the default value.
   *
   * @method unset
   * @param {String} name Name of a registered option.
   * @return {Boolean} True if the option value was successfully reset, otherwise false.
   */
  unset: (name: string) => boolean;

  /**
   * Checks to see if a value has been set for the specified option.
   *
   * @method isSet
   * @param {String} name Name of the option.
   * @return {Boolean} True if the option has a value set, otherwise false.
   */
  isSet: (name: string) => boolean;
}

// A string array allows comma/space separated values as well for ease of use
const stringListProcessor: Processor<string[]> = (value: unknown) => {
  if (Type.isString(value)) {
    return { value: value.split(/[ ,]/), valid: true };
  } else if (Type.isArrayOf(value, Type.isString)) {
    return { value, valid: true };
  } else {
    return { valid: false, message: `The value must be a string[] or a comma/space separated string.` };
  }
};

const getBuiltInProcessor = <K extends BuiltInOptionType>(type: K): Processor<BuiltInOptionTypeMap[K]> => {
  const validator = (() => {
    switch (type) {
      case 'array':
        return Type.isArray;
      case 'boolean':
        return Type.isBoolean;
      case 'function':
        return Type.isFunction;
      case 'number':
        return Type.isNumber;
      case 'object':
        return Type.isObject;
      case 'string':
        return Type.isString;
      case 'string[]':
        return stringListProcessor;
      case 'object[]':
        return (val) => Type.isArrayOf(val, Type.isObject);
      case 'regexp':
        return (val) => Type.is(val, RegExp);
      default:
        return Fun.always;
    }
  })() as SimpleProcessor | Processor<BuiltInOptionTypeMap[K]>;

  return (value) => processValue(value, validator, `The value must be a ${type}.`);
};

const isBuiltInSpec = <K extends BuiltInOptionType>(spec: unknown): spec is BuiltInOptionSpec<K> =>
  Type.isString((spec as BuiltInOptionSpec<K>).processor);

const getErrorMessage = (message: string, result: ProcessorError): string => {
  const additionalText = Strings.isEmpty(result.message) ? '' : `. ${result.message}`;
  return message + additionalText;
};

const isValidResult = <T>(result: ProcessorSuccess<T> | ProcessorError): result is ProcessorSuccess<T> =>
  result.valid;

const processValue = <T, U>(value: T, processor: SimpleProcessor | Processor<U>, message: string = ''): ProcessorSuccess<U> | ProcessorError => {
  const result = processor(value);
  if (Type.isBoolean(result)) {
    // Note: Need to cast here as if a boolean is returned then we're guaranteed to be returning the same value
    return result ? { value: value as unknown as U, valid: true } : { valid: false, message };
  } else {
    return result;
  }
};

const processDefaultValue = <T, U>(name: string, defaultValue: T, processor: Processor<U>): U | undefined => {
  if (!Type.isUndefined(defaultValue)) {
    const result = processValue(defaultValue, processor);
    if (isValidResult(result)) {
      return result.value;
    } else {
      // eslint-disable-next-line no-console
      console.error(getErrorMessage(`Invalid default value passed for the "${name}" option`, result));
    }
  }

  return undefined;
};

const create = (editor: Editor, initialOptions: Record<string, unknown>): Options => {
  const registry: Record<string, OptionSpec<any, any>> = {};
  const values: Record<string, any> = {};

  const setValue = <T, U>(name: string, value: T, processor: SimpleProcessor | Processor<U>): boolean => {
    const result = processValue(value, processor);
    if (isValidResult(result)) {
      values[name] = result.value;
      return true;
    } else {
      // eslint-disable-next-line no-console
      console.warn(getErrorMessage(`Invalid value passed for the ${name} option`, result));
      return false;
    }
  };

  const register = (name: string, spec: BuiltInOptionSpec<any> | OptionSpec<any, any>) => {
    const processor = isBuiltInSpec(spec) ? getBuiltInProcessor(spec.processor) : spec.processor;

    // Process and validate the default value
    const defaultValue = processDefaultValue(name, spec.default, processor);

    // Register the spec with the validated default and normalized processor
    registry[name] = {
      ...spec,
      default: defaultValue,
      processor
    };

    // Setup the initial values
    const initValue = Obj.get(values, name).orThunk(() => Obj.get(initialOptions, name));
    initValue.each((value) => setValue(name, value, processor));
  };

  const isRegistered = (name: string) =>
    Obj.has(registry, name);

  const get = (name: string) =>
    Obj.get(values, name)
      .orThunk(() => Obj.get(registry, name).map((spec) => spec.default))
      .getOrUndefined();

  const set = <T>(name: string, value: T) => {
    if (!isRegistered(name)) {
      // eslint-disable-next-line no-console
      console.warn(`"${name}" is not a registered option. Ensure the option has been registered before setting a value.`);
      return false;
    } else {
      const spec = registry[name];
      if (spec.immutable) {
        // eslint-disable-next-line no-console
        console.error(`"${name}" is an immutable option and cannot be updated`);
        return false;
      } else {
        return setValue(name, value, spec.processor);
      }
    }
  };

  const unset = (name: string) => {
    const registered = isRegistered(name);
    if (registered) {
      delete values[name];
    }
    return registered;
  };

  const isSet = (name: string) =>
    Obj.has(values, name);

  return {
    register,
    isRegistered,
    get,
    set,
    unset,
    isSet
  };
};

export {
  create
};
