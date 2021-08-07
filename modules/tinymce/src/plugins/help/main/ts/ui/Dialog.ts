/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Obj, Optional, Optionals } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import { Dialog } from 'tinymce/core/api/ui/Ui';

import * as Settings from '../api/Settings';
import { CustomTabSpecs, TabSpecs } from '../Plugin';
import * as KeyboardNavTab from './KeyboardNavTab';
import * as KeyboardShortcutsTab from './KeyboardShortcutsTab';
import * as PluginsTab from './PluginsTab';
import * as VersionTab from './VersionTab';

interface TabData {
  readonly tabs: TabSpecs;
  readonly names: string[];
}

const parseHelpTabsSetting = (tabsFromSettings: Settings.HelpTabsSetting, tabs: TabSpecs): TabData => {
  const newTabs = {};
  const names = Arr.map(tabsFromSettings, (t) => {
    if (typeof t === 'string') {
      // Code below shouldn't care if a tab name doesn't have a spec.
      // If we find it does, we'll need to make this smarter.
      // CustomTabsTest has a case for this.
      if (Obj.has(tabs, t)) {
        newTabs[t] = tabs[t];
      }
      return t;
    } else {
      newTabs[t.name] = t;
      return t.name;
    }
  });
  return { tabs: newTabs, names };
};

const getNamesFromTabs = (tabs: TabSpecs): TabData => {
  const names = Obj.keys(tabs);

  // Move the versions tab to the end if it exists
  const idx = names.indexOf('versions');
  if (idx !== -1) {
    names.splice(idx, 1);
    names.push('versions');
  }

  return { tabs, names };
};

const parseCustomTabs = (editor: Editor, customTabs: CustomTabSpecs): TabData => {
  const shortcuts = KeyboardShortcutsTab.tab();
  const nav = KeyboardNavTab.tab();
  const plugins = PluginsTab.tab(editor);
  const versions = VersionTab.tab();
  const tabs = {
    [shortcuts.name]: shortcuts,
    [nav.name]: nav,
    [plugins.name]: plugins,
    [versions.name]: versions,
    ...customTabs.get()
  };

  return Settings.getHelpTabs(editor).fold(
    () => getNamesFromTabs(tabs),
    (tabsFromSettings: Settings.HelpTabsSetting) => parseHelpTabsSetting(tabsFromSettings, tabs)
  );
};

const init = (editor: Editor, customTabs: CustomTabSpecs) => (): void => {
  // const tabSpecs: Record<string, Types.Dialog.TabApi> = customTabs.get();
  const { tabs, names } = parseCustomTabs(editor, customTabs);
  const foundTabs: Optional<Dialog.TabSpec>[] = Arr.map(names, (name) => Obj.get(tabs, name));
  const dialogTabs: Dialog.TabSpec[] = Optionals.cat(foundTabs);

  const body: Dialog.TabPanelSpec = {
    type: 'tabpanel',
    tabs: dialogTabs
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

export { init };
