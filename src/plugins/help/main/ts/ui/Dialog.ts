/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Types } from '@ephox/bridge';
import Editor from 'tinymce/core/api/Editor';
import KeyboardShortcutsTab from './KeyboardShortcutsTab';
import PluginsTab from './PluginsTab';
import VersionTab from './VersionTab';
import Settings from '../api/Settings';
import { Arr, Cell } from '@ephox/katamari';

const init = (editor: Editor, extraApiTabs: Cell<any>) => {
  return () => {
    const tabsFromSettings = Settings.getExtraTabs(editor);
    const tabsFromApi = extraApiTabs.get();
    const tabs = Arr.flatten([
      [
        KeyboardShortcutsTab.tab(),
        PluginsTab.tab(editor),
      ],
      tabsFromSettings,
      tabsFromApi,
      [ VersionTab.tab(editor) ]
    ]);
    const body: Types.Dialog.TabPanelApi = {
      type: 'tabpanel',
      tabs
    };
    editor.windowManager.open(
      {
        title: 'Help',
        size: 'medium',
        body,
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
  init
};