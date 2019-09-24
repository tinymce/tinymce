/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Prism from './Prism';
import Utils from '../util/Utils';
import { Option } from '@ephox/katamari';
import Editor from 'tinymce/core/api/Editor';
import { Element } from '@ephox/dom-globals';

const getSelectedCodeSample = (editor: Editor) => {
  const node = editor.selection ? editor.selection.getNode() : null;

  if (Utils.isCodeSample(node)) {
    return Option.some(node);
  }

  return Option.none<Element>();
};

const insertCodeSample = (editor: Editor, language: string, code: string) => {
  editor.undoManager.transact(() => {
    const node = getSelectedCodeSample(editor);

    code = DOMUtils.DOM.encode(code);

    return node.fold(() => {
      editor.insertContent('<pre id="__new" class="language-' + language + '">' + code + '</pre>');
      editor.selection.select(editor.$('#__new').removeAttr('id')[0]);
    }, (n) => {
      editor.dom.setAttrib(n, 'class', 'language-' + language);
      n.innerHTML = code;
      Prism.highlightElement(n);
      editor.selection.select(n);
    });
  });
};

const getCurrentCode = (editor: Editor): string => {
  const node = getSelectedCodeSample(editor);
  return node.fold(() => '', (n) => n.textContent);
};

export default {
  getSelectedCodeSample,
  insertCodeSample,
  getCurrentCode
};
