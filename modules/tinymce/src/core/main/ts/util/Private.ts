/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import * as Uuid from './Uuid';

/**
 * This module lets you create private properties on objects.
 *
 * @class tinymce.util.Private
 * @private
 */

const fieldName = Uuid.uuid('private');

const set = (publicKey, privateKey) => {
  return (obj, value) => {
    if (!obj[fieldName]) {
      obj[fieldName] = {};
    }

    obj[fieldName][publicKey] = (key) => {
      return key === privateKey ? value : null;
    };
  };
};

const getOr = (publicKey, privateKey) => {
  return (obj, defaultValue) => {
    const collection = obj[fieldName];
    const accessor = collection ? collection[publicKey] : null;
    return accessor ? accessor(privateKey) : defaultValue;
  };
};

const create = () => {
  const publicKey = Uuid.uuid('pu');
  const privateKey = Uuid.uuid('pr');

  return {
    getOr: getOr(publicKey, privateKey),
    set: set(publicKey, privateKey)
  };
};

export {
  create
};
