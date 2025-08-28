import { Toolbar } from '@ephox/bridge';

interface MenuClasses {
  readonly backgroundMenu: string;
  readonly selectedMenu: string;
  readonly selectedItem: string;
  readonly hasIcons: string;
  readonly menu: string;
  readonly tieredMenu: string;
}

const forMenu = (presets: Toolbar.PresetTypes): string => {
  if (presets === 'color') {
    return 'tox-swatches';
  } else {
    return 'tox-menu';
  }
};

const classes = (presets: Toolbar.PresetTypes): MenuClasses => ({
  backgroundMenu: 'tox-background-menu',
  selectedMenu: 'tox-selected-menu',
  selectedItem: 'tox-collection__item--active',
  hasIcons: 'tox-menu--has-icons',
  menu: forMenu(presets),
  tieredMenu: 'tox-tiered-menu'
});

export {
  classes
};
