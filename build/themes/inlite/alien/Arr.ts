/**
 * Arr.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

const flatten = function (arr: any[]) {
  return arr.reduce(function (results: any[], item) {
    return Array.isArray(item) ? results.concat(flatten(item)) : results.concat(item);
  }, []);
};

export default {
  flatten
};