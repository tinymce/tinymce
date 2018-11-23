/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Editor } from 'tinymce/core/api/Editor';
import KeyboardShortcutsTab from './KeyboardShortcutsTab';
import PluginsTab from './PluginsTab';
import VersionTab from './VersionTab';

const opener = function (editor: Editor, pluginUrl) {
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