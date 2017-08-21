define(
  'tinymce.themes.mobile.util.StyleFormats',

  [
    'ephox.alloy.api.behaviour.Toggling',
    'ephox.boulder.api.Objects',
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Id',
    'ephox.katamari.api.Merger',
    'ephox.katamari.api.Obj',
    'tinymce.themes.mobile.ui.StylesMenu',
    'tinymce.themes.mobile.util.StyleConversions'
  ],

  function (Toggling, Objects, Arr, Fun, Id, Merger, Obj, StylesMenu, StyleConversions) {
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

      var enrichSupported = function (item) {
        return Merger.deepMerge(item, {
          isSelected: isSelectedFor(item.format),
          getPreview: getPreview(item.format)
        });
      };

      // Item that triggers a submenu
      var enrichMenu = function (item) {
        return Merger.deepMerge(item, {
          isSelected: Fun.constant(false),
          getPreview: Fun.constant('')
        });
      };

      var enrichCustom = function (item) {
        var formatName = Id.generate(item.title);
        var newItem = Merger.deepMerge(item, {
          format: formatName,
          isSelected: isSelectedFor(formatName),
          getPreview: getPreview(formatName)
          // isAvailable ?
        });
        editor.formatter.register(formatName, newItem);
        return newItem;
      };

      
      var formats = Objects.readOptFrom(settings, 'style_formats').getOr([ ]);
      var flatten = StyleConversions.getAlpha(formats, 'styles');

      var enrich = function (item) {
        // If we are a custom format
        var f = (function () {
          if (Objects.hasKey(item, 'format')) return enrichSupported;
          else if (Objects.hasKey(flatten.expansions, item.title)) return enrichMenu;
          else return enrichCustom;
        })();
        return f(item);
      };


      var newItems = Arr.map(flatten.items, enrich);
      var newMenus = Obj.map(flatten.menus, function (items, menuName) {
        return Arr.map(items, enrich);
      });

      return {
        items: newItems,
        menus: newMenus,
        expansions: flatten.expansions
      };
    };

    var prune = function (editor, formats) {
      // Firstly, prune the items
      var items = Arr.filter(formats.items, function (item) {
        return Objects.hasKey(item, 'format') ? editor.formatter.canApply(item.format) : true;
      });

      var menus = Obj.map(formats.menus, function (items, menuName) {
        return Arr.filter(items, function (item) {
          return Objects.hasKey(item, 'format') ? editor.formatter.canApply(item.format) : true;
        });
      });

      var expansions = formats.expansions;
      return {
        items: items,
        menus: menus,
        expansions: expansions
      };
    };

    var ui = function (editor, formats, onDone) {
      var pruned = prune(editor, formats);

      return StylesMenu.sketch({
        formats: pruned,
        handle: function (item, value) {
          if (Toggling.isOn(item)) {
            editor.formatter.remove(value);
          } else {
            editor.formatter.apply(value);
          }
          onDone();
        }
      });
    };

    return {
      register: register,
      ui: ui
    };
  }
);