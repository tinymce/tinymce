import { Css, Element, Height, Width } from '@ephox/sugar';

// Should we put this magic number somewhere better?
const minimumEditAreaHeight = 150;

export const calcChromeSize = (containerHeight, contentAreaHeight) => {
  const chromeHeight = containerHeight - contentAreaHeight;
  return chromeHeight + minimumEditAreaHeight;
};

export const calcCappedSize = (originalSize, delta, minSize) => {
  const newSize = originalSize + delta;
  return newSize > minSize ? newSize : minSize;
};

export const resize = (editor, delta, resizeType, ResizeTypes) => {
  const getMinHeight = () => {
    const containerHeight = editor.getContainer().scrollHeight;
    const contentAreaHeight = editor.contentAreaContainer.scrollHeight;
    return calcChromeSize(containerHeight, contentAreaHeight);
  };

  const container = Element.fromDom(editor.getContainer());

  const setDimension = (dimension, getter, getMinSize, delta) => {
    const originalSize = Css.getRaw(container, dimension).fold(getter, (d) => parseInt(d, 10));
    const minSize = getMinSize();
    const cappedHeight = calcCappedSize(originalSize, delta, minSize);
    Css.set(container, dimension, cappedHeight + 'px');
  };

  setDimension('height', () => Height.get(container), getMinHeight, delta.top());

  if (resizeType === ResizeTypes.Both) {
    setDimension('width', () => Width.get(container), () => 0, delta.left());
  }
};
