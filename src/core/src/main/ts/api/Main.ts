/**
 * Main.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Fun } from '@ephox/katamari';
import Tinymce from './Tinymce';
import { Global } from '@ephox/katamari';

declare const module: any;
declare const window: any;

/*eslint consistent-this: 0 */
var context = Global;

var exportToWindowGlobal = function (tinymce) {
  window.tinymce = tinymce;
  window.tinyMCE = tinymce;
};

exportToWindowGlobal(Tinymce);
