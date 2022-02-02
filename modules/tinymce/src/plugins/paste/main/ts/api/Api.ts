/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Clipboard } from './Clipboard';

export interface Api {
  readonly clipboard: Clipboard;
}

const get = (clipboard: Clipboard): Api => ({
  clipboard
});

export {
  get
};
