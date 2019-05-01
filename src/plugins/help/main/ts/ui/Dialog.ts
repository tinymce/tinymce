/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Types } from '@ephox/bridge';
import { Arr, Cell, Obj, Option, Options } from '@ephox/katamari';
import Editor from 'tinymce/core/api/Editor';
import * as Settings from '../api/Settings';

export type TabSpec = {
  title: string,
  items: Types.Dialog.BodyComponentApi[];
};

export type HelpTabSpec = {
  name: string,
  spec: TabSpec;
};

const parseHelpTabsSetting = (tabsFromSettings: Settings.HelpTabsSetting, customTabs: Cell<Record<string, TabSpec>>): string[] => {
  const tabs: Record<string, TabSpec> = customTabs.get();
  const names = Arr.map(tabsFromSettings, (tab) => {
    if (typeof tab === 'string') {
      return tab;
    } else {
      // Assume this is a HelpTabSpec
      tabs[tab.name] = tab.spec;
      return tab.name;
    }
  });
  customTabs.set(tabs);
  return names;
};

const getNamesFromTabs = (customTabs: Cell<Record<string, TabSpec>>): string[] => {
  const tabs = customTabs.get();
  const names = Obj.keys(tabs);
  return names;
};

const parseCustomTabs = (editor: Editor, customTabs: Cell<Record<string, TabSpec>>) => {
  const tabNames: string[] = Settings.getHelpTabs(editor).fold(
    () => getNamesFromTabs(customTabs),
    (tabsFromSettings: Settings.HelpTabsSetting) => parseHelpTabsSetting(tabsFromSettings, customTabs)
  );

  // Move the versions tab to the end if it exists
  const versionsIdx = Arr.indexOf(tabNames, 'versions');
  versionsIdx.each((idx) => {
    tabNames.splice(idx, 1);
    tabNames.push('versions');
  });

  return tabNames;
};

const init = (editor: Editor, customTabs: Cell<Record<string, TabSpec>>): () => void => {
  return () => {
    const tabSpecs = customTabs.get();
    const tabOrder = parseCustomTabs(editor, customTabs);
    const foundTabs: Option<TabSpec>[] = Arr.map(tabOrder, (name) => {
      return Obj.get(tabSpecs, name);
    });
    const dialogTabs: TabSpec[] = Options.cat(foundTabs);

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
