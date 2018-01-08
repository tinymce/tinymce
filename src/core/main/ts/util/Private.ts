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

var fieldName = Uuid.uuid('private');

var set = function (publicKey, privateKey) {
  return function (obj, value) {
    if (!obj[fieldName]) {
      obj[fieldName] = {};
    }

    obj[fieldName][publicKey] = function (key) {
      return key === privateKey ? value : null;
    };
  };
};

var getOr = function (publicKey, privateKey) {
  return function (obj, defaultValue) {
    var collection = obj[fieldName];
    var accessor = collection ? collection[publicKey] : null;
    return accessor ? accessor(privateKey) : defaultValue;
  };
};

var create = function () {
  var publicKey = Uuid.uuid('pu');
  var privateKey = Uuid.uuid('pr');

  return {
    getOr: getOr(publicKey, privateKey),
    set: set(publicKey, privateKey)
  };
};

export default <any> {
  create: create
};