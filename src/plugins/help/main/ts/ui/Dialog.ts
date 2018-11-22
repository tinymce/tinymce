/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
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