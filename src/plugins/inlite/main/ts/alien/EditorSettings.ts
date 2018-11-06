/**
 * EditorSettings.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Editor } from 'tinymce/core/api/Editor';
import { Type } from '@ephox/katamari';

const validDefaultOrDie = function (value, predicate) {
  if (predicate(value)) {
    return true;
  }

  throw new Error('Default value doesn\'t match requested type.');
};

const items = function (value, defaultValue) {

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

const getToolbarItemsOr = function (predicate) {
  return function (editor: Editor, name: string, defaultValue) {
    const value = name in editor.settings ? editor.settings[name] : defaultValue;
    validDefaultOrDie(defaultValue, predicate);
    return items(value, defaultValue);
  };
};

export default {
  getToolbarItemsOr: getToolbarItemsOr(Type.isString)
};