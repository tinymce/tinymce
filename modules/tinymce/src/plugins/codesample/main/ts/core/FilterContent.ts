import { Strings } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import Tools from 'tinymce/core/api/util/Tools';

import * as Prism from '../prism/Prism';
import * as Utils from '../util/Utils';

const setup = (editor: Editor): void => {
  editor.on('PreProcess', (e) => {
    const dom = editor.dom;
    const pres = dom.select('pre[contenteditable=false]', e.node);
    Tools.each(Tools.grep<HTMLElement>(pres, Utils.isCodeSample), (elm) => {
      const code = elm.textContent;

      dom.setAttrib(elm, 'class', Strings.trim(dom.getAttrib(elm, 'class')));
      dom.setAttrib(elm, 'contentEditable', null);

      // Empty the pre element
      let child: Node;
      while ((child = elm.firstChild)) {
        elm.removeChild(child);
      }

      const codeElm = dom.add(elm, 'code');
      // Needs to be textContent since innerText produces BR:s
      codeElm.textContent = code;
    });
  });

  editor.on('SetContent', () => {
    const dom = editor.dom;
    const unprocessedCodeSamples = Tools.grep(dom.select('pre'), (elm) => {
      return Utils.isCodeSample(elm) && elm.contentEditable !== 'false';
    });

    if (unprocessedCodeSamples.length) {
      editor.undoManager.transact(() => {
        Tools.each(unprocessedCodeSamples, (elm) => {
          Tools.each(dom.select('br', elm), (elm) => {
            elm.parentNode.replaceChild(editor.getDoc().createTextNode('\n'), elm);
          });

          elm.contentEditable = 'false';
          elm.innerHTML = dom.encode(elm.textContent);
          Prism.get(editor).highlightElement(elm);
          elm.className = Strings.trim(elm.className);
        });
      });
    }
  });
};

export {
  setup
};
