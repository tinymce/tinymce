define(
  'tinymce.themes.mobile.util.StyleFormats',

  [
    'ephox.boulder.api.Objects',
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Id',
    'ephox.katamari.api.Merger',
    'tinymce.themes.mobile.ui.StylesMenu'
  ],

  function (Objects, Arr, Id, Merger, StylesMenu) {
    var register = function (editor, settings) {

      var isSelectedFor = function (format) {
        return function () {
          return editor.formatter.match(format);
        };
      };

      var getPreview = function (format) {
        return function () {
          var styles = editor.formatter.getCssText(format);
          return styles;
        };
      };

      var formats = Objects.readOptFrom(settings, 'style_formats').getOr([ ]);
      // TODO: Do not assume two level structure
      return Arr.map(formats, function (f) {
        var items = Arr.map(f.items !== undefined ? f.items : [ ], function (i) {
          if (Objects.hasKey(i, 'format')) return Merger.deepMerge(i, {
            isSelected: isSelectedFor(i.format),
            getPreview: getPreview(i.format)
          });
          else {
            var newName = Id.generate(i.title);
            var newItem = Merger.deepMerge(i, {
              format: newName,
              isSelected: isSelectedFor(newName),
              getPreview: getPreview(newName)
              // isAvailable ?
            });
            editor.formatter.register(newName, newItem);
            return newItem;
          }
        });
        return {
          title: f.title,
          items: items
        };
      });
    };

    var ui = function (editor, formats, onDone) {
      return StylesMenu.sketch({
        formats: formats,
        handle: function (value) {
          editor.formatter.apply(value);
          onDone();
        }
      });
    };

    // Takes items, and consolidates them into its return value
    var getAlpha = function (items) {
      var menus = { };
      var expansions = { };

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

    var getFormats = function (settings) {
      var formats = Objects.readOptFrom(settings, 'style_formats').getOr([ ]);
      var menus = [ ];
      var expansions = { };
      var primaryMenu = {
        name: 'styles',
        items: [ ]
      };

      Arr.each(formats, function (f) {
        if (f.items !== undefined) {
          // we are defining a menu type.
          var name = f.title;
          menus[name] = 
        }
      }
    };

    return {
      register: register,
      ui: ui
    };
  }
);