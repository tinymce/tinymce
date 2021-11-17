/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Clipboard as FakeClipboard } from './Clipboard';

export interface Api {
  readonly fakeClipboard: FakeClipboard;
}

const getApi = (clipboard: FakeClipboard): Api => ({
  fakeClipboard: clipboard,
});

export { getApi };

