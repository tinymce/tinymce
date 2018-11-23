/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
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