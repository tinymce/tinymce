/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

function isCodeSample(elm) {
  return elm && elm.nodeName === 'PRE' && elm.className.indexOf('language-') !== -1;
}

function trimArg(predicateFn) {
  return function (arg1, arg2) {
    return predicateFn(arg2);
  };
}

export default {
  isCodeSample,
  trimArg
};