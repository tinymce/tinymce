import { Css, Element, Height, Width } from '@ephox/sugar';
import { Option } from '@ephox/katamari';

// Should we put this magic number somewhere better?
const defaultMinEditAreaHeight = 150;
const getMinEditAreaHeight = (editor) => editor.getParam('min-height', defaultMinEditAreaHeight, 'number');
const getOptSizeSetting = (editor, setting) => editor.settings.hasOwnProperty(setting) ? Option.some(editor.settings[setting]) : Option.none();

export const calcMinChromeSize = (minEditAreaHeight, containerHeight, contentAreaHeight) => {
  const chromeHeight = containerHeight - contentAreaHeight;
  return chromeHeight + minEditAreaHeight;
};

export const calcCappedSize = (originalSize, delta, minSize, maxSize) => {
  const newSize = originalSize + delta;
  if (minSize.isSome() && newSize < minSize.get()) {
    return minSize;
  } else if (maxSize.isSome() && newSize > maxSize.get()) {
    return maxSize;
  }
  return newSize;
};

export const resize = (editor, delta, resizeType, ResizeTypes) => {
  const getMinHeight = () => {
    const containerHeight = editor.getContainer().scrollHeight;
    const contentAreaHeight = editor.contentAreaContainer.scrollHeight;
    return Option.some(calcMinChromeSize(getMinEditAreaHeight(editor), containerHeight, contentAreaHeight));
  };
  const getMaxHeight = () => getOptSizeSetting(editor, 'max-height');
  const getMinWidth = () => getOptSizeSetting(editor, 'min-width');
  const getMaxWidth = () => getOptSizeSetting(editor, 'max-width');

  const container = Element.fromDom(editor.getContainer());

  const setDimension = (dimension, getter, getMinSize, getMaxSize, delta) => {
    const originalSize = Css.getRaw(container, dimension).fold(getter, (d) => parseInt(d, 10));
    const minSize = getMinSize();
    const maxSize = getMaxSize();
    const cappedHeight = calcCappedSize(originalSize, delta, minSize, maxSize);
    Css.set(container, dimension, cappedHeight + 'px');
  };

  setDimension('height', () => Height.get(container), getMinHeight, getMaxHeight, delta.top());

  if (resizeType === ResizeTypes.Both) {
    setDimension('width', () => Width.get(container), getMinWidth, getMaxWidth, delta.left());
  }
};
