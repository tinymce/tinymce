/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';
import { Type } from '@ephox/katamari';

const validDefaultOrDie = (value: any, predicate: (value: any) => boolean): boolean => {
  if (predicate(value)) {
    return true;
  }

  throw new Error('Default value doesn\'t match requested type.');
};

const items = (value: boolean | string, defaultValue: string): string => {

  if (Type.isArray(value) || Type.isObject(value)) {
    throw new Error('expected a string but found: ' + value);
  }

  if (Type.isUndefined(value)) {
    return defaultValue;
  }

  if (Type.isBoolean(value)) {
    return value === false ? '' : defaultValue;
  }
  return value;
};

const getToolbarItemsOr = (predicate: (value: any) => boolean) => {
  return (editor: Editor, name: string, defaultValue: string): string => {
    validDefaultOrDie(defaultValue, predicate);
    const value = editor.getParam(name, defaultValue);
    return items(value, defaultValue);
  };
};

export default {
  getToolbarItemsOr: getToolbarItemsOr(Type.isString)
};