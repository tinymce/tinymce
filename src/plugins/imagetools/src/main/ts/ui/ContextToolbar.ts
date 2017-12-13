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
import Settings from '../api/Settings';
import Actions from '../core/Actions';

var register = function (editor) {
  editor.addContextToolbar(
    Fun.curry(Actions.isEditableImage, editor),
    Settings.getToolbarItems(editor)
  );
};

export default <any> {
  register: register
};