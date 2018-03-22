import { Objects } from '@ephox/boulder';
import { Arr, Obj, Option } from '@ephox/katamari';

const transpose = function (obj) {
  // Assumes no duplicate fields.
  return Obj.tupleMap(obj, function (v, k) {
    return { k: v, v: k };
  });
};
const trace = function (items, byItem, byMenu, finish) {
  // Given a finishing submenu (which will be the value of expansions),
  // find the triggering item, find its menu, and repeat the process. If there
  // is no triggering item, we are done.
  return Objects.readOptFrom(byMenu, finish).bind(function (triggerItem) {
    return Objects.readOptFrom(items, triggerItem).bind(function (triggerMenu) {
      const rest = trace(items, byItem, byMenu, triggerMenu);
      return Option.some([ triggerMenu ].concat(rest));
    });
  }).getOr([ ]);
};

const generate = function (menus, expansions) {
  const items = { };
  Obj.each(menus, function (menuItems, menu) {
    Arr.each(menuItems, function (item) {
      items[item] = menu;
    });
  });

  const byItem = expansions;
  const byMenu = transpose(expansions);

  const menuPaths = Obj.map(byMenu, function (triggerItem, submenu) {
    return [ submenu ].concat(trace(items, byItem, byMenu, submenu));
  });

  return Obj.map(items, function (path) {
    return Objects.readOptFrom(menuPaths, path).getOr([ path ]);
  });
};

export {
  generate
};