import { Type } from '@ephox/katamari';
import { Attribute, SugarElement } from '@ephox/sugar';

import DOMUtils from 'tinymce/core/api/dom/DOMUtils';

import * as Utils from './Utils';

const DOM = DOMUtils.DOM;

interface ImageData {
  readonly src: string;
  readonly alt: string | null;
  readonly title: string;
  readonly width: string;
  readonly height: string;
  readonly class: string;
  readonly style: string;
  readonly caption: boolean;
  readonly hspace: string;
  readonly vspace: string;
  readonly border: string;
  readonly borderStyle: string;
  readonly isDecorative: boolean;
}

type CssNormalizer = (css: string | undefined) => string;
type UpdateImageProp = <T extends string>(image: HTMLElement, name: T, value: string) => void;

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
    return image.getAttribute(name) ?? '';
  } else {
    return '';
  }
};

const hasCaption = (image: HTMLElement): boolean =>
  image.parentNode !== null && image.parentNode.nodeName === 'FIGURE';

const updateAttrib = (image: HTMLElement, name: string, value: string | null): void => {
  if (value === '' || value === null) {
    image.removeAttribute(name);
  } else {
    image.setAttribute(name, value);
  }
};

const wrapInFigure = (image: HTMLElement): void => {
  const figureElm = DOM.create('figure', { class: 'image' });
  DOM.insertAfter(figureElm, image);

  figureElm.appendChild(image);
  figureElm.appendChild(DOM.create('figcaption', { contentEditable: 'true' }, 'Caption'));
  figureElm.contentEditable = 'false';
};

const removeFigure = (image: HTMLElement): void => {
  const figureElm = image.parentNode;
  if (Type.isNonNullable(figureElm)) {
    DOM.insertAfter(image, figureElm);
    DOM.remove(figureElm);
  }
};

const toggleCaption = (image: HTMLElement): void => {
  if (hasCaption(image)) {
    removeFigure(image);
  } else {
    wrapInFigure(image);
  }
};

const normalizeStyle = (image: HTMLElement, normalizeCss: CssNormalizer): void => {
  const attrValue = image.getAttribute('style');
  const value = normalizeCss(attrValue !== null ? attrValue : '');

  if (value.length > 0) {
    image.setAttribute('style', value);
    image.setAttribute('data-mce-style', value);
  } else {
    image.removeAttribute('style');
  }
};

const setSize = (name: string, normalizeCss: CssNormalizer) => (image: HTMLElement, name: string, value: string): void => {
  const styles = image.style as any;
  if (styles[name]) {
    styles[name] = Utils.addPixelSuffix(value);
    normalizeStyle(image, normalizeCss);
  } else {
    updateAttrib(image, name, value);
  }
};

const getSize = (image: HTMLElement, name: 'height' | 'width'): string => {
  if (image.style[name]) {
    return Utils.removePixelSuffix(image.style[name]);
  } else {
    return getAttrib(image, name);
  }
};

const setHspace = (image: HTMLElement, value: string): void => {
  const pxValue = Utils.addPixelSuffix(value);
  image.style.marginLeft = pxValue;
  image.style.marginRight = pxValue;
};

const setVspace = (image: HTMLElement, value: string): void => {
  const pxValue = Utils.addPixelSuffix(value);
  image.style.marginTop = pxValue;
  image.style.marginBottom = pxValue;
};

const setBorder = (image: HTMLElement, value: string): void => {
  const pxValue = Utils.addPixelSuffix(value);
  image.style.borderWidth = pxValue;
};

const setBorderStyle = (image: HTMLElement, value: string): void => {
  image.style.borderStyle = value;
};

const getBorderStyle = (image: HTMLElement): string =>
  image.style.borderStyle ?? '';

const isFigure = (elm: Node | null): elm is HTMLElement =>
  Type.isNonNullable(elm) && elm.nodeName === 'FIGURE';

const isImage = (elm: Node): elm is HTMLImageElement =>
  elm.nodeName === 'IMG';

const getIsDecorative = (image: HTMLElement): boolean =>
  DOM.getAttrib(image, 'alt').length === 0 && DOM.getAttrib(image, 'role') === 'presentation';

const getAlt = (image: HTMLElement): string => {
  if (getIsDecorative(image)) {
    return '';
  } else {
    return getAttrib(image, 'alt');
  }
};

const defaultData = (): ImageData => ({
  src: '',
  alt: '',
  title: '',
  width: '',
  height: '',
  class: '',
  style: '',
  caption: false,
  hspace: '',
  vspace: '',
  border: '',
  borderStyle: '',
  isDecorative: false
});

