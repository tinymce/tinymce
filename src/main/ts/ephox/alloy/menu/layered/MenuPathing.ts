import { Objects } from '@ephox/boulder';
import { Arr } from '@ephox/katamari';
import { Obj } from '@ephox/katamari';
import { Option } from '@ephox/katamari';

var transpose = function (obj) {
  // Assumes no duplicate fields.
  return Obj.tupleMap(obj, function (v, k) {
    return { k: v, v: k };
  });
};
var trace = function (items, byItem, byMenu, finish) {
  // Given a finishing submenu (which will be the value of expansions),
  // find the triggering item, find its menu, and repeat the process. If there
  // is no triggering item, we are done.
  return Objects.readOptFrom(byMenu, finish).bind(function (triggerItem) {
    return Objects.readOptFrom(items, triggerItem).bind(function (triggerMenu) {
      var rest = trace(items, byItem, byMenu, triggerMenu);
      return Option.some([ triggerMenu ].concat(rest));
    });
  }).getOr([ ]);
};

var generate = function (menus, expansions) {
  var items = { };
  Obj.each(menus, function (menuItems, menu) {
    Arr.each(menuItems, function (item) {
      items[item] = menu;
    });
  });

  var byItem = expansions;
  var byMenu = transpose(expansions);

  var menuPaths = Obj.map(byMenu, function (triggerItem, submenu) {
    return [ submenu ].concat(trace(items, byItem, byMenu, submenu));
  });

  return Obj.map(items, function (path) {
    return Objects.readOptFrom(menuPaths, path).getOr([ path ]);
  });
};

export default <any> {
  generate: generate
};