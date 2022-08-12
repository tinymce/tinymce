import { Obj } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import { SchemaMap } from 'tinymce/core/api/html/Schema';

import { create, defaultData, ImageData, isFigure, read, write } from './ImageData';
import * as Utils from './Utils';

const normalizeCss = (editor: Editor, cssText: string | undefined): string => {
  const css = editor.dom.styles.parse(cssText);
  const mergedCss = Utils.mergeMargins(css);
  const compressed = editor.dom.styles.parse(editor.dom.styles.serialize(mergedCss));
  return editor.dom.styles.serialize(compressed);
};

const getSelectedImage = (editor: Editor): HTMLElement | null => {
  const imgElm = editor.selection.getNode();
  const figureElm = editor.dom.getParent<HTMLElement>(imgElm, 'figure.image');

  if (figureElm) {
    return editor.dom.select('img', figureElm)[0];
  }

  if (imgElm && (imgElm.nodeName !== 'IMG' || Utils.isPlaceholderImage(imgElm))) {
    return null;
  }

  return imgElm as HTMLElement;
};

const splitTextBlock = (editor: Editor, figure: HTMLElement): HTMLElement => {
  const dom = editor.dom;
  const textBlockElements: SchemaMap = Obj.filter(
    editor.schema.getTextBlockElements(),
    (_, parentElm) => !editor.schema.isValidChild(parentElm, 'figure')
  );

  const textBlock = dom.getParent(
    figure.parentNode,
    (node: Node) => Obj.hasNonNullableKey(textBlockElements, node.nodeName),
    editor.getBody()
  );

  if (textBlock) {
    return dom.split(textBlock, figure) ?? figure;
  } else {
    return figure;
  }
};

const readImageDataFromSelection = (editor: Editor): ImageData => {
  const image = getSelectedImage(editor);
  return image ? read((css) => normalizeCss(editor, css), image) : defaultData();
};

const insertImageAtCaret = (editor: Editor, data: ImageData): void => {
  const elm = create((css) => normalizeCss(editor, css), data);

  editor.dom.setAttrib(elm, 'data-mce-id', '__mcenew');
  editor.focus();
  editor.selection.setContent(elm.outerHTML);

  const insertedElm = editor.dom.select('*[data-mce-id="__mcenew"]')[0];
  editor.dom.setAttrib(insertedElm, 'data-mce-id', null);

  if (isFigure(insertedElm)) {
    const figure = splitTextBlock(editor, insertedElm);
    editor.selection.select(figure);
  } else {
    editor.selection.select(insertedElm);
  }
};

const syncSrcAttr = (editor: Editor, image: HTMLElement): void => {
  editor.dom.setAttrib(image, 'src', image.getAttribute('src'));
};

const deleteImage = (editor: Editor, image: HTMLElement | null): void => {
  if (image) {
    const elm = editor.dom.is<HTMLElement>(image.parentNode, 'figure.image') ? image.parentNode : image;

    editor.dom.remove(elm);
    editor.focus();
    editor.nodeChanged();

    if (editor.dom.isEmpty(editor.getBody())) {
      editor.setContent('');
      editor.selection.setCursorLocation();
    }
  }
};

const writeImageDataToSelection = (editor: Editor, data: ImageData) => {
  const image = getSelectedImage(editor);

  if (image) {
    write((css) => normalizeCss(editor, css), data, image);
    syncSrcAttr(editor, image);

    if (isFigure(image.parentNode)) {
      const figure = image.parentNode;
      splitTextBlock(editor, figure);
      editor.selection.select(image.parentNode);
    } else {
      editor.selection.select(image);
      Utils.waitLoadImage(editor, data, image);
    }
  }
};

const sanitizeImageData = (editor: Editor, data: ImageData): ImageData => {
  // Sanitize the URL
  const src = data.src;
  return {
    ...data,
    src: Utils.isSafeImageUrl(editor, src) ? src : ''
  };
};

const insertOrUpdateImage = (editor: Editor, partialData: Partial<ImageData>): void => {
  const image = getSelectedImage(editor);
  if (image) {
    const selectedImageData = read((css) => normalizeCss(editor, css), image);
    const data = { ...selectedImageData, ...partialData };
    const sanitizedData = sanitizeImageData(editor, data);

    if (data.src) {
      writeImageDataToSelection(editor, sanitizedData);
    } else {
      deleteImage(editor, image);
    }
  } else if (partialData.src) {
    insertImageAtCaret(editor, { ...defaultData(), ...partialData });
  }
};

export {
  normalizeCss,
  getSelectedImage,
  readImageDataFromSelection,
  insertOrUpdateImage
};
