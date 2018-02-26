import { Objects } from '@ephox/boulder';
import { Arr, Cell, Fun, Obj, Option } from '@ephox/katamari';

import MenuPathing from './MenuPathing';

export default <any> function () {
  const expansions = Cell({ });
  const menus = Cell({ });
  const paths = Cell({ });
  const primary = Cell(Option.none());

  // Probably think of a better way to store this information.
  const toItemValues = Cell(
    Fun.constant([ ])
  );

  const clear = function () {
    expansions.set({});
    menus.set({});
    paths.set({});
    primary.set(Option.none());
  };

  const isClear = function () {
    return primary.get().isNone();
  };

  const setContents = function (sPrimary, sMenus, sExpansions, sToItemValues) {
    primary.set(Option.some(sPrimary));
    expansions.set(sExpansions);
    menus.set(sMenus);
    toItemValues.set(sToItemValues);
    const menuValues = sToItemValues(sMenus);
    const sPaths = MenuPathing.generate(menuValues, sExpansions);
    paths.set(sPaths);
  };

  const expand = function (itemValue) {
    return Objects.readOptFrom(expansions.get(), itemValue).map(function (menu) {
      const current = Objects.readOptFrom(paths.get(), itemValue).getOr([ ]);
      return [ menu ].concat(current);
    });
  };

  const collapse = function (itemValue) {
    // Look up which key has the itemValue
    return Objects.readOptFrom(paths.get(), itemValue).bind(function (path) {
      return path.length > 1 ? Option.some(path.slice(1)) : Option.none();
    });
  };

  const refresh = function (itemValue) {
    return Objects.readOptFrom(paths.get(), itemValue);
  };

  const lookupMenu = function (menuValue) {
    return Objects.readOptFrom(
      menus.get(),
      menuValue
    );
  };

  const otherMenus = function (path) {
    const menuValues = toItemValues.get()(menus.get());
    return Arr.difference(Obj.keys(menuValues), path);
  };

  const getPrimary = function () {
    return primary.get().bind(lookupMenu);
  };

  const getMenus = function () {
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