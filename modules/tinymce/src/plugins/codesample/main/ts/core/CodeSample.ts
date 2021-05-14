/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Fun, Maybes } from '@ephox/katamari';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Editor from 'tinymce/core/api/Editor';
import * as Utils from '../util/Utils';
import * as Prism from './Prism';

const getSelectedCodeSample = (editor: Editor) => {
  const node = editor.selection ? editor.selection.getNode() : null;

  if (Utils.isCodeSample(node)) {
    return Maybes.just(node);
  }

  return Maybes.nothing<Element>();
};

const insertCodeSample = (editor: Editor, language: string, code: string) => {
  editor.undoManager.transact(() => {
    const node = getSelectedCodeSample(editor);

    code = DOMUtils.DOM.encode(code);

    if (Maybes.isNothing(node)) {
      editor.insertContent('<pre id="__new" class="language-' + language + '">' + code + '</pre>');
      editor.selection.select(editor.$('#__new').removeAttr('id')[0]);
    } else {
      const n = node.value;
      editor.dom.setAttrib(n, 'class', 'language-' + language);
      n.innerHTML = code;
      Prism.get(editor).highlightElement(n);
      editor.selection.select(n);
    }
  });
};

const getCurrentCode = (editor: Editor): string => {
  return Fun.pipe(
    getSelectedCodeSample(editor),
    Maybes.fold(Fun.constant(''), (n) => n.textContent)
  );
};

export {
  getSelectedCodeSample,
  insertCodeSample,
  getCurrentCode
};
