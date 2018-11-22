/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Actions from './Actions';

const setup = function (editor) {
  editor.addShortcut('Meta+K', '', Actions.openDialog(editor));
};

export default {
  setup
};