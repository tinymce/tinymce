define(
  'tinymce.themes.mobile.util.StyleConversions',

  [
    'ephox.boulder.api.Objects',
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Merger'
  ],

  function (Objects, Arr, Merger) {

    var getFromExpandingItem = function (item) {
      var newItem = Merger.deepMerge(
        Objects.exclude(item, [ 'items' ]),
        {
          menu: true
        }
      );

      var rest = expand(item.items, item.title);

      var newMenus = Merger.deepMerge(
        rest.menus,
        Objects.wrap(
          item.title,
          rest.items
        )
      );
      var newExpansions = Merger.deepMerge(
        rest.expansions,
        Objects.wrap(item.title, item.title)
      );

      return {
        item: newItem,
        menus: newMenus,
        expansions: newExpansions
      };
    };

    var getFromItem = function (item) {
      return Objects.hasKey(item, 'items') ? getFromExpandingItem(item) : {
        item: item,
        menus: { },
        expansions: { }
      };
    };

  
    // Takes items, and consolidates them into its return value
    var expand = function (items) {
      return Arr.foldr(items, function (acc, item) {
        var newData = getFromItem(item);
        return {
          menus: Merger.deepMerge(acc.menus, newData.menus),
          items: [ newData.item ].concat(acc.items),
          expansions: Merger.deepMerge(acc.expansions, newData.expansions)
        };
      }, {
        menus: { },
        expansions: { },
        items: [ ]
      });
    };

    return {
      expand: expand
    };
  }
);
