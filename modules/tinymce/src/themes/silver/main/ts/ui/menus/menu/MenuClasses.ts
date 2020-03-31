/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Types } from '@ephox/bridge';

const forMenu = (presets: Types.PresetTypes) => {
  if (presets === 'color') {
    return 'tox-swatches';
  } else {
    return 'tox-menu';
  }
};

const classes = (presets: Types.PresetTypes) => ({
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