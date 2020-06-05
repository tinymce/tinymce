/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';

const cellFormats = {
  tablecellbackgroundcolor: {
    selector: 'td,th',
    styles: { backgroundColor: '%value' },
    remove_similar: true
  },
  tablecellbordercolor: {
    selector: 'td,th',
    styles: { borderColor: '%value' },
    remove_similar: true
  },
  tablecellborderstyle: {
    selector: 'td,th',
    styles: { borderStyle: '%value' },
    remove_similar: true
  },
  tablecellborderwidth: {
    selector: 'td,th',
    styles: { borderWidth: '%value' },
    remove_similar: true
  }
};

const registerFormats = (editor: Editor) => {
  editor.formatter.register(cellFormats);
};

export {
  registerFormats
};
