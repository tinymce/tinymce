define(
  'ephox.alloy.menu.state.LayeredState',

  [
    'ephox.alloy.menu.state.MenuPathing',
    'ephox.boulder.api.Objects',
    'ephox.compass.Arr',
    'ephox.compass.Obj',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.scullion.Cell',
    'ephox.sugar.api.Attr',
    'ephox.sugar.api.SelectorFilter'
  ],

  function (MenuPathing, Objects, Arr, Obj, Fun, Option, Cell, Attr, SelectorFilter) {
    return function () {
      var expansions = Cell({ });
      var menus = Cell({ });
      var paths = Cell({ });
      var primary = Cell(Option.none());

      // Probably think of a better way to store this information.
      var toItemValues = Cell(
        Fun.constant([ ])
      );

      // var toMenuValues = function (sMenus) {
      //   return Obj.map(sMenus, function (menu) {
      //     var menuItems = SelectorFilter.descendants(menu.element(), itemType.get());
      //     return Arr.map(menuItems, function (mi) { return Attr.get(mi, itemValue.get()); });
      //   });
      // };

      var clear = function () {
        expansions.set({});
        menus.set({});
        paths.set({});
        primary.set(Option.none());
      };

      var isClear = function () {
        return primary.get().isNone();
      };

      var setContents = function (sPrimary, sMenus, sExpansions, sToItemValues) {
        primary.set(Option.some(sPrimary));
        expansions.set(sExpansions);
        menus.set(sMenus);
        toItemValues.set(sToItemValues);
        var menuValues = sToItemValues(sMenus);
        var sPaths = MenuPathing.generate(menuValues, sExpansions);
        paths.set(sPaths);
      };

      var expand = function (itemValue) {
        return Objects.readOptFrom(expansions.get(), itemValue).map(function (menu) {
          var current = Objects.readOptFrom(paths.get(), itemValue).getOr([ ]);
          return [ menu ].concat(current);
        });
      };

      var collapse = function (itemValue) {
        // Look up which key has the itemValue
        return Objects.readOptFrom(paths.get(), itemValue).bind(function (path) {
          return path.length > 1 ? Option.some(path.slice(1)) : Option.none();
        });
      };

      var refresh = function (itemValue) {
        return Objects.readOptFrom(paths.get(), itemValue);
      };

      var lookupMenu = function (menuValue) {
        return Objects.readOptFrom(
          menus.get(),
          menuValue
        );
      };

      var otherMenus = function (path) {
        var menuValues = toItemValues.get()(menus.get());
        return Arr.difference(Obj.keys(menuValues), path);
      };

      var getPrimary = function () {
        return primary.get().bind(lookupMenu);
      };

      var getMenus = function () {
        return menus.get();
      };

      return {
        setContents: setContents,
        expand: expand,
        refresh: refresh,
        collapse: collapse,
        lookupMenu: lookupMenu,
        otherMenus: otherMenus,
        getPrimary: getPrimary,
        getMenus: getMenus,
        clear: clear,
        isClear: isClear
      };
    };
  }
);