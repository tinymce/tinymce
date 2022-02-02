/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { KeyingConfigSpec, MenuTypes } from '@ephox/alloy';
import { Toolbar } from '@ephox/bridge';

import { colorClass, selectableClass } from '../item/ItemClasses';
import { markers as getMenuMarkers } from './MenuParts';

export const deriveMenuMovement = (columns: number | 'auto', presets: Toolbar.PresetTypes): MenuTypes.MenuMovementSpec => {
  const menuMarkers = getMenuMarkers(presets);
  if (columns === 1) {
    return { mode: 'menu', moveOnTab: true } as MenuTypes.MenuNormalMovementSpec;
  } else if (columns === 'auto') {
    return {
      mode: 'grid',
      selector: '.' + menuMarkers.item,
      initSize: {
        numColumns: 1,
        numRows: 1
      }
    } as MenuTypes.MenuGridMovementSpec;
  } else {
    const rowClass = presets === 'color' ? 'tox-swatches__row' : 'tox-collection__group';
    return {
      mode: 'matrix',
      rowSelector: '.' + rowClass
    } as MenuTypes.MenuMatrixMovementSpec;
  }
};

export const deriveCollectionMovement = (columns: number | 'auto', presets: Toolbar.PresetTypes): KeyingConfigSpec => {
  if (columns === 1) {
    return {
      mode: 'menu',
      moveOnTab: false,
      selector: '.tox-collection__item'
    };
  } else if (columns === 'auto') {
    return {
      mode: 'flatgrid',
      selector: '.' + 'tox-collection__item',
      initSize: {
        numColumns: 1,
        numRows: 1
      }
    };
  } else {
    return {
      mode: 'matrix',
      selectors: {
        row: presets === 'color' ? '.tox-swatches__row' : '.tox-collection__group',
        cell: presets === 'color' ? `.${colorClass}` : `.${selectableClass}`
      }

    };
  }
};
