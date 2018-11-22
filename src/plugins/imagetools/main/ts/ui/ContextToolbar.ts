/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Fun } from '@ephox/katamari';
import * as Settings from '../api/Settings';
import Actions from '../core/Actions';

const register = function (editor) {
  editor.addContextToolbar(
    Fun.curry(Actions.isEditableImage, editor),
    Settings.getToolbarItems(editor)
  );
};

export default {
  register
};