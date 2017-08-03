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
      return Arr.foldr(items, function (acc, item) {
        var r = (function () {
          if (item.items !== undefined) {
            // We have a submenu
            var menuName = item.title;
            var rest = getAlpha(item.items);
            var newMenus = Merger.deepMerge(
              acc.menus,
              rest.menus,
              Objects.wrap(menuName, rest.items)
            );
            var newExpansions = Merger.deepMerge(
              acc.expansions,
              rest.expansions,
              Objects.wrap(menuName, menuName)
            );
            var newItems = [ Objects.exclude(item, [ 'items' ]) ].concat(acc.items);
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
        })();


        console.log('item', item.title, 'r', r, 'initially', acc);
        return r;
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
