/**
 * Api.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

const get = function (patternsState) {
  const setPatterns = function (newPatterns) {
    patternsState.set(newPatterns);
  };

  const getPatterns = function () {
    return patternsState.get();
  };

  return {
    setPatterns,
    getPatterns
  };
};

export default {
  get
};