/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

const isCodeSample = (elm: Element | null): boolean => {
  return elm && elm.nodeName === 'PRE' && elm.className.indexOf('language-') !== -1;
};

const trimArg = <T>(predicateFn: (a: T) => boolean) => {
  return (arg1: unknown, arg2: T): boolean => {
    return predicateFn(arg2);
  };
};

export {
  isCodeSample,
  trimArg
};
