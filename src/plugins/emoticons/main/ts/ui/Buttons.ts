/**
 * Buttons.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import PanelHtml from './PanelHtml';

const insertEmoticon = function (editor, src, alt) {
  editor.insertContent(editor.dom.createHTML('img', { src, alt }));
};

const register = function (editor, pluginUrl) {
  const panelHtml = PanelHtml.getHtml(pluginUrl);

  editor.addButton('emoticons', {
    type: 'panelbutton',
    panel: {
      role: 'application',
      autohide: true,
      html: panelHtml,
      onclick (e) {
        const linkElm = editor.dom.getParent(e.target, 'a');
        if (linkElm) {
          insertEmoticon(editor, linkElm.getAttribute('data-mce-url'), linkElm.getAttribute('data-mce-alt'));
          this.hide();
        }
      }
    },
    tooltip: 'Emoticons'
  });
};

export default {
  register
};