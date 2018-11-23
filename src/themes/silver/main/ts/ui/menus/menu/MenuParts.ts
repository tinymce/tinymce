/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Menu as AlloyMenu, TieredMenuTypes } from '@ephox/alloy';
import { Arr } from '@ephox/katamari';

import { classForPreset } from '../item/ItemClasses';
import { classes as getMenuClasses } from './MenuClasses';
import { Types } from '@ephox/bridge';

const markers = (presets: Types.PresetTypes) => {
  const menuClasses = getMenuClasses(presets);

  return {
    backgroundMenu: menuClasses.backgroundMenu,
    selectedMenu: menuClasses.selectedMenu,
    menu: menuClasses.menu,
    selectedItem: menuClasses.selectedItem,
    item: classForPreset(presets)
  };
};

const dom = (hasIcons: boolean, columns: Types.ColumnTypes, presets: Types.PresetTypes) => {
  const menuClasses = getMenuClasses(presets);
  return {
    tag: 'div',
    classes: Arr.flatten([
      [ menuClasses.menu, `tox-menu-${columns}-column` ],
      hasIcons ? [ menuClasses.hasIcons ] : [ ]
    ])
  };
};

const components = [
  AlloyMenu.parts().items({ })
];

// NOTE: Up to here.
const part = (hasIcons: boolean, columns: Types.ColumnTypes, presets: Types.PresetTypes): Partial<TieredMenuTypes.TieredMenuSpec> => {
  const menuClasses = getMenuClasses(presets);
  const d = {
    tag: 'div',
    classes: Arr.flatten([
      [ menuClasses.tieredMenu ]
    ])
  };

  return {
    dom: d,
    markers: markers(presets)
  };
};

export {
  markers,
  dom,
  components,
  part
};