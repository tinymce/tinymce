import { Css, Element, Height, Width } from '@ephox/sugar';
import { defaultMinEditAreaHeight, defaultMinEditorSize, defaultMaxEditorSize } from './SizeSettings';

// Should we put this magic number somewhere better?
export const calcMinChromeHeight = (minHeightSetting: number, containerHeight: number, contentAreaHeight: number) => {
  const chromeHeight = containerHeight - contentAreaHeight;
  const minHeight = chromeHeight + defaultMinEditAreaHeight();
  return minHeight > minHeightSetting ? minHeight : minHeightSetting;
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

export const resize = (editor, deltas, resizeType, ResizeTypes) => {
  const getMinWidthSetting = (): number => editor.getParam('min_width', defaultMinEditorSize(), 'number');
  const getMinHeightSetting = (): number => editor.getParam('min_height', defaultMinEditorSize(), 'number');
  const getMaxWidthSetting = (): number => editor.getParam('max_width', defaultMaxEditorSize(), 'number');
  const getMaxHeightSetting = (): number => editor.getParam('max_height', defaultMaxEditorSize(), 'number');

  const getMinHeight = () => {
    const containerHeight = editor.getContainer().scrollHeight;
    const contentAreaHeight = editor.contentAreaContainer.scrollHeight;
    return calcMinChromeHeight(getMinHeightSetting(), containerHeight, contentAreaHeight);
  };

  const container = Element.fromDom(editor.getContainer());

  const setDimension = (dimension, getter, minSize: number, maxSize: number, delta: number) => {
    const originalSize = Css.getRaw(container, dimension).fold(getter, (d) => parseInt(d, 10));
    const cappedHeight = calcCappedSize(originalSize, delta, minSize, maxSize);
    Css.set(container, dimension, cappedHeight + 'px');
  };

  setDimension('height', () => Height.get(container), getMinHeight(), getMaxHeightSetting(), deltas.top());

  if (resizeType === ResizeTypes.Both) {
    setDimension('width', () => Width.get(container), getMinWidthSetting(), getMaxWidthSetting(), deltas.left());
  }
};
