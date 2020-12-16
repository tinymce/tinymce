/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Behaviour, Receiving, Toggling } from '@ephox/alloy';
import { Objects } from '@ephox/boulder';
import { Arr, Obj, Optional, Type } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import * as Settings from '../api/Settings';

import * as Receivers from '../channels/Receivers';
import * as TinyChannels from '../channels/TinyChannels';
import * as Styles from '../style/Styles';
import * as Buttons from '../ui/Buttons';
import * as ColorSlider from '../ui/ColorSlider';
import * as FontSizeSlider from '../ui/FontSizeSlider';
import * as ImagePicker from '../ui/ImagePicker';
import { MobileRealm } from '../ui/IosRealm';
import * as LinkButton from '../ui/LinkButton';
import * as StyleFormats from '../util/StyleFormats';

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

const setup = (realm: MobileRealm, editor: Editor) => {
  const commandSketch = (name) => {
    return () => {
      return Buttons.forToolbarCommand(editor, name);
    };
  };

  const stateCommandSketch = (name) => {
    return () => {
      return Buttons.forToolbarStateCommand(editor, name);
    };
  };

  const actionSketch = (name, query, action) => {
    return () => {
      return Buttons.forToolbarStateAction(editor, name, query, action);
    };
  };

  const undo = commandSketch('undo');
  const redo = commandSketch('redo');
  const bold = stateCommandSketch('bold');
  const italic = stateCommandSketch('italic');
  const underline = stateCommandSketch('underline');
  const removeformat = commandSketch('removeformat');

  const link = () => {
    return LinkButton.sketch(realm, editor);
  };

  const unlink = actionSketch('unlink', 'link', () => {
    editor.execCommand('unlink', null, false);
  });
  const image = () => {
    return ImagePicker.sketch(editor);
  };

  const bullist = actionSketch('unordered-list', 'ul', () => {
    editor.execCommand('InsertUnorderedList', null, false);
  });

  const numlist = actionSketch('ordered-list', 'ol', () => {
    editor.execCommand('InsertOrderedList', null, false);
  });

  const fontsizeselect = () => {
    return FontSizeSlider.sketch(realm, editor);
  };

  const forecolor = () => {
    return ColorSlider.sketch(realm, editor);
  };

  const styleFormats = StyleFormats.register(editor);

  const styleFormatsMenu = () => {
    return StyleFormats.ui(editor, styleFormats, () => {
      editor.fire('scrollIntoView');
    });
  };

  const styleselect = () => {
    return Buttons.forToolbar('style-formats', (button) => {
      editor.fire('toReading');
      realm.dropup.appear(styleFormatsMenu, Toggling.on, button);
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

  const feature = (prereq, sketch) => {
    return {
      isSupported: () => {
        // NOTE: forall is true for none
        const buttons = editor.ui.registry.getAll().buttons;
        return prereq.forall((p) => {
          return Obj.hasNonNullableKey(buttons, p);
        });
      },
      sketch
    };
  };

  return {
    undo: feature(Optional.none(), undo),
    redo: feature(Optional.none(), redo),
    bold: feature(Optional.none(), bold),
    italic: feature(Optional.none(), italic),
    underline: feature(Optional.none(), underline),
    removeformat: feature(Optional.none(), removeformat),
    link: feature(Optional.none(), link),
    unlink: feature(Optional.none(), unlink),
    image: feature(Optional.none(), image),
    // NOTE: Requires "lists" plugin.
    bullist: feature(Optional.some('bullist'), bullist),
    numlist: feature(Optional.some('numlist'), numlist),
    fontsizeselect: feature(Optional.none(), fontsizeselect),
    forecolor: feature(Optional.none(), forecolor),
    styleselect: feature(Optional.none(), styleselect)
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
