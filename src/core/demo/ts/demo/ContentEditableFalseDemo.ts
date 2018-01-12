/**
 * ContentEditableFalseDemo.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import EditorManager from 'tinymce/core/EditorManager';
import Tools from 'tinymce/core/util/Tools';
import PastePlugin from 'tinymce/plugins/paste/Plugin';
import ModernTheme from 'tinymce/themes/modern/Theme';

declare const window: any;

export default function () {
  ModernTheme();
  PastePlugin();

  const paintClientRect = function (rect, color, id) {
    const editor = EditorManager.activeEditor;
    const $ = editor.$;
    let rectDiv;
    const viewPort = editor.dom.getViewPort();

    if (!rect) {
      return;
    }

    color = color || 'red';
    id = id || color;
    rectDiv = $('#' + id);

    if (!rectDiv[0]) {
      rectDiv = $('<div></div>').appendTo(editor.getBody());
    }

    rectDiv.attr('id', id).css({
      position: 'absolute',
      left: (rect.left + viewPort.x) + 'px',
      top: (rect.top + viewPort.y) + 'px',
      width: (rect.width || 1) + 'px',
      height: rect.height + 'px',
      background: color,
      opacity: 0.8
    });
  };

  const paintClientRects = function (rects, color) {
    Tools.each(rects, function (rect, index) {
      paintClientRect(rect, color, color + index);
    });
  };

  const logPos = function (caretPosition) {
    const container = caretPosition.container(),
      offset = caretPosition.offset();

    if (container.nodeType === 3) {
      if (container.data[offset]) {
        console.log(container.data[offset]);
      } else {
        console.log('<end of text node>');
      }
    } else {
      console.log(container, offset, caretPosition.getNode());
    }
  };

  window.paintClientRect = paintClientRect;
  window.paintClientRects = paintClientRects;
  window.logPos = logPos;

  EditorManager.init({
    selector: 'textarea.tinymce',
    skin_url: '../../../../js/tinymce/skins/lightgray',
    add_unload_trigger: false,
    toolbar: 'insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify' +
    ' | bullist numlist outdent indent | link image | print preview media fullpage | forecolor backcolor emoticons table codesample',
    plugins: ['paste'],
    content_css: '../css/content_editable.css',
    height: 400
  });

  EditorManager.init({
    selector: 'div.tinymce',
    inline: true,
    skin_url: '../../../../js/tinymce/skins/lightgray',
    add_unload_trigger: false,
    toolbar: 'insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify' +
    ' | bullist numlist outdent indent | link image | print preview media fullpage | forecolor backcolor emoticons table codesample',
    plugins: ['paste'],
    content_css: '../css/content_editable.css'
  });

  window.tinymce = EditorManager;
}