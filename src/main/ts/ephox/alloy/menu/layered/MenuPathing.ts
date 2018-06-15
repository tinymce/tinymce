import { Objects } from '@ephox/boulder';
import { Arr, Obj, Option } from '@ephox/katamari';

// Not enforced :( Just for readability.
type TriggerItemToMenu = Record<string, string>;
type MenuToTriggerItem = Record<string, string>;
type MenuToItems = Record<string, string[]>;
type ItemToMenu = Record<string, string>;

type ItemToMenuPath = Record<string, string[]>;

const transpose = function (obj: Record<string, string>): Record<string, string> {
  // Assumes no duplicate fields.
  return Obj.tupleMap(obj, function (v, k) {
    return { k: v, v: k };
  });
};
const trace = function (items: Record<string, string>, byItem, byMenu, finish): string[] {
  // Given a finishing submenu (which will be the value of expansions),
  // find the triggering item, find its menu, and repeat the process. If there
  // is no triggering item, we are done.
  return Objects.readOptFrom(byMenu, finish).bind(function (triggerItem: string) {
    return Objects.readOptFrom(items, triggerItem).bind(function (triggerMenu: string) {
      const rest = trace(items, byItem, byMenu, triggerMenu);
      return Option.some([ triggerMenu ].concat(rest));
    });
  }).getOr([ ]);
};

const generate = function (menus: MenuToItems, expansions: TriggerItemToMenu): ItemToMenuPath {
  const items: ItemToMenu = { };
  Obj.each(menus, function (menuItems, menu) {
    Arr.each(menuItems, function (item) {
      items[item] = menu;
    });
  });

  const byItem: TriggerItemToMenu = expansions;
  const byMenu: MenuToTriggerItem = transpose(expansions);

  // For each menu, calcualte the backlog of submenus to get to it.
  const menuPaths = Obj.map(byMenu, function (_triggerItem: string, submenu: string) {
    return [ submenu ].concat(trace(items, byItem, byMenu, submenu));
  });

  return Obj.map(items, (menu: string) => {
    return Objects.readOptFrom(menuPaths, menu).getOr([ menu ]);
  });
};

export {
  generate
};