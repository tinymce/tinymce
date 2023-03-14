import { Transformations } from '@ephox/acid';
import { Type } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import { EditorOptions } from 'tinymce/core/api/OptionTypes';
import { Menu } from 'tinymce/core/api/ui/Ui';

const foregroundId = 'forecolor';
const backgroundId = 'hilitecolor';

const defaultCols = 5;

const calcCols = (colors: number): number =>
  Math.max(defaultCols, Math.ceil(Math.sqrt(colors)));

const calcColsOption = (editor: Editor, numColors: number): number => {
  const calculatedCols = calcCols(numColors);
  const fallbackCols = option('color_cols')(editor);
  return defaultCols === calculatedCols ? fallbackCols : calculatedCols;
};

const mapColors = (colorMap: string[]): Menu.ChoiceMenuItemSpec[] => {
  const colors: Menu.ChoiceMenuItemSpec[] = [];

  for (let i = 0; i < colorMap.length; i += 2) {
    colors.push({
      text: colorMap[i + 1],
      value: '#' + Transformations.anyToHex(colorMap[i]).value,
      icon: 'checkmark',
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

const fallbackColor = '#000000';

const register = (editor: Editor): void => {
  const registerOption = editor.options.register;

  const colorProcessor = (value: any): any => {
    if (Type.isArrayOf(value, Type.isString)) {
      return { value: mapColors(value), valid: true };
    } else {
      return { valid: false, message: 'Must be an array of strings.' };
    }
  };

  registerOption('color_map', {
    processor: colorProcessor,
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

  registerOption('color_map_background', {
    processor: colorProcessor
  });

  registerOption('color_map_foreground', {
    processor: colorProcessor
  });

  registerOption('color_cols', {
    processor: 'number',
    default: calcCols(getColors(editor, 'default').length)
  });

  registerOption('color_cols_foreground', {
    processor: 'number',
    default: calcColsOption(editor, getColors(editor, foregroundId).length)
  });

  registerOption('color_cols_background', {
    processor: 'number',
    default: calcColsOption(editor, getColors(editor, backgroundId).length)
  });

  registerOption('custom_colors', {
    processor: 'boolean',
    default: true
  });

  registerOption('color_default_foreground', {
    processor: 'string',
    default: fallbackColor
  });

  registerOption('color_default_background', {
    processor: 'string',
    default: fallbackColor
  });
};

const colorColsOption = (editor: Editor, id: string): number => {
  if (id === foregroundId) {
    return option('color_cols_foreground')(editor);
  } else if (id === backgroundId) {
    return option('color_cols_background')(editor);
  } else {
    return option('color_cols')(editor);
  }
};

const getColorCols = (editor: Editor, id: string): number => {
  const colorCols = colorColsOption(editor, id);
  return colorCols > 0 ? colorCols : defaultCols;
};

const hasCustomColors = option('custom_colors');

const getColors = (editor: Editor, id: string): Menu.ChoiceMenuItemSpec[] => {
  if (id === foregroundId && editor.options.isSet('color_map_foreground')) {
    return option<Menu.ChoiceMenuItemSpec[]>('color_map_foreground')(editor);
  } else if (id === backgroundId && editor.options.isSet('color_map_background')) {
    return option<Menu.ChoiceMenuItemSpec[]>('color_map_background')(editor);
  } else {
    return option<Menu.ChoiceMenuItemSpec[]>('color_map')(editor);
  }
};

const getDefaultForegroundColor = option<string>('color_default_foreground');
const getDefaultBackgroundColor = option<string>('color_default_background');

export {
  register,
  mapColors,
  calcCols,
  getColorCols,
  hasCustomColors,
  getColors,
  getDefaultBackgroundColor,
  getDefaultForegroundColor,
  fallbackColor
};
