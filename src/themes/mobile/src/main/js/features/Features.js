define(
  'tinymce.themes.mobile.features.Features',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Toggling',
    'ephox.alloy.api.component.Memento',
    'ephox.boulder.api.Objects',
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option',
    'ephox.katamari.api.Type',
    'global!setTimeout',
    'global!window',
    'tinymce.themes.mobile.channels.Receivers',
    'tinymce.themes.mobile.style.Styles',
    'tinymce.themes.mobile.ui.Buttons',
    'tinymce.themes.mobile.ui.ColorSlider',
    'tinymce.themes.mobile.ui.FontSizeSlider',
    'tinymce.themes.mobile.ui.ImagePicker',
    'tinymce.themes.mobile.ui.LinkButton',
    'tinymce.themes.mobile.util.StyleFormats'
  ],

  function (
    Behaviour, Toggling, Memento, Objects, Arr, Fun, Option, Type, setTimeout, window,
    Receivers, Styles, Buttons, ColorSlider, FontSizeSlider, ImagePicker, LinkButton, StyleFormats
  ) {
    var defaults = [ 'undo', 'bold', 'italic', 'link', 'image', 'bullist', 'styleselect' ];

    var extract = function (toolbar) {
      return toolbar.length > 0 ? toolbar.split(/\s+/) : [ ];
    };

    var identifyFromArray = function (toolbar) {
      return Arr.bind(toolbar, function (item) {
        return Type.isArray(item) ? identifyFromArray(item) : extract(item);
      });
    };

    var identify = function (settings) {
      // Firstly, flatten the toolbar
      var toolbar = settings.toolbar !== undefined ? settings.toolbar : defaults;
      return Type.isArray(toolbar) ? identifyFromArray(toolbar) : extract(toolbar);
    };

    var setup = function (realm, editor) {
      var undo = Buttons.forToolbarCommand(editor, 'undo');
      var redo = Buttons.forToolbarCommand(editor, 'redo');
      var bold = Buttons.forToolbarStateCommand(editor, 'bold');
      var italic = Buttons.forToolbarStateCommand(editor, 'italic');
      var underline = Buttons.forToolbarStateCommand(editor, 'underline');
      var removeformat = Buttons.forToolbarCommand(editor, 'removeformat');

      var link = LinkButton.sketch(realm, editor);
      var unlink = Buttons.forToolbarStateAction(editor, 'unlink', 'link', function () {
        editor.execCommand('unlink', null, false);
      });
      var image = ImagePicker.sketch(editor);
      var bullist = Buttons.forToolbarStateAction(editor, 'unordered-list', 'ul', function () {
        editor.execCommand('InsertUnorderedList', null, false);
      });

      var numlist = Buttons.forToolbarStateAction(editor, 'ordered-list', 'ol', function () {
        editor.execCommand('InsertOrderedList', null, false);
      });

      var fontsizeselect = FontSizeSlider.sketch(realm, editor);
      var forecolor = ColorSlider.sketch(realm, editor);

      var styleFormats = StyleFormats.register(editor, editor.settings);

      var styleFormatsMenu = function () {
        return StyleFormats.ui(editor, styleFormats, function () {
          editor.fire('scrollIntoView');
        });
      };

      var styleselect = Memento.record(
        Buttons.forToolbar('style-formats', function (button) {
          editor.fire('toReading');
          realm.dropup().appear(styleFormatsMenu, Toggling.on, button);
        }, Behaviour.derive([
          Toggling.config({
            toggleClass: Styles.resolve('toolbar-button-selected'),
            toggleOnExecute: false,
            aria: {
              mode: 'pressed'
            }
          }),
          Receivers.orientation(function (button) {
            Toggling.off(button);
          })
        ])
      ));

      var feature = function (prereq, spec, lookup) {
        return {
          isSupported: function () {
            // NOTE: forall is true for none
            return prereq.forall(function (p) {
              return Objects.hasKey(editor.buttons, p);
            });
          },
          spec: Fun.constant(spec),
          lookup: lookup
        };
      };

      return {
        undo: feature(Option.none(), undo, Option.none),
        redo: feature(Option.none(), redo, Option.none),
        bold: feature(Option.none(), bold, Option.none),
        italic: feature(Option.none(), italic, Option.none),
        underline: feature(Option.none(), underline, Option.none),
        removeformat: feature(Option.none(), removeformat, Option.none),
        link: feature(Option.none(), link, Option.none),
        unlink: feature(Option.none(), unlink, Option.none),
        image: feature(Option.none(), image, Option.none),
        // NOTE: Requires "lists" plugin.
        bullist: feature(Option.some('bullist'), bullist, Option.none),
        numlist: feature(Option.some('numlist'), numlist, Option.none),
        fontsizeselect: feature(Option.none(), fontsizeselect, Option.none),
        forecolor: feature(Option.none(), forecolor, Option.none),
        styleselect: feature(Option.none(), styleselect.asSpec(), styleselect.getOpt)
      };
    };

    var detect = function (realm, editor, settings, features) {
      // Firstly, work out which items are in the toolbar
      var itemNames = identify(settings);

      // Now, generates the different features
      // var features = setup(realm, editor);

      // Now, build the list only including supported features
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
