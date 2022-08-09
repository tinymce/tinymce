import { Menu as AlloyMenu, RawDomSchema, TieredMenuTypes } from '@ephox/alloy';
import { Toolbar } from '@ephox/bridge';
import { Arr } from '@ephox/katamari';

import { classForPreset } from '../item/ItemClasses';
import { classes as getMenuClasses } from './MenuClasses';

const markers = (presets: Toolbar.PresetTypes): TieredMenuTypes.TieredMenuSpec['markers'] => {
  const menuClasses = getMenuClasses(presets);

  return {
    backgroundMenu: menuClasses.backgroundMenu,
    selectedMenu: menuClasses.selectedMenu,
    menu: menuClasses.menu,
    selectedItem: menuClasses.selectedItem,
    item: classForPreset(presets)
  };
};

const dom = (hasIcons: boolean, columns: Toolbar.ColumnTypes, presets: Toolbar.PresetTypes): RawDomSchema => {
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
  AlloyMenu.parts.items({ })
];

// NOTE: Up to here.
const part = (hasIcons: boolean, columns: Toolbar.ColumnTypes, presets: Toolbar.PresetTypes): Partial<TieredMenuTypes.TieredMenuSpec> => {
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
