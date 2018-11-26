/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { KeyingConfigSpec } from '@ephox/alloy/lib/main/ts/ephox/alloy/api/behaviour/Keying';
import {
  FlatgridConfigSpec,
  MatrixConfigSpec,
  MenuConfigSpec,
} from '@ephox/alloy/lib/main/ts/ephox/alloy/keying/KeyingModeTypes';
import {
  MenuGridMovementSpec,
  MenuMatrixMovementSpec,
  MenuMovementSpec,
  MenuNormalMovementSpec,
} from '@ephox/alloy/lib/main/ts/ephox/alloy/ui/types/MenuTypes';
import { Types } from '@ephox/bridge';

import { markers as getMenuMarkers } from './MenuParts';
import { selectableClass, colorClass } from '../item/ItemClasses';

export const deriveMenuMovement = (columns: number | 'auto', presets: Types.PresetTypes): MenuMovementSpec => {
  const menuMarkers = getMenuMarkers(presets);
  if (columns === 1) {
    return { mode: 'menu', moveOnTab: true } as MenuNormalMovementSpec;
  } else if (columns === 'auto') {
    return {
      mode: 'grid',
      selector: '.' + menuMarkers.item,
      initSize: {
        numColumns: 1,
        numRows: 1
      }
    } as MenuGridMovementSpec;
  } else {
    const rowClass = presets === 'color' ? 'tox-swatches__row' : 'tox-collection__group';
    return {
      mode: 'matrix',
      rowSelector: '.' + rowClass
    } as MenuMatrixMovementSpec;
  }
};

export const deriveCollectionMovement = (columns: number | 'auto', presets: Types.PresetTypes): KeyingConfigSpec => {
  if (columns === 1) {
    return {
      mode: 'menu',
      moveOnTab: false,
      selector: '.tox-collection__item'
    } as MenuConfigSpec;
  } else if (columns === 'auto') {
    return {
      mode: 'flatgrid',
      selector: '.' + 'tox-collection__item',
      initSize: {
        numColumns: 1,
        numRows: 1
      }
    } as FlatgridConfigSpec;
  } else {
    return {
      mode: 'matrix',
      selectors: {
        row: presets === 'color' ? '.tox-swatches__row' : '.tox-collection__group',
        cell: presets === 'color' ? `.${colorClass}` : `.${selectableClass}`
      }

    } as MatrixConfigSpec;
  }
};