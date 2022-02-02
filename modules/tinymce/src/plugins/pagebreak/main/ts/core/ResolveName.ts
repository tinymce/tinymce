/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';

import * as FilterContent from './FilterContent';

const setup = (editor: Editor): void => {
  editor.on('ResolveName', (e) => {
    if (e.target.nodeName === 'IMG' && editor.dom.hasClass(e.target, FilterContent.pageBreakClass)) {
      e.name = 'pagebreak';
    }
  });
};

export {
  setup
};
