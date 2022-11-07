import { KeyingConfigSpec, MenuTypes } from '@ephox/alloy';
import { Toolbar } from '@ephox/bridge';
import { Optional } from '@ephox/katamari';
import { SelectorFind } from '@ephox/sugar';

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
      rowSelector: '.' + rowClass,
      previousSelector: (menu) => {
        // We only want the navigation to start on the selected item if we are in color-mode (The colorswatch)
        return presets === 'color'
          ? SelectorFind.descendant(menu.element, '[aria-checked=true]')
          : Optional.none();
      }
    };
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
