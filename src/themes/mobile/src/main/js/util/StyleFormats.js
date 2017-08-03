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

    return {
      register: register,
      ui: ui
    };
  }
);