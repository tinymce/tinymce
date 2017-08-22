define(
  'tinymce.themes.mobile.features.Features',

  [
    'ephox.boulder.api.Objects',
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option',
    'ephox.katamari.api.Type',
    'global!setTimeout',
    'global!window',
    'tinymce.themes.mobile.ui.Buttons',
    'tinymce.themes.mobile.ui.ColorSlider',
    'tinymce.themes.mobile.ui.FontSizeSlider',
    'tinymce.themes.mobile.ui.ImagePicker',
    'tinymce.themes.mobile.ui.LinkButton'
  ],

  function (Objects, Arr, Fun, Option, Type, setTimeout, window, Buttons, ColorSlider, FontSizeSlider, ImagePicker, LinkButton) {
    var extract = function (toolbar) {
      return toolbar.split(/\s+/);
    };

    var identifyFromArray = function (toolbar) {
      return Arr.bind(toolbar, function (item) {
        return Type.isArray(item) ? identifyFromArray(item) : extract(item);
      });
    };

    var identify = function (settings) {
      console.log('blah', settings);
      // Firstly, flatten the toolbar
      var toolbar = settings.toolbar !== undefined ? settings.toolbar : [ ];
      return Type.isArray(toolbar) ? identifyFromArray(toolbar) : extract(toolbar);
    };

    

    var setup = function (realm, editor) {
      var c = function (name) {
        return Buttons.forToolbarCommand(editor, name);
      };

      var undo = c('undo');
      var redo = c('redo');
      var bold = c('bold');
      var italic = c('italic');
      var underline = c('underline');
      var link = LinkButton.sketch(realm, editor);
      var unlink = c('unlink');
      var image = ImagePicker.sketch(editor);
      // NOTE: Requires "lists" plugin.
      var bullist = Buttons.forToolbarStateAction(editor, 'unordered-list', 'ul', function () {
        editor.execCommand('InsertUnorderedList', null, false);
      });

      var numlist = Buttons.forToolbarStateAction(editor, 'ordered-list', 'ol', function () {
        editor.execCommand('InsertOrderedList', null, false);
      });

      var fontsizeselect = FontSizeSlider.sketch(realm, editor);
      var forecolor = ColorSlider.sketch(realm, editor);

      var feature = function (prereq, spec) {
        return {
          isSupported: function () {
            // forall is true for none
            return prereq.forall(function (p) {
              return Objects.hasKey(editor.buttons, p);
            });
          },
          spec: Fun.constant(spec)
        };
      };

      return {
        undo: feature(Option.none(), undo),
        redo: feature(Option.none(), redo),
        bold: feature(Option.none(), bold),
        italic: feature(Option.none(), italic),
        underline: feature(Option.none(), underline),
        link: feature(Option.none(), link),
        unlink: feature(Option.none(), unlink),
        image: feature(Option.none(), image),
        bullist: feature(Option.none(), bullist),
        numlist: feature(Option.none(), numlist),
        fontsizeselect: feature(Option.none(), fontsizeselect),
        forecolor: feature(Option.none(), forecolor)
      };
    };

    var detect = function (realm, editor, settings) {
      // Firstly, work out what items are in the toolbar
      var itemNames = identify(settings);

      // Now, generates the different features
      var features = setup(realm, editor);

      console.log('itemNames', itemNames);
      console.log('features', features);

      // Now, if each feature is supported, return it
      return Arr.bind(itemNames, function (iName) {
        return features[iName].isSupported() ? [ features[iName].spec() ] : [];
      });
    };

    return {
      identify: identify,
      setup: setup,
      detect: detect
    };
  }
);
