import { Arr, Cell, Obj, Optional, Optionals, Singleton } from '@ephox/katamari';

import { AlloyComponent } from '../../api/component/ComponentApi';
import { MenuPreparation } from '../../ui/single/TieredMenuSpec';
import * as MenuPathing from './MenuPathing';

// Object indexed by menu value. Each entry has a list of item values.
export type MenuDirectory = Record<string, string[]>;

// A tuple of (item, menu). This can be used to refresh the menu and position them next to the right
// triggering items.
export interface LayeredItemTrigger {
  readonly triggeringItem: AlloyComponent;
  readonly triggeredMenu: AlloyComponent;
  readonly triggeringPath: string[];
}

export interface LayeredState {
  setContents: (sPrimary: string, sMenus: Record<string, MenuPreparation>, sExpansions: Record<string, string>, dir: MenuDirectory) => void;
  setMenuBuilt: (menuName: string, built: AlloyComponent) => void;
  expand: (itemValue: string) => Optional<string[]>;
  refresh: (itemValue: string) => Optional<string[]>;
  collapse: (itemValue: string) => Optional<string[]>;
  lookupMenu: (menuValue: string) => Optional<MenuPreparation>;
  lookupItem: (itemValue: string) => Optional<string>;
  otherMenus: (path: string[]) => string[];
  getPrimary: () => Optional<AlloyComponent>;
  getMenus: () => Record<string, MenuPreparation>;
  clear: () => void;
  isClear: () => boolean;
  getTriggeringPath: (itemValue: string, getItemByValue: (itemValue: string) => Optional<AlloyComponent>) => Optional<LayeredItemTrigger[]>;
}

const init = (): LayeredState => {
  const expansions: Cell<Record<string, string>> = Cell({ });
  const menus: Cell<Record<string, MenuPreparation>> = Cell({ });
  const paths: Cell<Record<string, string[]>> = Cell({ });
  const primary = Singleton.value<string>();

  // Probably think of a better way to store this information.
  const directory: Cell<MenuDirectory> = Cell({ });

  const clear = (): void => {
    expansions.set({});
    menus.set({});
    paths.set({});
    primary.clear();
  };

  const isClear = (): boolean => primary.get().isNone();

  const setMenuBuilt = (menuName: string, built: AlloyComponent) => {
    menus.set({
      ...menus.get(),
      [menuName]: {
        type: 'prepared',
        menu: built
      }
    });
  };

  const setContents = (sPrimary: string, sMenus: Record<string, MenuPreparation>, sExpansions: Record<string, string>, dir: MenuDirectory): void => {
    primary.set(sPrimary);
    expansions.set(sExpansions);
    menus.set(sMenus);
    directory.set(dir);
    const sPaths = MenuPathing.generate(dir, sExpansions);
    paths.set(sPaths);
  };

  const getTriggeringItem = (menuValue: string): Optional<string> => Obj.find(expansions.get(), (v, _k) => v === menuValue);

  const getTriggerData = (menuValue: string, getItemByValue: (v: string) => Optional<AlloyComponent>, path: string[]): Optional<LayeredItemTrigger> =>
    getPreparedMenu(menuValue).bind((menu) => getTriggeringItem(menuValue).bind((triggeringItemValue) => getItemByValue(triggeringItemValue).map((triggeredItem) => ({
      triggeredMenu: menu,
      triggeringItem: triggeredItem,
      triggeringPath: path
    }))));

  const getTriggeringPath = (itemValue: string, getItemByValue: (v: string) => Optional<AlloyComponent>): Optional<LayeredItemTrigger[]> => {
    // Get the path up to the last item
    const extraPath: string[] = Arr.filter(lookupItem(itemValue).toArray(), (menuValue) => getPreparedMenu(menuValue).isSome());

    return Obj.get(paths.get(), itemValue).bind((path) => {
      // remember the path is [ most-recent-menu, next-most-recent-menu ]
      // convert each menu identifier into { triggeringItem: comp, menu: comp }

      // could combine into a fold ... probably a left to reverse ... but we'll take the
      // straightforward version when prototyping
      const revPath = Arr.reverse(extraPath.concat(path));

      const triggers: Array<Optional<LayeredItemTrigger>> = Arr.bind(revPath, (menuValue, menuIndex) =>
        // finding menuValue, it should match the trigger
        getTriggerData(menuValue, getItemByValue, revPath.slice(0, menuIndex + 1)).fold(
          () => Optionals.is(primary.get(), menuValue) ? [ ] : [ Optional.none() ],
          (data) => [ Optional.some(data) ]
        )
      );

      // Convert List<Optional<X>> to Optional<List<X>> if ALL are Some
      return Optionals.sequence(triggers);
    });
  };

  // Given an item, return a list of all menus including the one that it triggered (if there is one)
  const expand = (itemValue: string): Optional<string[]> => Obj.get(expansions.get(), itemValue).map((menu: string) => {
    const current: string[] = Obj.get(paths.get(), itemValue).getOr([ ]);
    return [ menu ].concat(current);
  });

  const collapse = (itemValue: string): Optional<string[]> =>
    // Look up which key has the itemValue
    Obj.get(paths.get(), itemValue).bind((path) => path.length > 1 ? Optional.some(path.slice(1)) : Optional.none());

  const refresh = (itemValue: string): Optional<string[]> => Obj.get(paths.get(), itemValue);

  const getPreparedMenu = (menuValue: string): Optional<AlloyComponent> => lookupMenu(menuValue).bind(extractPreparedMenu);

  const lookupMenu = (menuValue: string): Optional<MenuPreparation> => Obj.get(
    menus.get(),
    menuValue
  );

  const lookupItem = (itemValue: string): Optional<string> => Obj.get(
    expansions.get(),
    itemValue
  );

  const otherMenus = (path: string[]): string[] => {
    const menuValues = directory.get();
    return Arr.difference(Obj.keys(menuValues), path);
  };

  const getPrimary = (): Optional<AlloyComponent> => primary.get().bind(getPreparedMenu);

  const getMenus = (): Record<string, MenuPreparation> => menus.get();

  return {
    setMenuBuilt,
    setContents,
    expand,
    refresh,
    collapse,
    lookupMenu,
    lookupItem,
    otherMenus,
    getPrimary,
    getMenus,
    clear,
    isClear,
    getTriggeringPath
  };
};

const extractPreparedMenu = (prep: MenuPreparation): Optional<AlloyComponent> => prep.type === 'prepared' ? Optional.some(prep.menu) : Optional.none();

export const LayeredState = {
  init,
  extractPreparedMenu
};
