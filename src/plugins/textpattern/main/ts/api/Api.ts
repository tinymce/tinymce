/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
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