/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';
const genericBase = {
  remove_similar: true,
  inherit: false
};

const cellBase = {
  selector: 'td,th',
  ...genericBase
};

const cellFormats = {
  tablecellbackgroundcolor: {
    styles: { backgroundColor: '%value' },
    ...cellBase
  },
  tablecellverticalalign: {
    styles: {
      'vertical-align': '%value'
    },
    ...cellBase
  },
  tablecellbordercolor: {
    styles: { borderColor: '%value' },
    ...cellBase
  },
  tablecellclass: {
    classes: [ '%value' ],
    ...cellBase
  },
  tableclass: {
    selector: 'table',
    classes: [ '%value' ],
    ...genericBase
  },
  tablecellborderstyle: {
    styles: { borderStyle: '%value' },
    ...cellBase
  },
  tablecellborderwidth: {
    styles: { borderWidth: '%value' },
    ...cellBase
  }
};

const registerFormats = (editor: Editor): void => {
  editor.formatter.register(cellFormats);
};

export {
  registerFormats
};
