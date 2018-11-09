import { Cell } from '@ephox/katamari';
import { Menu } from '@ephox/bridge';
import { Editor } from 'tinymce/core/api/Editor';

const choiceItem: 'choiceitem' = 'choiceitem';

const defaultColors = [
  { type: choiceItem, text: 'Turquoise', value: '#18BC9B' },
  { type: choiceItem, text: 'Green', value: '#2FCC71' },
  { type: choiceItem, text: 'Blue', value: '#3598DB' },
  { type: choiceItem, text: 'Purple', value: '#9B59B6' },
  { type: choiceItem, text: 'Navy Blue', value: '#34495E' },

  { type: choiceItem, text: 'Dark Turquoise', value: '#18A085' },
  { type: choiceItem, text: 'Dark Green', value: '#27AE60' },
  { type: choiceItem, text: 'Medium Blue', value: '#2880B9' },
  { type: choiceItem, text: 'Medium Purple', value: '#8E44AD' },
  { type: choiceItem, text: 'Midnight Blue', value: '#2B3E50' },

  { type: choiceItem, text: 'Yellow', value: '#F1C40F' },
  { type: choiceItem, text: 'Orange', value: '#E67E23' },
  { type: choiceItem, text: 'Red', value: '#E74C3C' },
  { type: choiceItem, text: 'Light Gray', value: '#ECF0F1' },
  { type: choiceItem, text: 'Gray', value: '#95A5A6' },

  { type: choiceItem, text: 'Dark Yellow', value: '#F29D12' },
  { type: choiceItem, text: 'Dark Orange', value: '#D35400' },
  { type: choiceItem, text: 'Dark Red', value: '#E74C3C' },
  { type: choiceItem, text: 'Medium Gray', value: '#BDC3C7' },
  { type: choiceItem, text: 'Dark Gray', value: '#7E8C8D' },

  { type: choiceItem, text: 'Black', value: '#000000' },
  { type: choiceItem, text: 'White', value: '#ffffff' }
];

const currentColors: Cell<Menu.ChoiceMenuItemApi[]> = Cell<Menu.ChoiceMenuItemApi[]>(
  defaultColors
);

const mapColors = function (colorMap: string[]): Menu.ChoiceMenuItemApi[] {
  let i;
  const colors = [];

  for (i = 0; i < colorMap.length; i += 2) {
    colors.push({
      text: colorMap[i + 1],
      value: '#' + colorMap[i],
      type: 'choiceitem'
    });
  }

  return colors;
};

const getColorCols = (editor: Editor, defaultCols: number): number => {
  return editor.getParam('color_cols', defaultCols, 'number');
};

const hasCustomColors = (editor: Editor): boolean => {
  return editor.getParam('custom_colors') !== false;
};

const getColorMap = (editor: Editor): string[] => {
  return editor.getParam('color_map');
};

const setColorsFromMap = (editor: Editor, getter: (editor: Editor) => string[], setter: (colors) => void): void => {
  const unmapped = getter(editor);
  if (unmapped !== undefined) {
    const mapped = mapColors(unmapped);
    setter(mapped);
  }
};

const setColors = (editor: Editor): void => {
  setColorsFromMap(editor, getColorMap, setCurrentColors);
};

const register = (editor: Editor): void => {
  setColors(editor);
};

const getCurrentColors = (): Menu.ChoiceMenuItemApi[] => {
  return currentColors.get();
};

const setCurrentColors = (colors: Menu.ChoiceMenuItemApi[]): void => {
  currentColors.set(colors);
};

const addColor = (color: string) => {
  setCurrentColors(getCurrentColors().concat([
    {
      type: 'choiceitem',
      text: color,
      value: color
    }
  ]));
};

export default {
  mapColors,
  getColorCols,
  hasCustomColors,
  getColorMap,
  register,
  getCurrentColors,
  setCurrentColors,
  addColor
};