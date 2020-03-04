/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import * as FilterContent from './FilterContent';

const setup = function (editor) {
  editor.on('ResolveName', function (e) {
    if (e.target.nodeName === 'IMG' && editor.dom.hasClass(e.target, FilterContent.getPageBreakClass())) {
      e.name = 'pagebreak';
    }
  });
};

export {
  setup
};
