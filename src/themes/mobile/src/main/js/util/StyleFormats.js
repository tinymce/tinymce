define(
  'tinymce.themes.mobile.util.StyleFormats',

  [
    'ephox.boulder.api.Objects',
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Id',
    'tinymce.themes.mobile.ui.StylesMenu'
  ],

  function (Objects, Arr, Id, StylesMenu) {
    var register = function (editor, settings) {
      var formats = Objects.readOptFrom(settings, 'style_formats').getOr([ ]);
      // TODO: Do not assume two level structure
      return Arr.map(formats, function (f) {
        var items = Arr.map(f.items !== undefined ? f.items : [ ], function (i) {
          if (Objects.hasKey(i, 'format')) return i;
          else {
            var newName = Id.generate(i.title);
            editor.formatter.register(newName, i);
            return { title: i.title, icon: i.icon, format: newName };
          }
        });
        return {
          title: f.title,
          items: items
        };
      });
    };

    var ui = function (editor, formats) {
      return StylesMenu.sketch({
        formats: formats,
        handle: function (value) {
          editor.formatter.apply(value);
        }
      });
    };

    return {
      register: register,
      ui: ui
    };
  }
);