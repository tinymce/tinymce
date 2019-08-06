/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Types } from '@ephox/bridge';
import { Arr, Obj, Option, Options } from '@ephox/katamari';
import Editor from 'tinymce/core/api/Editor';
import * as Settings from '../api/Settings';
import { CustomTabSpecs, TabSpecs } from '../Plugin';
import KeyboardShortcutsTab from './KeyboardShortcutsTab';
import PluginsTab from './PluginsTab';
import VersionTab from './VersionTab';
import KeyboardNavTab from './KeyboardNavTab';

interface TabData {
  tabs: TabSpecs;
  names: string[];
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
  return {tabs: newTabs, names};
};

const getNamesFromTabs = (tabs: TabSpecs): TabData => {
  const names = Obj.keys(tabs);

  // Move the versions tab to the end if it exists
  const versionsIdx = Arr.indexOf(names, 'versions');
  versionsIdx.each((idx) => {
    names.splice(idx, 1);
    names.push('versions');
  });

  return {tabs, names};
};

const parseCustomTabs = (editor: Editor, customTabs: CustomTabSpecs) => {
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

const init = (editor: Editor, customTabs: CustomTabSpecs): () => void => {
  return () => {
    // const tabSpecs: Record<string, Types.Dialog.TabApi> = customTabs.get();
    const {tabs, names} = parseCustomTabs(editor, customTabs);
    const foundTabs: Option<Types.Dialog.TabApi>[] = Arr.map(names, (name) => {
      return Obj.get(tabs, name);
    });
    const dialogTabs: Types.Dialog.TabApi[] = Options.cat(foundTabs);

    const body: Types.Dialog.TabPanelApi = {
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
};

export { init };