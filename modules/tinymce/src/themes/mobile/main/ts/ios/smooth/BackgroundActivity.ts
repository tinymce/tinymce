/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Cell, LazyValue } from '@ephox/katamari';

export default function (doAction) {
  // Start the activity in idle state.
  const action = Cell(
    LazyValue.pure({})
  );

  const start = function (value) {
    const future = LazyValue.nu(function (callback) {
      return doAction(value).get(callback);
    });

    // Note: LazyValue kicks off immediately
    action.set(future);
  };

  // Idle will fire g once the current action is complete.
  const idle = function (g) {
    action.get().get(function () {
      g();
    });
  };

  return {
    start,
    idle
  };
}