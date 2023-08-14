import { Transformations } from '@ephox/acid';
import { Type } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import { EditorOptions } from 'tinymce/core/api/OptionTypes';
import { Menu } from 'tinymce/core/api/ui/Ui';

const foregroundId = 'forecolor';
const backgroundId = 'hilitecolor';

const fallbackCols = 5;

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

  const colorProcessor = (value: unknown): any => {
    if (Type.isArrayOf(value, Type.isString)) {
      return { value: mapColors(value), valid: true };
    } else {
      return { valid: false, message: 'Must be an array of strings.' };
    }
  };

  const colorColsProcessor = (value: unknown): any => {
    if (Type.isNumber(value) && value > 0) {
      return { value, valid: true };
    } else {
      return { valid: false, message: 'Must be a positive number.' };
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
    processor: colorColsProcessor,
    default: calcCols(editor)
  });

  registerOption('color_cols_foreground', {
    processor: colorColsProcessor,
    default: defaultCols(editor, foregroundId)
  });

  registerOption('color_cols_background', {
    processor: colorColsProcessor,
    default: defaultCols(editor, backgroundId)
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

const getColors = (editor: Editor, id: string): Menu.ChoiceMenuItemSpec[] => {
  if (id === foregroundId && editor.options.isSet('color_map_foreground')) {
    return option<Menu.ChoiceMenuItemSpec[]>('color_map_foreground')(editor);
  } else if (id === backgroundId && editor.options.isSet('color_map_background')) {
    return option<Menu.ChoiceMenuItemSpec[]>('color_map_background')(editor);
  } else {
    return option<Menu.ChoiceMenuItemSpec[]>('color_map')(editor);
  }
};

const calcCols = (editor: Editor, id: string = 'default'): number => Math.max(fallbackCols, Math.ceil(Math.sqrt(getColors(editor, id).length)));

const defaultCols = (editor: Editor, id: string) => {
  const defaultCols = option('color_cols')(editor);
  const calculatedCols = calcCols(editor, id);
  if (defaultCols === calcCols(editor)) {
    return calculatedCols;
  } else {
    return defaultCols;
  }
};

const getColorCols = (editor: Editor, id: string = 'default'): number => {
  const getCols = () => {
    if (id === foregroundId) {
      return option('color_cols_foreground')(editor);
    } else if (id === backgroundId) {
      return option('color_cols_background')(editor);
    } else {
      return option('color_cols')(editor);
    }
  };
  return Math.round(getCols());
};

const hasCustomColors = option('custom_colors');

const getDefaultForegroundColor = option<string>('color_default_foreground');
const getDefaultBackgroundColor = option<string>('color_default_background');

export {
  register,
  mapColors,
  getColorCols,
  hasCustomColors,
  getColors,
  getDefaultBackgroundColor,
  getDefaultForegroundColor,
  fallbackColor
};
