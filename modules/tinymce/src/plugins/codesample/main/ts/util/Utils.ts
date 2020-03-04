/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Element } from '@ephox/dom-globals';

function isCodeSample(elm: Element) {
  return elm && elm.nodeName === 'PRE' && elm.className.indexOf('language-') !== -1;
}

function trimArg<T>(predicateFn: (a: T) => boolean) {
  return function (arg1: any, arg2: T) {
    return predicateFn(arg2);
  };
}

export {
  isCodeSample,
  trimArg
};
