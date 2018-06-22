import { Objects } from '@ephox/boulder';
import { Arr, Cell, Fun, Obj, Option } from '@ephox/katamari';

import * as MenuPathing from './MenuPathing';
import { AlloyComponent } from '../../api/component/ComponentApi';

// Object indexed by menu value. Each entry has a list of item values.
export type MenuDirectory = Record<string, string[]>;

export interface LayeredState {
  setContents: (sPrimary: string, sMenus: Record<string, AlloyComponent>, sExpansions: Record<string, string>, dir: MenuDirectory) => void;
  expand: (itemValue: string) => Option<string[]>;
  refresh: (itemValue: string) => Option<string[]>;
  collapse: (itemValue: string) => Option<string[]>;
  lookupMenu: (menuValue: string) => Option<AlloyComponent>;
  otherMenus: (path: string[]) => string[];
  getPrimary: () => Option<AlloyComponent>;
  getMenus: () => Record<string, AlloyComponent>;
  clear: () => void;
  isClear: () => boolean;
}

const init = (): LayeredState => {
  const expansions: Cell<Record<string, string>> = Cell({ });
  const menus: Cell<Record<string, AlloyComponent>> = Cell({ });
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

  const setContents = (sPrimary: string, sMenus: Record<string, AlloyComponent>, sExpansions: Record<string, string>, dir: MenuDirectory): void => {
    primary.set(Option.some(sPrimary));
    expansions.set(sExpansions);
    menus.set(sMenus);
    directory.set(dir);
    const sPaths = MenuPathing.generate(dir, sExpansions);
    paths.set(sPaths);
  };

  // Given an item, return a list of all menus including the one that it triggered (if there is one)
  const expand = (itemValue: string): Option<string[]> => {
    return Objects.readOptFrom(expansions.get(), itemValue).map((menu) => {
      const current = Objects.readOptFrom(paths.get(), itemValue).getOr([ ]);
      return [ menu ].concat(current);
    });
  };

  const collapse = (itemValue: string): Option<string[]> => {
    // Look up which key has the itemValue
    return Objects.readOptFrom(paths.get(), itemValue).bind((path) => {
      return path.length > 1 ? Option.some(path.slice(1)) : Option.none();
    });
  };

  const refresh = (itemValue: string): Option<string[]> => {
    return Objects.readOptFrom(paths.get(), itemValue);
  };

  const lookupMenu = (menuValue: string): Option<AlloyComponent> => {
    return Objects.readOptFrom(
      menus.get(),
      menuValue
    );
  };

  const otherMenus = (path: string[]): string[] => {
    const menuValues = directory.get();
    return Arr.difference(Obj.keys(menuValues), path);
  };

  const getPrimary = (): Option<AlloyComponent> => {
    return primary.get().bind(lookupMenu);
  };

  const getMenus = (): Record<string, AlloyComponent> => {
    return menus.get();
  };

  return {
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