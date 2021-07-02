/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Transformations } from '@ephox/acid';
import { Arr } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import { Menu } from 'tinymce/core/api/ui/Ui';

import ColorCache from './ColorCache';

const choiceItem: 'choiceitem' = 'choiceitem';

const defaultColors = [
  { type: choiceItem, text: 'Light Green', value: '#BFEDD2' },
  { type: choiceItem, text: 'Light Yellow', value: '#FBEEB8' },
  { type: choiceItem, text: 'Light Red', value: '#F8CAC6' },
  { type: choiceItem, text: 'Light Purple', value: '#ECCAFA' },
  { type: choiceItem, text: 'Light Blue', value: '#C2E0F4' },

  { type: choiceItem, text: 'Green', value: '#2DC26B' },
  { type: choiceItem, text: 'Yellow', value: '#F1C40F' },
  { type: choiceItem, text: 'Red', value: '#E03E2D' },
  { type: choiceItem, text: 'Purple', value: '#B96AD9' },
  { type: choiceItem, text: 'Blue', value: '#3598DB' },

  { type: choiceItem, text: 'Dark Turquoise', value: '#169179' },
  { type: choiceItem, text: 'Orange', value: '#E67E23' },
  { type: choiceItem, text: 'Dark Red', value: '#BA372A' },
  { type: choiceItem, text: 'Dark Purple', value: '#843FA1' },
  { type: choiceItem, text: 'Dark Blue', value: '#236FA1' },

  { type: choiceItem, text: 'Light Gray', value: '#ECF0F1' },
  { type: choiceItem, text: 'Medium Gray', value: '#CED4D9' },
  { type: choiceItem, text: 'Gray', value: '#95A5A6' },
  { type: choiceItem, text: 'Dark Gray', value: '#7E8C8D' },
  { type: choiceItem, text: 'Navy Blue', value: '#34495E' },

  { type: choiceItem, text: 'Black', value: '#000000' },
  { type: choiceItem, text: 'White', value: '#ffffff' }
];

const colorCache = ColorCache(10);

const mapColors = (colorMap: string[]): Menu.ChoiceMenuItemSpec[] => {
  const colors: Menu.ChoiceMenuItemSpec[] = [];

  for (let i = 0; i < colorMap.length; i += 2) {
    colors.push({
      text: colorMap[i + 1],
      value: '#' + Transformations.anyToHex(colorMap[i]).value,
      type: 'choiceitem'
    });
  }

  return colors;
};

const getColorCols = (editor: Editor, defaultCols: number): number => editor.getParam('color_cols', defaultCols, 'number');

const hasCustomColors = (editor: Editor): boolean => editor.getParam('custom_colors') !== false;

const getColorMap = (editor: Editor): string[] => editor.getParam('color_map');

const getColors = (editor: Editor): Menu.ChoiceMenuItemSpec[] => {
  const unmapped = getColorMap(editor);
  return unmapped !== undefined ? mapColors(unmapped) : defaultColors;
};

const getCurrentColors = (): Menu.ChoiceMenuItemSpec[] => Arr.map(colorCache.state(), (color) => ({
  type: choiceItem,
  text: color,
  value: color
}));

const addColor = (color: string) => {
  colorCache.add(color);
};

export {
  mapColors,
  getColorCols,
  hasCustomColors,
  getColorMap,
  getColors,
  getCurrentColors,
  addColor
};
