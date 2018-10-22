/**
 * ContextToolbar.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Fun } from '@ephox/katamari';
import * as Settings from '../api/Settings';
import Actions from '../core/Actions';

const register = function (editor) {
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