import { Objects } from '@ephox/boulder';
import { Arr, Cell, Obj, Option } from '@ephox/katamari';

import { AlloyComponent } from '../../api/component/ComponentApi';
import { MenuPreparation } from '../../ui/single/TieredMenuSpec';
import * as MenuPathing from './MenuPathing';

// Object indexed by menu value. Each entry has a list of item values.
export type MenuDirectory = Record<string, string[]>;

export interface LayeredState {
  setContents: (sPrimary: string, sMenus: Record<string, MenuPreparation>, sExpansions: Record<string, string>, dir: MenuDirectory) => void;
  setMenuBuilt: (menuName: string, built: AlloyComponent) => void;
  expand: (itemValue: string) => Option<string[]>;
  refresh: (itemValue: string) => Option<string[]>;
  collapse: (itemValue: string) => Option<string[]>;
  lookupMenu: (menuValue: string) => Option<MenuPreparation>;
  otherMenus: (path: string[]) => string[];
  getPrimary: () => Option<AlloyComponent>;
  getMenus: () => Record<string, MenuPreparation>;
  clear: () => void;
  isClear: () => boolean;
}

const init = (): LayeredState => {
  const expansions: Cell<Record<string, string>> = Cell({ });
  const menus: Cell<Record<string, MenuPreparation>> = Cell({ });
  const paths: Cell<Record<string, string[]>> = Cell({ });
  const primary: Cell<Option<string>> = Cell(Option.none());

  // Probably think of a better way to store this information.
  const directory: Cell<MenuDirectory> = Cell({ });

  const clear = (): void => {
    expansions.set({});
    menus.set({});
    paths.set({});
    primary.set(Option.none());
  };

  const isClear = (): boolean => {
    return primary.get().isNone();
  };

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
    primary.set(Option.some(sPrimary));
    expansions.set(sExpansions);
    menus.set(sMenus);
    directory.set(dir);
    const sPaths = MenuPathing.generate(dir, sExpansions);
    paths.set(sPaths);
  };

  // Given an item, return a list of all menus including the one that it triggered (if there is one)
  const expand = (itemValue: string): Option<string[]> => {
    return Objects.readOptFrom<string>(expansions.get(), itemValue).map((menu: string) => {
      const current: string[] = Objects.readOptFrom<string[]>(paths.get(), itemValue).getOr([ ]);
      return [ menu ].concat(current);
    });
  };

  const collapse = (itemValue: string): Option<string[]> => {
    // Look up which key has the itemValue
    return Objects.readOptFrom<string[]>(paths.get(), itemValue).bind((path) => {
      return path.length > 1 ? Option.some(path.slice(1)) : Option.none();
    });
  };

  const refresh = (itemValue: string): Option<string[]> => {
    return Objects.readOptFrom<string[]>(paths.get(), itemValue);
  };

  const lookupMenu = (menuValue: string): Option<MenuPreparation> => {
    return Objects.readOptFrom<MenuPreparation>(
      menus.get(),
      menuValue
    );
  };

  const otherMenus = (path: string[]): string[] => {
    const menuValues = directory.get();
    return Arr.difference(Obj.keys(menuValues), path);
  };

  const getPrimary = (): Option<AlloyComponent> => {
    return primary.get().bind((primaryName) => {
      return lookupMenu(primaryName).bind((prep) => {
        return prep.type === 'prepared' ? Option.some(prep.menu) : Option.none();
      });
    });
  };

  const getMenus = (): Record<string, MenuPreparation> => {
    return menus.get();
  };

  return {
    setMenuBuilt,
    setContents,
    expand,
    refresh,
    collapse,
    lookupMenu,
    otherMenus,
    getPrimary,
    getMenus,
    clear,
    isClear
  };
};

export const LayeredState = {
  init
};
