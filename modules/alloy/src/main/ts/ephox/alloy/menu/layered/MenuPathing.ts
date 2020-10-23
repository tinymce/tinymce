import { Arr, Obj, Optional } from '@ephox/katamari';

// Not enforced :( Just for readability.
type TriggerItemToMenu = Record<string, string>;
type MenuToTriggerItem = Record<string, string>;
type MenuToItems = Record<string, string[]>;
type ItemToMenu = Record<string, string>;

type ItemToMenuPath = Record<string, string[]>;

const transpose = (obj: Record<string, string>): Record<string, string> =>
  // Assumes no duplicate fields.
  Obj.tupleMap(obj, (v, k) => ({ k: v, v: k }));
const trace = (items: Record<string, string>, byItem: TriggerItemToMenu, byMenu: MenuToTriggerItem, finish: string): string[] =>
  // Given a finishing submenu (which will be the value of expansions),
  // find the triggering item, find its menu, and repeat the process. If there
  // is no triggering item, we are done.
  Obj.get(byMenu, finish).bind((triggerItem: string) => Obj.get(items, triggerItem).bind((triggerMenu: string) => {
    const rest = trace(items, byItem, byMenu, triggerMenu);
    return Optional.some([ triggerMenu ].concat(rest));
  })).getOr([ ]);

const generate = (menus: MenuToItems, expansions: TriggerItemToMenu): ItemToMenuPath => {
  const items: ItemToMenu = { };
  Obj.each(menus, (menuItems, menu) => {
    Arr.each(menuItems, (item) => {
      items[item] = menu;
    });
  });

  const byItem: TriggerItemToMenu = expansions;
  const byMenu: MenuToTriggerItem = transpose(expansions);

  // For each menu, calculate the backlog of submenus to get to it.
  const menuPaths = Obj.map(byMenu, (_triggerItem: string, submenu: string) => [ submenu ].concat(trace(items, byItem, byMenu, submenu)));

  return Obj.map(items, (menu: string) => Obj.get(menuPaths, menu).getOr([ menu ]));
};

export {
  generate
};
