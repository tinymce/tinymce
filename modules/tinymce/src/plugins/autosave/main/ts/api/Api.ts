/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import * as Storage from '../core/Storage';

const get = (editor) => ({
  hasDraft: () => Storage.hasDraft(editor),
  storeDraft: () => Storage.storeDraft(editor),
  restoreDraft: () => Storage.restoreDraft(editor),
  removeDraft: (fire?: boolean) => Storage.removeDraft(editor, fire),
  isEmpty: (html?: string) => Storage.isEmpty(editor, html)
});

export {
  get
};
