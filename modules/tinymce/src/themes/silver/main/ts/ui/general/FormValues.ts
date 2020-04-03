/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Form, Invalidating, Representing } from '@ephox/alloy';
import { Arr, Future, Futures, Merger, Obj, Option, Result, Results } from '@ephox/katamari';

export interface FormValidator { 'value': string | number; 'text': string }

const toValidValues = function <T> (values: { [key: string]: Option<T[keyof T]> }) {
  const errors: string[] = [];
  const result: { [key: string]: T[keyof T] } = {};

  Obj.each(values, function (value: Option<T[keyof T]>, name: string) {
    value.fold(function () {
      errors.push(name);
    }, function (v) {
      result[name] = v;
    });
  });

  return errors.length > 0 ? Result.error<{ [key: string]: T[keyof T] }, string[]>(errors) :
    Result.value<{ [key: string]: T[keyof T] }, string[]>(result);
};

const toValuesOrDefaults = function (optionValues, defaults) {
  const r = {};
  Obj.each(optionValues, function (v, k) {
    v.each(function (someValue) {
      r[k] = someValue;
    });
  });
  return Merger.deepMerge(defaults, r);
};

interface ValueHolder {
  value: any;
  text: any;
}

const isValueHolder = (v: any): v is ValueHolder => Obj.hasNonNullableKey(v, 'value') && Obj.hasNonNullableKey(v, 'text');

const extract = <T>(form) => {
  // FIX: May hit race conditions here is the validation is ongoing and I fire
  // another one.
  const rawValues: { [key: string]: Option<T[keyof T]> } = Representing.getValue(form);
  const values = toValidValues(rawValues);

  // TODO: Consider how to work "required" into this
  return values.fold(function (_errs) {
    // TODO: Something went very wrong (could not find fields)
    return Future.pure(Result.error([]));
  }, function (vs) {
    const keys: string[] = Obj.keys(vs);
    const validations: Array<Future<Result<any, { field: any; message: string }>>> = Arr.map(keys, function (key: string) {
      // TODO: This should be fine because we just got the value.
      const field = Form.getField(form, key).getOrDie('Could not find field: ' + key);
      // TODO: check this refactored line if it breaks.
      return field.hasConfigured(Invalidating) ? Invalidating.run(field).map(Result.value) : Future.pure(Result.value(true));
    });

    return Futures.par(validations).map(function (answers) {
      // Answers is an array of results
      const partition = Results.partition(answers);
      return partition.errors.length > 0 ? Result.error(partition.errors) : Result.value(
        Obj.map(vs, function (v) {
          // Replace { value, text } with just value.
          return isValueHolder(v) ? v.value : v;
        })
      );
    });
  });
};

export {
  toValidValues,
  extract,
  toValuesOrDefaults
};
