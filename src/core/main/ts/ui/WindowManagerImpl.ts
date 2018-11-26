/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

export default function () {
  const unimplemented = function () {
    throw new Error('Theme did not provide a WindowManager implementation.');
  };

  return {
    open: unimplemented,
    alert: unimplemented,
    confirm: unimplemented,
    close: unimplemented,
    getParams: unimplemented,
    setParams: unimplemented
  };
}