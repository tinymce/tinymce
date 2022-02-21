import { Fun, Optional, Optionals } from '@ephox/katamari';

import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Editor from 'tinymce/core/api/Editor';

import * as Prism from '../prism/Prism';
import * as Utils from '../util/Utils';

const getSelectedCodeSample = (editor: Editor): Optional<Element> => {
  const node = editor.selection ? editor.selection.getNode() : null;
  return Optionals.someIf(Utils.isCodeSample(node), node);
};

const insertCodeSample = (editor: Editor, language: string, code: string): void => {
  const dom = editor.dom;
  editor.undoManager.transact(() => {
    const node = getSelectedCodeSample(editor);

    code = DOMUtils.DOM.encode(code);

    return node.fold(() => {
      editor.insertContent('<pre id="__new" class="language-' + language + '">' + code + '</pre>');
      const newPre = dom.select('#__new')[0];
      dom.setAttrib(newPre, 'id', null);
      editor.selection.select(newPre);
    }, (n) => {
      dom.setAttrib(n, 'class', 'language-' + language);
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
