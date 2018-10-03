import { Css, Element, Height, Width } from '@ephox/sugar';
import { defaultMaxEditorSize, defaultMinEditAreaHeight, defaultMinEditorSize } from './SizeDefaults';

interface EditorDimensions {
  height?: string;
  width?: string;
}

export enum ResizeTypes {
  None, Both, Vertical
}

export const calcChromeHeight = (containerHeight: number, contentAreaHeight: number) => {
  const chromeHeight = containerHeight - contentAreaHeight;
  return chromeHeight + defaultMinEditAreaHeight();
};

export const calcCappedSize = (originalSize: number, delta: number, minSize: number, maxSize: number) => {
  const newSize = originalSize + delta;
  if (newSize < minSize) {
    return minSize;
  } else if (newSize > maxSize) {
    return maxSize;
  }
  return newSize;
};

export const getDimensions = (editor, deltas, resizeType, getContainerHeight, getContainerWidth) => {
  const dimensions: EditorDimensions = {};

  const getMinWidthSetting = (): number => editor.getParam('min_width', defaultMinEditorSize(), 'number');
  const getMinHeightSetting = (): number => editor.getParam('min_height', defaultMinEditorSize(), 'number');
  const getMaxWidthSetting = (): number => editor.getParam('max_width', defaultMaxEditorSize(), 'number');
  const getMaxHeightSetting = (): number => editor.getParam('max_height', defaultMaxEditorSize(), 'number');

  const getMinHeight = () => {
    const containerHeight = editor.getContainer().scrollHeight;
    const contentAreaHeight = editor.contentAreaContainer.scrollHeight;
    const chromeSize = calcChromeHeight(containerHeight, contentAreaHeight);
    const minHeight = getMinHeightSetting();
    return chromeSize > minHeight ? chromeSize : minHeight;
  };

  const originalHeight = getContainerHeight();
  dimensions.height = calcCappedSize(originalHeight, deltas.top(), getMinHeight(), getMaxHeightSetting()) + 'px';

  if (resizeType === ResizeTypes.Both) {
    const originalWidth = getContainerWidth();
    dimensions.width = calcCappedSize(originalWidth, deltas.left(), getMinWidthSetting(), getMaxWidthSetting()) + 'px';
  }

  return dimensions;
};

export const resize = (editor, deltas, resizeType) => {
  const container = Element.fromDom(editor.getContainer());

  const getContainerSize = (dimension, fallback) => Css.getRaw(container, dimension).fold(fallback, (d) => parseInt(d, 10));
  const getContainerHeight = () => getContainerSize('height', () => Height.get(container));
  const getContainerWidth = () => getContainerSize('width', () => Width.get(container));

  const dimensions = getDimensions(editor, deltas, resizeType, getContainerHeight, getContainerWidth);
  Css.setAll(container, dimensions);
};
