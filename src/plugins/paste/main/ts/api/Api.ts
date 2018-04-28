/**
 * Api.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Clipboard } from '../api/Clipboard';

const get = function (clipboard: Clipboard, quirks) {
  return {
    clipboard,
    quirks
  };
};

export default {
  get
};