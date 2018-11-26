/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

const get = function (toggleState) {
  const isEnabled = function () {
    return toggleState.get();
  };

  return {
    isEnabled
  };
};

export default {
  get
};