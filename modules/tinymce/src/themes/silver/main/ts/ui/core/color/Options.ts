import { Transformations } from '@ephox/acid';
import { Arr, Type } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import { EditorOptions } from 'tinymce/core/api/OptionTypes';
import { Menu } from 'tinymce/core/api/ui/Ui';

import { ColorCache } from './ColorCache';

const colorCache = ColorCache(10);

const calcCols = (colors: number): number =>
  Math.max(5, Math.ceil(Math.sqrt(colors)));

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

const option: {
  <K extends keyof EditorOptions>(name: K): (editor: Editor) => EditorOptions[K];
  <T>(name: string): (editor: Editor) => T;
} = (name: string) => (editor: Editor) =>
  editor.options.get(name);

const register = (editor: Editor): void => {
  const registerOption = editor.options.register;

  registerOption('color_map', {
    processor: (value) => {
      if (Type.isArrayOf(value, Type.isString)) {
        return { value: mapColors(value), valid: true };
      } else {
        return { valid: false, message: 'Must be an array of strings.' };
      }
    },
    default: [
      '#BFEDD2', 'Light Green',
      '#FBEEB8', 'Light Yellow',
      '#F8CAC6', 'Light Red',
      '#ECCAFA', 'Light Purple',
      '#C2E0F4', 'Light Blue',

      '#2DC26B', 'Green',
      '#F1C40F', 'Yellow',
      '#E03E2D', 'Red',
      '#B96AD9', 'Purple',
      '#3598DB', 'Blue',

      '#169179', 'Dark Turquoise',
      '#E67E23', 'Orange',
      '#BA372A', 'Dark Red',
      '#843FA1', 'Dark Purple',
      '#236FA1', 'Dark Blue',

      '#ECF0F1', 'Light Gray',
      '#CED4D9', 'Medium Gray',
      '#95A5A6', 'Gray',
      '#7E8C8D', 'Dark Gray',
      '#34495E', 'Navy Blue',

      '#000000', 'Black',
      '#ffffff', 'White'
    ]
  });

  registerOption('color_cols', {
    processor: 'number',
    default: calcCols(getColors(editor).length)
  });

  registerOption('custom_colors', {
    processor: 'boolean',
    default: true
  });
};

const getColorCols = option('color_cols');
const hasCustomColors = option('custom_colors');
const getColors = option<Menu.ChoiceMenuItemSpec[]>('color_map');

const getCurrentColors = (): Menu.ChoiceMenuItemSpec[] => Arr.map(colorCache.state(), (color) => ({
  type: 'choiceitem',
  text: color,
  value: color
}));

const addColor = (color: string): void => {
  colorCache.add(color);
};

export {
  register,
  mapColors,
  calcCols,
  getColorCols,
  hasCustomColors,
  getColors,
  getCurrentColors,
  addColor
};
