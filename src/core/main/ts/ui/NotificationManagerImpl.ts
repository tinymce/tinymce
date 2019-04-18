/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

export function NotificationManagerImpl() {
  const unimplemented = function () {
    throw new Error('Theme did not provide a NotificationManager implementation.');
  };

  return {
    open: unimplemented,
    close: unimplemented,
    reposition: unimplemented,
    getArgs: unimplemented
  };
}