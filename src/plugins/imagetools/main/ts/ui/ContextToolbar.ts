/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Fun } from '@ephox/katamari';
import * as Settings from '../api/Settings';
import Actions from '../core/Actions';
import { Editor } from 'tinymce/core/api/Editor';

const register = function (editor: Editor) {
  editor.ui.registry.addContextToolbar('imagetools', {
    items: Settings.getToolbarItems(editor),
    predicate: Fun.curry(Actions.isEditableImage, editor),
    position: 'node',
    scope: 'node'
  });
};

export default {
  register
};