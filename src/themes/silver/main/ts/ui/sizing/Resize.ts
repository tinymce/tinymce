import { Option, Obj } from '@ephox/katamari';
import { Css, Element, Height, Width, Traverse } from '@ephox/sugar';
import { getMinHeightSetting, getMinWidthSetting, getOptMaxHeightSetting, getOptMaxWidthSetting } from '../../api/Settings';

interface EditorDimensions {
  height?: number;
  width?: number;
}

export enum ResizeTypes {
  None, Both, Vertical
}

export const calcChromeHeight = (editor) => {
  const containerHeight = editor.getContainer().scrollHeight;
  const contentAreaHeight = editor.contentAreaContainer.scrollHeight;
  return containerHeight - contentAreaHeight;
};

export const calcCappedSize = (originalSize: number, delta: number, minSize: number, maxSizeOpt: Option<number>) => {
  const newSize = originalSize + delta;
  if (newSize < minSize) {
    return minSize;
  }
  return maxSizeOpt.fold(() => newSize, (maxSize) => newSize > maxSize ? maxSize : newSize);
};

export const getDimensions = (editor, deltas, resizeType: ResizeTypes, chromeHeight: number, getContainerHeight: () => number, getContainerWidth: () => number) => {
  const dimensions: EditorDimensions = {};

  const getMinHeight = (delta) => {
    const minEditableHeight = delta < 0 ? 20 : 0;
    const minHeight = getMinHeightSetting(editor);

    // if shrinking, keep at least one para height
    if (delta < 0) {
      const minEditorHeight = chromeHeight + minEditableHeight;
      return minEditorHeight > minHeight ? minEditorHeight : minHeight;
    }
    return minHeight;
  };

  const originalHeight = getContainerHeight();
  dimensions.height = calcCappedSize(originalHeight, deltas.top(), getMinHeight(deltas.top()), getOptMaxHeightSetting(editor));

  if (resizeType === ResizeTypes.Both) {
    const originalWidth = getContainerWidth();
    dimensions.width = calcCappedSize(originalWidth, deltas.left(), getMinWidthSetting(editor), getOptMaxWidthSetting(editor));
  }

  return dimensions;
};

export const resize = (editor, deltas, resizeType: ResizeTypes) => {
  const container = Element.fromDom(editor.getContainer());
  const chromeHeight = calcChromeHeight(editor);

  const getContainerSize = (dimension: string, fallback: () => number): number => Css.getRaw(container, dimension).fold(fallback, (d) => parseInt(d, 10));
  const getContainerHeight = (): number => getContainerSize('height', (): number => Height.get(container));
  const getContainerWidth = (): number => getContainerSize('width', (): number => Width.get(container));

  const dimensions = getDimensions(editor, deltas, resizeType, chromeHeight, getContainerHeight, getContainerWidth);
  Obj.each(dimensions, (val, dim) => Css.set(container, dim, val + 'px'));

  const iframeOpt = Traverse.firstChild(Element.fromDom(editor.getContentAreaContainer()));
  if (dimensions.height > 0 && iframeOpt.isSome()) {
    const iframeHeight = dimensions.height - chromeHeight;
    iframeOpt.each((iframe) => Css.set(iframe, 'min-height', iframeHeight + 'px'));
  }
};
