/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';

import * as UpdateHtml from './UpdateHtml';

declare let escape: any;
declare let unescape: any;

const isMediaElement = (element: Element): boolean =>
  element.hasAttribute('data-mce-object') || element.hasAttribute('data-ephox-embed-iri');

const setup = (editor: Editor): void => {
  editor.on('click keyup touchend', () => {
    const selectedNode = editor.selection.getNode();

    if (selectedNode && editor.dom.hasClass(selectedNode, 'mce-preview-object')) {
      if (editor.dom.getAttrib(selectedNode, 'data-mce-selected')) {
        selectedNode.setAttribute('data-mce-selected', '2');
      }
    }
  });

  editor.on('ObjectSelected', (e) => {
    const objectType = e.target.getAttribute('data-mce-object');

    if (objectType === 'script') {
      e.preventDefault();
    }
  });

  editor.on('ObjectResized', (e) => {
    const target = e.target;

    if (target.getAttribute('data-mce-object')) {
      let html = target.getAttribute('data-mce-html');
      if (html) {
        html = unescape(html);
        target.setAttribute('data-mce-html', escape(
          UpdateHtml.updateHtml(html, {
            width: String(e.width),
            height: String(e.height)
          })
        ));
      }
    }
  });
};

export {
  setup,
  isMediaElement
};
