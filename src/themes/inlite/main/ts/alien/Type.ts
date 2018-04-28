/**
 * Type.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

const isType = function (type) {
  return function (value) {
    return typeof value === type;
  };
};

const isArray = (value: any): value is any[] => Array.isArray(value);

const isNull = function (value) {
  return value === null;
};

const isObject = function (predicate) {
  return function (value) {
    return !isNull(value) && !isArray(value) && predicate(value);
  };
};
const isString = (value: any): value is string => isType('string')(value);
const isNumber = (value: any): value is number => isType('number')(value);
const isFunction = (value: any): value is Function => isType('function')(value);
const isBoolean = (value: any): value is boolean => isType('boolean')(value);

export default {
  isString,
  isNumber,
  isBoolean,
  isFunction,
  isObject: isObject(isType('object')),
  isNull,
  isArray
};