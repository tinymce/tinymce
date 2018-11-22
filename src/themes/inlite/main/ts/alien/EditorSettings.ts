/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Type from './Type';
import { Editor } from 'tinymce/core/api/Editor';

const validDefaultOrDie = function (value, predicate) {
  if (predicate(value)) {
    return true;
  }

  throw new Error('Default value doesn\'t match requested type.');
};

const getByTypeOr = function (predicate) {
  return function (editor: Editor, name: string, defaultValue) {
    const settings = editor.settings;
    validDefaultOrDie(defaultValue, predicate);
    return name in settings && predicate(settings[name]) ? settings[name] : defaultValue;
  };
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
  // TODO: Add Option based getString, getBool if merged with core
  getStringOr: getByTypeOr(Type.isString),
  getBoolOr: getByTypeOr(Type.isBoolean),
  getNumberOr: getByTypeOr(Type.isNumber),
  getHandlerOr: getByTypeOr(Type.isFunction),
  getToolbarItemsOr: getToolbarItemsOr(Type.isArray)
};