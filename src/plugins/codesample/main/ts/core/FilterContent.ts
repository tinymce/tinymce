/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { HTMLElement } from '@ephox/dom-globals';
import Prism from './Prism';
import Utils from '../util/Utils';
import Editor from 'tinymce/core/api/Editor';

const setup = function (editor: Editor) {
  const $ = editor.$;

  editor.on('PreProcess', function (e) {
    $('pre[contenteditable=false]', e.node).
      filter(Utils.trimArg(Utils.isCodeSample)).
      each(function (idx, elm) {
        const $elm = $(elm), code = elm.textContent;

        $elm.attr('class', $.trim($elm.attr('class')));
        $elm.removeAttr('contentEditable');

        $elm.empty().append($('<code></code>').each(function () {
          // Needs to be textContent since innerText produces BR:s
          this.textContent = code;
        }));
      });
  });

  editor.on('SetContent', function () {
    const unprocessedCodeSamples = $('pre').filter(Utils.trimArg(Utils.isCodeSample)).filter(function (idx, elm) {
      return elm.contentEditable !== 'false';
    });

    if (unprocessedCodeSamples.length) {
      editor.undoManager.transact(function () {
        unprocessedCodeSamples.each(function (idx, elm: HTMLElement) {
          $(elm).find('br').each(function (idx, elm) {
            elm.parentNode.replaceChild(editor.getDoc().createTextNode('\n'), elm);
          });

          elm.contentEditable = 'false';
          elm.innerHTML = editor.dom.encode(elm.textContent);
          Prism.highlightElement(elm);
          elm.className = $.trim(elm.className);
        });
      });
    }
  });
};

export default {
  setup
};