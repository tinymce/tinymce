define(
  'tinymce.themes.mobile.util.StyleConversions',

  [
    'ephox.boulder.api.Objects',
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Merger'
  ],

  function (Objects, Arr, Merger) {
    // Takes items, and consolidates them into its return value
    var getAlpha = function (items) {
      return Arr.foldr(items, function (item, acc) {
        if (item.items !== undefined) {
          // We have a submenu
          var menuName = item.title;
          var rest = getAlpha(item.items);
          var newMenus = Merger.deepMerge(
            acc.menus,
            Objects.wrap(menuName, rest.items)
          );
          var newExpansions = Merger.deepMerge(
            acc.expansions,
            Objects.wrap(menuName, menuName)
          );
          var newItems = acc.items;
          return {
            menus: newMenus,
            expansions: newExpansions,
            items: newItems
          };
        } else {
          // FIX: Remove hoisting
          var newItems = [ item ].concat(acc.items);
          var newExpansions = acc.expansions;
          var newMenus = acc.menus;
          return {
            menus: newMenus,
            expansions: newExpansions,
            items: newItems
          };
        }
      }, {
        menus: { },
        expansions: { },
        items: [ ]
      });
    };

    return {
      getAlpha: getAlpha
    };
  }
);
