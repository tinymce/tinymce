/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';

import * as Utils from '../util/Utils';
import * as Prism from './Prism';

const setup = (editor: Editor): void => {
  const $ = editor.$;

  editor.on('PreProcess', (e) => {
    $('pre[contenteditable=false]', e.node)
      .filter(Utils.trimArg(Utils.isCodeSample))
      .each((idx, elm) => {
        const $elm = $(elm), code = elm.textContent;

        $elm.attr('class', $.trim($elm.attr('class')));
        $elm.removeAttr('contentEditable');

        $elm.empty().append($('<code></code>').each(function () {
          // Needs to be textContent since innerText produces BR:s
          this.textContent = code;
        }));
      });
  });

  editor.on('SetContent', () => {
    const unprocessedCodeSamples = $('pre').filter(Utils.trimArg(Utils.isCodeSample)).filter((idx, elm) => {
      return elm.contentEditable !== 'false';
    });

    if (unprocessedCodeSamples.length) {
      editor.undoManager.transact(() => {
        unprocessedCodeSamples.each((idx, elm: HTMLElement) => {
          $(elm).find('br').each((idx, elm) => {
            elm.parentNode.replaceChild(editor.getDoc().createTextNode('\n'), elm);
          });

          elm.contentEditable = 'false';
          elm.innerHTML = editor.dom.encode(elm.textContent);
          Prism.get(editor).highlightElement(elm);
          elm.className = $.trim(elm.className);
        });
      });
    }
  });
};

export {
  setup
};
