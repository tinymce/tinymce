/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';
import Tools from 'tinymce/core/api/util/Tools';

import * as Options from '../api/Options';

const setup = (editor: Editor): void => {
  const tocClass = Options.getTocClass(editor);

  editor.on('PreProcess', (e) => {
    const dom = editor.dom;
    const tocElm = dom.select('.' + tocClass, e.node)[0];
    if (tocElm) {
      const ceElems = [ tocElm ].concat(dom.select('[contenteditable]', tocElm));
      Tools.each(ceElems, (ceElem) => {
        dom.setAttrib(ceElem, 'contentEditable', null);
      });
    }
  });

  editor.on('SetContent', () => {
    const dom = editor.dom;
    const tocElm = dom.select('.' + tocClass)[0];
    if (tocElm) {
      dom.setAttrib(tocElm, 'contentEditable', false);
      dom.setAttrib(tocElm.firstElementChild, 'contentEditable', true);
    }
  });
};

export {
  setup
};
