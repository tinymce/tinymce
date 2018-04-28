/**
 * Selection.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import UpdateHtml from './UpdateHtml';

declare let escape: any;
declare let unescape: any;

const setup = function (editor) {
  editor.on('click keyup', function () {
    const selectedNode = editor.selection.getNode();

    if (selectedNode && editor.dom.hasClass(selectedNode, 'mce-preview-object')) {
      if (editor.dom.getAttrib(selectedNode, 'data-mce-selected')) {
        selectedNode.setAttribute('data-mce-selected', '2');
      }
    }
  });

  editor.on('ObjectSelected', function (e) {
    const objectType = e.target.getAttribute('data-mce-object');

    if (objectType === 'audio' || objectType === 'script') {
      e.preventDefault();
    }
  });

  editor.on('objectResized', function (e) {
    const target = e.target;
    let html;

    if (target.getAttribute('data-mce-object')) {
      html = target.getAttribute('data-mce-html');
      if (html) {
        html = unescape(html);
        target.setAttribute('data-mce-html', escape(
          UpdateHtml.updateHtml(html, {
            width: e.width,
            height: e.height
          })
        ));
      }
    }
  });
};

export default {
  setup
};