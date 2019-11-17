/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Promise from 'tinymce/core/api/util/Promise';
import { document, File, HTMLInputElement } from '@ephox/dom-globals';
import Editor from 'tinymce/core/api/Editor';

const pickFile = (editor: Editor) => {
  return new Promise((resolve: (files: File[]) => void) => {
    const fileInput: HTMLInputElement = document.createElement('input');
    fileInput.type = 'file';
    fileInput.style.position = 'fixed';
    fileInput.style.left = '0';
    fileInput.style.top = '0';
    fileInput.style.opacity = '0.001';
    document.body.appendChild(fileInput);

    const changeHandler = (e) => {
      resolve(Array.prototype.slice.call((e.target as any).files));
    };

    fileInput.addEventListener('change', changeHandler);

    const cancelHandler = () => {
      resolve([]);
      fileInput.parentNode.removeChild(fileInput);
      editor.off('focusin remove', cancelHandler);
    };

    editor.on('focusin remove', cancelHandler);

    fileInput.click();
  });
};

export default {
  pickFile
};