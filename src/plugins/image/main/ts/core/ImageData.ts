/**
 * ImageData.ts
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2018 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Utils from "tinymce/plugins/image/core/Utils";
import DOMUtils from "tinymce/core/api/dom/DOMUtils";

const DOM = DOMUtils.DOM;

export interface ImageData {
  src: string;
  alt: string;
  title: string;
  width: string;
  height: string;
  class: string;
  style: string;
  caption: boolean;
  hspace: string;
  vspace: string;
  borderWidth: string;
  borderStyle: string;
}

type CssNormalizer = (css: string) => string;

const getHspace = (image: HTMLElement): string => {
  if (image.style.marginLeft && image.style.marginRight && image.style.marginLeft === image.style.marginRight) {
    return Utils.removePixelSuffix(image.style.marginLeft);
  } else {
    return '';
  }
};

const getVspace = (image: HTMLElement): string => {
  if (image.style.marginTop && image.style.marginBottom && image.style.marginTop === image.style.marginBottom) {
    return Utils.removePixelSuffix(image.style.marginTop);
  } else {
    return '';
  }
};

const getBorder = (image: HTMLElement): string => {
  if (image.style.borderWidth) {
    return Utils.removePixelSuffix(image.style.borderWidth);
  } else {
    return '';
  }
};

const getAttrib = (image: HTMLElement, name: string): string => {
  if (image.hasAttribute(name)) {
    return image.getAttribute(name);
  } else {
    return '';
  }
};

const getStyle = (image: HTMLElement, name: string): string => {
  return image.style[name] ? image.style[name] : '';
};

const hasCaption = (image: HTMLElement): boolean => {
  return image.parentNode && image.parentNode.nodeName === 'FIGURE';
};

const updateAttrib = (image: HTMLElement, oldData: ImageData, newData: ImageData, name: string) => {
  if (newData[name] !== oldData[name]) {
    image.setAttribute(name, newData[name]);
  }
};

const createFigure = (image: HTMLElement) => {
  const figureElm = DOM.create('figure', { class: 'image' });
  DOM.insertAfter(figureElm, image);

  figureElm.appendChild(image);
  figureElm.appendChild(DOM.create('figcaption', { contentEditable: true }, 'Caption'));
  figureElm.contentEditable = 'false';
};

const removeFigure = (image: HTMLElement) => {
  const figureElm = image.parentNode;
  DOM.insertAfter(image, figureElm);
  DOM.remove(figureElm);
};

const updateCaption = (image: HTMLElement, oldData: ImageData, newData: ImageData) => {
  if (newData.caption !== oldData.caption) {
    if (hasCaption(image)) {
      removeFigure(image);
    } else {
      createFigure(image);
    }
  }
};

const normalizeStyle = (image: HTMLElement, normalizeCss: CssNormalizer) => {
  const attrValue = image.getAttribute('style');
  const value = normalizeCss(attrValue !== null ? attrValue : '');

  if (value.length > 0) {
    image.setAttribute('style', value);
  } else {
    image.removeAttribute('style');
  }
};

const updateHspace = (image: HTMLElement, oldData: ImageData, newData: ImageData, normalizeCss: CssNormalizer) => {
  if (newData.hspace !== oldData.hspace) {
    const value = Utils.addPixelSuffix(newData.hspace);
    image.style.marginLeft = value;
    image.style.marginRight = value;
    normalizeStyle(image, normalizeCss);
  }
};

const updateVspace = (image: HTMLElement, oldData: ImageData, newData: ImageData, normalizeCss: CssNormalizer) => {
  if (newData.vspace !== oldData.vspace) {
    const value = Utils.addPixelSuffix(newData.vspace);
    image.style.marginTop = value;
    image.style.marginBottom = value;
    normalizeStyle(image, normalizeCss);
  }
};

const updateBorder = (image: HTMLElement, oldData: ImageData, newData: ImageData, normalizeCss: CssNormalizer) => {
  if (newData.borderWidth !== oldData.borderWidth) {
    const value = Utils.addPixelSuffix(newData.borderWidth);
    image.style.borderWidth = value;
    normalizeStyle(image, normalizeCss);
  }
};

const updateStyle = (image: HTMLElement, oldData: ImageData, newData: ImageData, name: string, normalizeCss: CssNormalizer) => {
  if (newData[name] !== oldData[name]) {
    image.style[name] = newData[name];
    normalizeStyle(image, normalizeCss);
  }
};

export const read = (normalizeCss: CssNormalizer, image: HTMLElement): ImageData => {
  return {
    src: getAttrib(image, 'src'),
    alt: getAttrib(image, 'alt'),
    title: getAttrib(image, 'title'),
    width: getAttrib(image, 'width'),
    height: getAttrib(image, 'height'),
    class: getAttrib(image, 'class'),
    style: normalizeCss(getAttrib(image, 'style')),
    caption: hasCaption(image),
    hspace: getHspace(image),
    vspace: getVspace(image),
    borderWidth: getBorder(image),
    borderStyle: getStyle(image, 'borderStyle')
  };
};

export const write = (normalizeCss: CssNormalizer, newData: ImageData, image: HTMLElement) => {
  const oldData = read(normalizeCss, image);

  updateAttrib(image, oldData, newData, 'src');
  updateAttrib(image, oldData, newData, 'alt');
  updateAttrib(image, oldData, newData, 'title');
  updateAttrib(image, oldData, newData, 'width');
  updateAttrib(image, oldData, newData, 'height');
  updateAttrib(image, oldData, newData, 'class');
  updateAttrib(image, oldData, newData, 'style');
  updateCaption(image, oldData, newData);
  updateHspace(image, oldData, newData, normalizeCss);
  updateVspace(image, oldData, newData, normalizeCss);
  updateBorder(image, oldData, newData, normalizeCss);
  updateStyle(image, oldData, newData, 'borderHeight', normalizeCss);
  updateStyle(image, oldData, newData, 'borderStyle', normalizeCss);
};
