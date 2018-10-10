const getColorCols = (editor, defaultCols: number): number => {
  return editor.getParam('color_cols', defaultCols);
};

const hasCustomColors = (editor): boolean => {
  return editor.getParam('custom_colors') !== false;
};

const getColorMap = (editor): string[] => {
  return editor.getParam('color_map');
};

export default {
  getColorCols,
  hasCustomColors,
  getColorMap
};