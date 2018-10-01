import { Types } from '@ephox/bridge';

const forMenu = (presets: Types.PresetTypes) => {
  if (presets === 'color') {
    return 'tox-swatches';
  } else {
    return 'tox-menu';
  }
};

const classes = (presets: Types.PresetTypes) => {
  return {
    backgroundMenu: 'tox-background-menu',
    selectedMenu: 'tox-selected-menu',
    selectedItem: 'tox-collection__item--active',
    hasIcons: 'tox-menu--has-icons',
    menu: forMenu(presets),
    tieredMenu: 'tox-tiered-menu'
  };
};

export {
  classes
};