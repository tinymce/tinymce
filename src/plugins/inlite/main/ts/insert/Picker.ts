/**
 * Picker.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Promise from 'tinymce/core/api/util/Promise';
import { document } from '@ephox/dom-globals';

const pickFile = function () {
  return new Promise(function (resolve) {
    let fileInput;

    fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.style.position = 'fixed';
    fileInput.style.left = 0;
    fileInput.style.top = 0;
    fileInput.style.opacity = 0.001;
    document.body.appendChild(fileInput);

    fileInput.onchange = function (e) {
      resolve(Array.prototype.slice.call(e.target.files));
    };

    fileInput.click();
    fileInput.parentNode.removeChild(fileInput);
  });
};

export default {
  pickFile
};