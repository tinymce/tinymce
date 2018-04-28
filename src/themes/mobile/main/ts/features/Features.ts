import { Behaviour, Receiving, Toggling } from '@ephox/alloy';
import { Objects } from '@ephox/boulder';
import { Arr, Option, Type } from '@ephox/katamari';

import Receivers from '../channels/Receivers';
import TinyChannels from '../channels/TinyChannels';
import Styles from '../style/Styles';
import Buttons from '../ui/Buttons';
import ColorSlider from '../ui/ColorSlider';
import * as FontSizeSlider from '../ui/FontSizeSlider';
import * as ImagePicker from '../ui/ImagePicker';
import * as LinkButton from '../ui/LinkButton';
import StyleFormats from '../util/StyleFormats';

const defaults = [ 'undo', 'bold', 'italic', 'link', 'image', 'bullist', 'styleselect' ];

const extract = function (rawToolbar) {
  // Ignoring groups
  const toolbar = rawToolbar.replace(/\|/g, ' ').trim();
  return toolbar.length > 0 ? toolbar.split(/\s+/) : [ ];
};

const identifyFromArray = function (toolbar) {
  return Arr.bind(toolbar, function (item) {
    return Type.isArray(item) ? identifyFromArray(item) : extract(item);
  });
};

const identify = function (settings) {
  // Firstly, flatten the toolbar
  const toolbar = settings.toolbar !== undefined ? settings.toolbar : defaults;
  return Type.isArray(toolbar) ? identifyFromArray(toolbar) : extract(toolbar);
};

const setup = function (realm, editor) {
  const commandSketch = function (name) {
    return function () {
      return Buttons.forToolbarCommand(editor, name);
    };
  };

  const stateCommandSketch = function (name) {
    return function () {
      return Buttons.forToolbarStateCommand(editor, name);
    };
  };

  const actionSketch = function (name, query, action) {
    return function () {
      return Buttons.forToolbarStateAction(editor, name, query, action);
    };
  };

  const undo = commandSketch('undo');
  const redo = commandSketch('redo');
  const bold = stateCommandSketch('bold');
  const italic = stateCommandSketch('italic');
  const underline = stateCommandSketch('underline');
  const removeformat = commandSketch('removeformat');

  const link = function () {
    return LinkButton.sketch(realm, editor);
  };

  const unlink = actionSketch('unlink', 'link', function () {
    editor.execCommand('unlink', null, false);
  });
  const image = function () {
    return ImagePicker.sketch(editor);
  };

  const bullist = actionSketch('unordered-list', 'ul', function () {
    editor.execCommand('InsertUnorderedList', null, false);
  });

  const numlist = actionSketch('ordered-list', 'ol', function () {
    editor.execCommand('InsertOrderedList', null, false);
  });

  const fontsizeselect = function () {
    return FontSizeSlider.sketch(realm, editor);
  };

  const forecolor = function () {
    return ColorSlider.sketch(realm, editor);
  };

  const styleFormats = StyleFormats.register(editor, editor.settings);

  const styleFormatsMenu = function () {
    return StyleFormats.ui(editor, styleFormats, function () {
      editor.fire('scrollIntoView');
    });
  };

  const styleselect = function () {
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

  const feature = function (prereq, sketch) {
    return {
      isSupported () {
        // NOTE: forall is true for none
        return prereq.forall(function (p) {
          return Objects.hasKey(editor.buttons, p);
        });
      },
      sketch
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

const detect = function (settings, features) {
  // Firstly, work out which items are in the toolbar
  const itemNames = identify(settings);

  // Now, build the list only including supported features and no duplicates.
  const present = { };
  return Arr.bind(itemNames, function (iName) {
    const r = !Objects.hasKey(present, iName) && Objects.hasKey(features, iName) && features[iName].isSupported() ? [ features[iName].sketch() ] : [];
    // NOTE: Could use fold to avoid mutation, but it might be overkill and not performant
    present[iName] = true;
    return r;
  });
};

export default {
  identify,
  setup,
  detect
};