define(
  'tinymce.themes.mobile.features.Features',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Receiving',
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
    'tinymce.themes.mobile.channels.TinyChannels',
    'tinymce.themes.mobile.style.Styles',
    'tinymce.themes.mobile.ui.Buttons',
    'tinymce.themes.mobile.ui.ColorSlider',
    'tinymce.themes.mobile.ui.FontSizeSlider',
    'tinymce.themes.mobile.ui.ImagePicker',
    'tinymce.themes.mobile.ui.LinkButton',
    'tinymce.themes.mobile.util.StyleFormats'
  ],

  function (
    Behaviour, Receiving, Toggling, Memento, Objects, Arr, Fun, Option, Type, setTimeout, window, Receivers, TinyChannels, Styles, Buttons, ColorSlider, FontSizeSlider,
    ImagePicker, LinkButton, StyleFormats
  ) {
    var defaults = [ 'undo', 'bold', 'italic', 'link', 'image', 'bullist', 'styleselect' ];

    var extract = function (rawToolbar) {
      // Ignoring groups
      var toolbar = rawToolbar.replace(/\|/g, ' ').trim();
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
      var commandSketch = function (name) {
        return function () {
          return Buttons.forToolbarCommand(editor, name);
        };
      };

      var stateCommandSketch = function (name) {
        return function () {
          return Buttons.forToolbarStateCommand(editor, name);
        };
      };

      var actionSketch = function (name, query, action) {
        return function () {
          return Buttons.forToolbarStateAction(editor, name, query, action);
        };
      };

      var undo = commandSketch('undo');
      var redo = commandSketch('redo');
      var bold = stateCommandSketch('bold');
      var italic = stateCommandSketch('italic');
      var underline = stateCommandSketch('underline');
      var removeformat = commandSketch('removeformat');

      var link = function () {
        return LinkButton.sketch(realm, editor);
      };
      
      var unlink = actionSketch('unlink', 'link', function () {
        editor.execCommand('unlink', null, false);
      });
      var image = function () {
        return ImagePicker.sketch(editor);
      };

      var bullist = actionSketch('unordered-list', 'ul', function () {
        editor.execCommand('InsertUnorderedList', null, false);
      });

      var numlist = actionSketch('ordered-list', 'ol', function () {
        editor.execCommand('InsertOrderedList', null, false);
      });

      var fontsizeselect = function () {
        return FontSizeSlider.sketch(realm, editor);
      };

      var forecolor = function () {
        return ColorSlider.sketch(realm, editor);
      };

      var styleFormats = StyleFormats.register(editor, editor.settings);

      var styleFormatsMenu = function () {
        return StyleFormats.ui(editor, styleFormats, function () {
          editor.fire('scrollIntoView');
        });
      };

      var styleselect = function () {
        return Buttons.forToolbar('style-formats', function (button) {
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
          Receiving.config({
            channels: Objects.wrapAll([
              Receivers.receive(TinyChannels.orientationChanged(), Toggling.off),
              Receivers.receive(TinyChannels.dropupDismissed(), Toggling.off)
            ])
          })
        ]));
      };

      var feature = function (prereq, sketch) {
        return {
          isSupported: function () {
            // NOTE: forall is true for none
            return prereq.forall(function (p) {
              return Objects.hasKey(editor.buttons, p);
            });
          },
          sketch: sketch
        };
      };

      return {
        undo: feature(Option.none(), undo),
        redo: feature(Option.none(), redo),
        bold: feature(Option.none(), bold),
        italic: feature(Option.none(), italic),
        underline: feature(Option.none(), underline),
        removeformat: feature(Option.none(), removeformat),
        link: feature(Option.none(), link),
        unlink: feature(Option.none(), unlink),
        image: feature(Option.none(), image),
        // NOTE: Requires "lists" plugin.
        bullist: feature(Option.some('bullist'), bullist),
        numlist: feature(Option.some('numlist'), numlist),
        fontsizeselect: feature(Option.none(), fontsizeselect),
        forecolor: feature(Option.none(), forecolor),
        styleselect: feature(Option.none(), styleselect)
      };
    };

    var detect = function (settings, features) {
      // Firstly, work out which items are in the toolbar
      var itemNames = identify(settings);

      // Now, build the list only including supported features and no duplicates.
      var present = { };
      return Arr.bind(itemNames, function (iName) {
        var r = !Objects.hasKey(present, iName) && Objects.hasKey(features, iName) && features[iName].isSupported() ? [ features[iName].sketch() ] : [];
        // NOTE: Could use fold to avoid mutation, but it might be overkill and not performant
        present[iName] = true;
        return r;
      });
    };

    return {
      identify: identify,
      setup: setup,
      detect: detect
    };
  }
);
