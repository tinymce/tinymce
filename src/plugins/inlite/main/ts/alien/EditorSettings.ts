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

const splitNoEmpty = function (str: string, delim: RegExp) {
  return str.split(delim).filter(function (item) {
    return item.length > 0;
  });
};

const itemsToArray = function (value, defaultValue) {
  const stringToItemsArray = function (value) {
    return typeof value === 'string' ? splitNoEmpty(value, /[ ,]/) : value;
  };

  const boolToItemsArray = function (value: boolean, defaultValue) {
    return value === false ? [] : defaultValue;
  };

  if (Type.isArray(value)) {
    return value;
  } else if (Type.isString(value)) {
    return stringToItemsArray(value);
  } else if (Type.isBoolean(value)) {
    return boolToItemsArray(value, defaultValue);
  }

  return defaultValue;
};

const getToolbarItemsOr = function (predicate) {
  return function (editor: Editor, name: string, defaultValue) {
    const value = name in editor.settings ? editor.settings[name] : defaultValue;
    validDefaultOrDie(defaultValue, predicate);
    return itemsToArray(value, defaultValue);
  };
};

export default {
  getToolbarItemsOr: getToolbarItemsOr(Type.isArray)
};