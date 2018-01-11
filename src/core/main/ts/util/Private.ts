/**
 * Private.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Uuid from './Uuid';

/**
 * This module lets you create private properties on objects.
 *
 * @class tinymce.util.Private
 * @private
 */

const fieldName = Uuid.uuid('private');

const set = function (publicKey, privateKey) {
  return function (obj, value) {
    if (!obj[fieldName]) {
      obj[fieldName] = {};
    }

    obj[fieldName][publicKey] = function (key) {
      return key === privateKey ? value : null;
    };
  };
};

const getOr = function (publicKey, privateKey) {
  return function (obj, defaultValue) {
    const collection = obj[fieldName];
    const accessor = collection ? collection[publicKey] : null;
    return accessor ? accessor(privateKey) : defaultValue;
  };
};

const create = function () {
  const publicKey = Uuid.uuid('pu');
  const privateKey = Uuid.uuid('pr');

  return {
    getOr: getOr(publicKey, privateKey),
    set: set(publicKey, privateKey)
  };
};

export default {
  create
};