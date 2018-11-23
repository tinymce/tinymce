/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

const flatten = function (arr: any[]) {
  return arr.reduce(function (results: any[], item) {
    return Array.isArray(item) ? results.concat(flatten(item)) : results.concat(item);
  }, []);
};

export default {
  flatten
};