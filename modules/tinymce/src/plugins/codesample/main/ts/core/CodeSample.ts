/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Fun, Optional, Optionals } from '@ephox/katamari';

import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Editor from 'tinymce/core/api/Editor';

import * as Utils from '../util/Utils';
import * as Prism from './Prism';

const getSelectedCodeSample = (editor: Editor): Optional<Element> => {
  const node = editor.selection ? editor.selection.getNode() : null;
  return Optionals.someIf(Utils.isCodeSample(node), node);
};

const insertCodeSample = (editor: Editor, language: string, code: string): void => {
  editor.undoManager.transact(() => {
    const node = getSelectedCodeSample(editor);

    code = DOMUtils.DOM.encode(code);

    return node.fold(() => {
      editor.insertContent('<pre id="__new" class="language-' + language + '">' + code + '</pre>');
      editor.selection.select(editor.$('#__new').removeAttr('id')[0]);
    }, (n) => {
      editor.dom.setAttrib(n, 'class', 'language-' + language);
      n.innerHTML = code;
      Prism.get(editor).highlightElement(n);
      editor.selection.select(n);
    });
  });
};

const getCurrentCode = (editor: Editor): string => {
  const node = getSelectedCodeSample(editor);
  return node.fold(Fun.constant(''), (n) => n.textContent);
};

export {
  getSelectedCodeSample,
  insertCodeSample,
  getCurrentCode
};
