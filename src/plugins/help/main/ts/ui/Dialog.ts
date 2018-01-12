/**
 * Dialog.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import KeyboardShortcutsTab from './KeyboardShortcutsTab';
import PluginsTab from './PluginsTab';
import ButtonsRow from './ButtonsRow';

const open = function (editor, pluginUrl) {
  return function () {
    editor.windowManager.open({
      title: 'Help',
      bodyType: 'tabpanel',
      layout: 'flex',
      body: [
        KeyboardShortcutsTab.makeTab(),
        PluginsTab.makeTab(editor)
      ],
      buttons: ButtonsRow.makeRow(),
      onPostRender () {
        const title = this.getEl('title');
        title.innerHTML = '<img src="' + pluginUrl + '/img/logo.png" alt="TinyMCE Logo" style="display: inline-block; width: 200px; height: 50px">';
      }
    });
  };
};

export default {
  open
};