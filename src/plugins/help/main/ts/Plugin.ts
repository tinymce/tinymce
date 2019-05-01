/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Cell } from '@ephox/katamari';
import PluginManager from 'tinymce/core/api/PluginManager';
import * as Api from './api/Api';
import Commands from './api/Commands';
import Buttons from './ui/Buttons';
import * as Dialog from './ui/Dialog';
import KeyboardShortcutsTab from './ui/KeyboardShortcutsTab';
import PluginsTab from './ui/PluginsTab';
import VersionTab from './ui/VersionTab';

PluginManager.add('help', (editor) => {
  const customTabs = Cell<Record<string, Dialog.TabSpec>>({});
  const api = Api.get(customTabs);

  api.addTab('shortcuts', KeyboardShortcutsTab.tab());
  api.addTab('plugins', PluginsTab.tab(editor));
  api.addTab('versions', VersionTab.tab());

  const dialogOpener: () => void = Dialog.init(editor, customTabs);
  Buttons.register(editor, dialogOpener);
  Commands.register(editor, dialogOpener);
  editor.shortcuts.add('Alt+0', 'Open help dialog', 'mceHelp');

  return api;
});

export default () => {};