const getStyleValue = (normalizeCss: CssNormalizer, data: ImageData): string => {
  const image = document.createElement('img');

  updateAttrib(image, 'style', data.style);

  if (getHspace(image) || data.hspace !== '') {
    setHspace(image, data.hspace);
  }

  if (getVspace(image) || data.vspace !== '') {
    setVspace(image, data.vspace);
  }

  if (getBorder(image) || data.border !== '') {
    setBorder(image, data.border);
  }

  if (getBorderStyle(image) || data.borderStyle !== '') {
    setBorderStyle(image, data.borderStyle);
  }

  return normalizeCss(image.getAttribute('style') ?? '');
};

const create = (normalizeCss: CssNormalizer, data: ImageData): HTMLElement => {
  const image = document.createElement('img');
  write(normalizeCss, { ...data, caption: false }, image);
  // Always set alt even if data.alt is an empty string
  setAlt(image, data.alt, data.isDecorative);

  if (data.caption) {
    const figure = DOM.create('figure', { class: 'image' });

    figure.appendChild(image);
    figure.appendChild(DOM.create('figcaption', { contentEditable: 'true' }, 'Caption'));
    figure.contentEditable = 'false';

    return figure;
  } else {
    return image;
  }
};

const read = (normalizeCss: CssNormalizer, image: HTMLElement): ImageData => ({
  src: getAttrib(image, 'src'),
  alt: getAlt(image),
  title: getAttrib(image, 'title'),
  width: getSize(image, 'width'),
  height: getSize(image, 'height'),
  class: getAttrib(image, 'class'),
  style: normalizeCss(getAttrib(image, 'style')),
  caption: hasCaption(image),
  hspace: getHspace(image),
  vspace: getVspace(image),
  border: getBorder(image),
  borderStyle: getBorderStyle(image),
  isDecorative: getIsDecorative(image)
});

const updateProp = (image: HTMLElement, oldData: ImageData, newData: ImageData, name: keyof Omit<ImageData, 'alt'>, set: UpdateImageProp): void => {
  if (newData[name] !== oldData[name]) {
    set(image, name, String(newData[name]));
  }
};

const setAlt = (image: HTMLElement, alt: string | null, isDecorative: boolean): void => {
  if (isDecorative) {
    DOM.setAttrib(image, 'role', 'presentation');
    // unfortunately can't set "" attr value with domutils
    const sugarImage = SugarElement.fromDom(image);
    Attribute.set(sugarImage, 'alt', '');
  } else {
    if (Type.isNull(alt)) {
      const sugarImage = SugarElement.fromDom(image);
      Attribute.remove(sugarImage, 'alt');
    } else {
      // unfortunately can't set "" attr value with domutils
      const sugarImage = SugarElement.fromDom(image);
      Attribute.set(sugarImage, 'alt', alt);
    }
    if (DOM.getAttrib(image, 'role') === 'presentation') {
      DOM.setAttrib(image, 'role', '');
    }
  }
};

const updateAlt = (image: HTMLElement, oldData: ImageData, newData: ImageData): void => {
  if (newData.alt !== oldData.alt || newData.isDecorative !== oldData.isDecorative) {
    setAlt(image, newData.alt, newData.isDecorative);
  }
};

const normalized = (set: (image: HTMLElement, value: string) => void, normalizeCss: CssNormalizer) =>
  (image: HTMLElement, name: string, value: string): void => {
    set(image, value);
    normalizeStyle(image, normalizeCss);
  };

const write = (normalizeCss: CssNormalizer, newData: ImageData, image: HTMLElement): void => {
  const oldData = read(normalizeCss, image);

  updateProp(image, oldData, newData, 'caption', (image, _name, _value) => toggleCaption(image));
  updateProp(image, oldData, newData, 'src', updateAttrib);
  updateProp(image, oldData, newData, 'title', updateAttrib);
  updateProp(image, oldData, newData, 'width', setSize('width', normalizeCss));
  updateProp(image, oldData, newData, 'height', setSize('height', normalizeCss));
  updateProp(image, oldData, newData, 'class', updateAttrib);
  updateProp(image, oldData, newData, 'style', normalized((image, value) => updateAttrib(image, 'style', value), normalizeCss));
  updateProp(image, oldData, newData, 'hspace', normalized(setHspace, normalizeCss));
  updateProp(image, oldData, newData, 'vspace', normalized(setVspace, normalizeCss));
  updateProp(image, oldData, newData, 'border', normalized(setBorder, normalizeCss));
  updateProp(image, oldData, newData, 'borderStyle', normalized(setBorderStyle, normalizeCss));
  updateAlt(image, oldData, newData);
};

export {
  ImageData,
  getStyleValue,
  defaultData,
  isFigure,
  isImage,
  create,
  read,
  write
};
