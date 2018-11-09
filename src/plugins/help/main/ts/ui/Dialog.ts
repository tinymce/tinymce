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
import VersionTab from './VersionTab';

const opener = function (editor, pluginUrl) {
  return function () {
    editor.windowManager.open(
      {
        title: 'Help',
        size: 'medium',
        body: {
          type: 'tabpanel',
          tabs: [
            KeyboardShortcutsTab.tab(),
            PluginsTab.tab(editor),
            VersionTab.tab()
          ]
        },
        buttons: [
          {
            type: 'cancel',
            name: 'close',
            text: 'Close',
            primary: true
          }
        ],
        initialData: {}
      }
    );
  };
};

export default {
  opener
};