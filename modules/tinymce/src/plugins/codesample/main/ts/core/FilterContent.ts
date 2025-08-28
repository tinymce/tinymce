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
      dom.setAttrib(elm, 'data-mce-highlighted', null);

      // Empty the pre element
      let child: Node | null;
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
      return Utils.isCodeSample(elm) && dom.getAttrib(elm, 'data-mce-highlighted') !== 'true';
    });

    if (unprocessedCodeSamples.length) {
      editor.undoManager.transact(() => {
        Tools.each(unprocessedCodeSamples, (elm) => {
          Tools.each(dom.select('br', elm), (elm) => {
            dom.replace(editor.getDoc().createTextNode('\n'), elm);
          });

          elm.innerHTML = dom.encode(elm.textContent ?? '');
          Prism.get(editor).highlightElement(elm);
          dom.setAttrib(elm, 'data-mce-highlighted', true);
          elm.className = Strings.trim(elm.className);
        });
      });
    }
  });

  editor.on('PreInit', () => {
    editor.parser.addNodeFilter('pre', (nodes) => {
      for (let i = 0, l = nodes.length; i < l; i++) {
        const node = nodes[i];
        const isCodeSample = (node.attr('class') ?? '').indexOf('language-') !== -1;
        if (isCodeSample) {
          node.attr('contenteditable', 'false');
          node.attr('data-mce-highlighted', 'false');
        }
      }
    });
  });
};

export {
  setup
};
