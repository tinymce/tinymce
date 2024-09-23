import { Arr, Id, Obj, Optional, Optionals, Type } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import { Dialog } from 'tinymce/core/api/ui/Ui';

import * as Options from '../api/Options';
import { CustomTabSpecs, TabSpecs } from '../Plugin';
import * as KeyboardNavTab from './KeyboardNavTab';
import * as KeyboardShortcutsTab from './KeyboardShortcutsTab';
import * as PluginsTab from './PluginsTab';
import * as VersionTab from './VersionTab';

interface TabData {
  readonly tabs: TabSpecs;
  readonly names: string[];
}

const parseHelpTabsSetting = (tabsFromSettings: Options.HelpTabsSetting, tabs: TabSpecs): TabData => {
  const newTabs: Record<string, any> = {};
  const names = Arr.map(tabsFromSettings, (t) => {
    if (Type.isString(t)) {
      // Code below shouldn't care if a tab name doesn't have a spec.
      // If we find it does, we'll need to make this smarter.
      // CustomTabsTest has a case for this.
      if (Obj.has(tabs, t)) {
        newTabs[t] = tabs[t];
      }
      return t;
    } else {
      const name = t.name ?? Id.generate('tab-name');
      newTabs[name] = t;
      return name;
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

const pParseCustomTabs = async (editor: Editor, customTabs: CustomTabSpecs, pluginUrl: string): Promise<TabData> => {
  const shortcuts = KeyboardShortcutsTab.tab();
  const nav = await KeyboardNavTab.pTab(pluginUrl);
  const plugins = PluginsTab.tab(editor);
  const versions = VersionTab.tab();
  const tabs = {
    [shortcuts.name]: shortcuts,
    [nav.name]: nav,
    [plugins.name]: plugins,
    [versions.name]: versions,
    ...customTabs.get()
  };

  return Optional.from(Options.getHelpTabs(editor)).fold(
    () => getNamesFromTabs(tabs),
    (tabsFromSettings: Options.HelpTabsSetting) => parseHelpTabsSetting(tabsFromSettings, tabs)
  );
};

const init = (editor: Editor, customTabs: CustomTabSpecs, pluginUrl: string) => (): void => {
  pParseCustomTabs(editor, customTabs, pluginUrl).then(({ tabs, names }) => {
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
  });
};

export { init };
