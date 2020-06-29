/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Behaviour, Receiving, Toggling } from '@ephox/alloy';
import { Objects } from '@ephox/boulder';
import { Arr, Obj, Option, Type } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';

import * as Receivers from '../channels/Receivers';
import * as TinyChannels from '../channels/TinyChannels';
import * as Styles from '../style/Styles';
import * as Buttons from '../ui/Buttons';
import * as ColorSlider from '../ui/ColorSlider';
import * as FontSizeSlider from '../ui/FontSizeSlider';
import * as ImagePicker from '../ui/ImagePicker';
import * as LinkButton from '../ui/LinkButton';
import * as StyleFormats from '../util/StyleFormats';
import * as Settings from '../api/Settings';
import { MobileRealm } from '../ui/IosRealm';

const extract = (rawToolbar: string): string[] => {
  // Ignoring groups
  const toolbar = rawToolbar.replace(/\|/g, ' ').trim();
  return toolbar.length > 0 ? toolbar.split(/\s+/) : [ ];
};

const identifyFromArray = (toolbar: string[]): string[] =>
  Arr.bind(toolbar, (item: string | string[]) =>
    Type.isArray(item) ? identifyFromArray(item) : extract(item)
  );

const identify = (editor: Editor): string[] => {
  // Firstly, flatten the toolbar
  const toolbar = Settings.getToolbar(editor);
  return Type.isArray(toolbar) ? identifyFromArray(toolbar) : extract(toolbar);
};

const setup = function (realm: MobileRealm, editor: Editor) {
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

  const styleFormats = StyleFormats.register(editor);

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
          Receivers.receive(TinyChannels.orientationChanged, Toggling.off),
          Receivers.receive(TinyChannels.dropupDismissed, Toggling.off)
        ])
      })
    ]), editor);
  };

  const feature = function (prereq, sketch) {
    return {
      isSupported() {
        // NOTE: forall is true for none
        const buttons = editor.ui.registry.getAll().buttons;
        return prereq.forall(function (p) {
          return Obj.hasNonNullableKey(buttons, p);
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

const detect = (editor: Editor, features) => {
  // Firstly, work out which items are in the toolbar
  const itemNames = identify(editor);

  // Now, build the list only including supported features and no duplicates.
  const present = { };
  return Arr.bind(itemNames, (iName) => {
    const r = !Obj.hasNonNullableKey<any, string>(present, iName) && Obj.hasNonNullableKey(features, iName) && features[iName].isSupported() ? [ features[iName].sketch() ] : [];
    // NOTE: Could use fold to avoid mutation, but it might be overkill and not performant
    present[iName] = true;
    return r;
  });
};

export {
  identify,
  setup,
  detect
};
