/**
 * Commands.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Fun } from '@ephox/katamari';
import Templates from '../core/Templates';

const register = function (editor) {
  editor.addCommand('mceInsertTemplate', Fun.curry(Templates.insertTemplate, editor));
};

export default {
  register
};