/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Fun, Obj, Optional, Strings, Type } from '@ephox/katamari';

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
  'string[]': string[];
  'array': any[];
  'function': Function;
  'object': any;
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
 * TinyMCE Options API.
 *
 * @class tinymce.editor.Options
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
    <K extends keyof EditorOptions>(name: K): EditorOptions[K] | undefined;
    <T>(name: string): T | undefined;
  };

  /**
   * Set the value for a registered option.
   *
   * @method set
   * @param {String} name Name of a registered option.
   * @return {Boolean} True if the option value was successfully set, otherwise false.
   */
  set: {
    <K extends keyof EditorOptions>(name: K, value: EditorOptions[K]): boolean;
    <T>(name: string, value: T): boolean;
  };

  /**
   * Clear the set value for the specified option and revert back to the default value.
   *
   * @method unset
   * @param {String} name Name of a registered option.
   * @return {Boolean} True if the option value was successfully reset, otherwise false.
   */
  unset: (name: string) => boolean;
}

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
        return (val) => Type.isArrayOf(val, Type.isString);
    }
  })() as (val: unknown) => val is BuiltInOptionTypeMap[K];

  return (value) => {
    const valid = validator(value);
    if (valid) {
      return { value, valid };
    } else {
      return { valid: false, message: `The value must be a ${type}.` };
    }
  };
};

const isBuiltInSpec = <K extends BuiltInOptionType>(spec: unknown): spec is BuiltInOptionSpec<K> =>
  Type.isString((spec as BuiltInOptionSpec<K>).processor);

const getErrorMessage = (message: string, result: ProcessorError): string => {
  const additionalText = Strings.isEmpty(result.message) ? '' : `. ${result.message}`;
  return message + additionalText;
};

const isValidResult = <T>(result: ProcessorSuccess<T> | ProcessorError): result is ProcessorSuccess<T> =>
  result.valid;

const processValue = <T, U>(value: T, processor: SimpleProcessor | Processor<U>): ProcessorSuccess<U> | ProcessorError => {
  const result = processor(value);
  if (Type.isBoolean(result)) {
    // Note: Need to cast here as if a boolean is returned then we're guaranteed to be returning the same value
    return result ? { value: value as unknown as U, valid: true } : { valid: false, message: '' };
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

  editor.on('init', () => {
    const unregisteredOptions = Arr.filter(Obj.keys(initialOptions), Fun.not(isRegistered));
    if (unregisteredOptions.length > 0) {
      // eslint-disable-next-line no-console
      console.warn('The following options were specified but have not been registered:\n - ' + unregisteredOptions.join('\n - '));
    }
  });

  const setValue = <T, U>(name: string, value: T, processor: SimpleProcessor | Processor<U>): boolean => {
    const result = processValue(value, processor);
    if (isValidResult(result)) {
      values[name] = result.value;
      // TODO: TINY-8236 (TINY-8234) Remove this later once all settings have been converted
      editor.settings[name] = result.value;
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
    // Set the default first in case the current/initial value isn't valid
    if (!Type.isUndefined(defaultValue)) {
      values[name] = defaultValue;
    }
    initValue.each((value) => setValue(name, value, processor));
  };

  const isRegistered = (name: string) =>
    Obj.has(registry, name);

  const get = (name: string) =>
    Obj.get(values, name).getOrUndefined();

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
      const spec = registry[name];
      Optional.from(spec.default).fold(
        () => delete values[name],
        (defaultValue) => values[name] = defaultValue
      );
      // TODO: TINY-8236 (TINY-8234) Remove this later once all settings have been converted
      delete editor.settings[name];
    }
    return registered;
  };

  return {
    register,
    isRegistered,
    get,
    set,
    unset
  };
};

export {
  create
};
