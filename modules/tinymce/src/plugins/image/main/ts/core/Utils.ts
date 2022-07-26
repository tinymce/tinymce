import { Type } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import { StyleMap } from 'tinymce/core/api/html/Styles';
import URI from 'tinymce/core/api/util/URI';

import * as Options from '../api/Options';
import { UserListItem } from '../ui/DialogTypes';
import { ImageData } from './ImageData';

export interface ImageDimensions {
  readonly width: number;
  readonly height: number;
}

// TODO: Figure out if these would ever be something other than numbers. This was added in: #TINY-1350
const parseIntAndGetMax = (val1: any, val2: any): number =>
  Math.max(parseInt(val1, 10), parseInt(val2, 10));

const getImageSize = (url: string): Promise<ImageDimensions> => new Promise((callback) => {
  const img = document.createElement('img');

  const done = (dimensions: Promise<ImageDimensions>): void => {
    img.onload = img.onerror = null;

    if (img.parentNode) {
      img.parentNode.removeChild(img);
    }

    callback(dimensions);
  };

  img.onload = () => {
    const width = parseIntAndGetMax(img.width, img.clientWidth);
    const height = parseIntAndGetMax(img.height, img.clientHeight);
    const dimensions = { width, height };
    done(Promise.resolve(dimensions));
  };

  img.onerror = () => {
    done(Promise.reject(`Failed to get image dimensions for: ${url}`));
  };

  const style = img.style;
  style.visibility = 'hidden';
  style.position = 'fixed';
  style.bottom = style.left = '0px';
  style.width = style.height = 'auto';

  document.body.appendChild(img);
  img.src = url;
});

const removePixelSuffix = (value: string): string => {
  if (value) {
    value = value.replace(/px$/, '');
  }
  return value;
};

const addPixelSuffix = (value: string): string => {
  if (value.length > 0 && /^[0-9]+$/.test(value)) {
    value += 'px';
  }
  return value;
};

const mergeMargins = (css: StyleMap): StyleMap => {
  if (css.margin) {
    const splitMargin = String(css.margin).split(' ');

    switch (splitMargin.length) {
      case 1: // margin: toprightbottomleft;
        css['margin-top'] = css['margin-top'] || splitMargin[0];
        css['margin-right'] = css['margin-right'] || splitMargin[0];
        css['margin-bottom'] = css['margin-bottom'] || splitMargin[0];
        css['margin-left'] = css['margin-left'] || splitMargin[0];
        break;
      case 2: // margin: topbottom rightleft;
        css['margin-top'] = css['margin-top'] || splitMargin[0];
        css['margin-right'] = css['margin-right'] || splitMargin[1];
        css['margin-bottom'] = css['margin-bottom'] || splitMargin[0];
        css['margin-left'] = css['margin-left'] || splitMargin[1];
        break;
      case 3: // margin: top rightleft bottom;
        css['margin-top'] = css['margin-top'] || splitMargin[0];
        css['margin-right'] = css['margin-right'] || splitMargin[1];
        css['margin-bottom'] = css['margin-bottom'] || splitMargin[2];
        css['margin-left'] = css['margin-left'] || splitMargin[1];
        break;
      case 4: // margin: top right bottom left;
        css['margin-top'] = css['margin-top'] || splitMargin[0];
        css['margin-right'] = css['margin-right'] || splitMargin[1];
        css['margin-bottom'] = css['margin-bottom'] || splitMargin[2];
        css['margin-left'] = css['margin-left'] || splitMargin[3];
    }

    delete css.margin;
  }

  return css;
};

// TODO: Input on this callback should really be validated
const createImageList = (editor: Editor, callback: (imageList: false | UserListItem[]) => void): void => {
  const imageList = Options.getImageList(editor);

  if (Type.isString(imageList)) {
    fetch(imageList)
      .then((res) => {
        if (res.ok) {
          res.json().then(callback);
        }
      });
  } else if (Type.isFunction(imageList)) {
    imageList(callback);
  } else {
    callback(imageList);
  }
};

const waitLoadImage = (editor: Editor, data: ImageData, imgElm: HTMLElement): void => {
  const selectImage = (): void => {
    imgElm.onload = imgElm.onerror = null;

    if (editor.selection) {
      editor.selection.select(imgElm);
      editor.nodeChanged();
    }
  };

  imgElm.onload = () => {
    if (!data.width && !data.height && Options.hasDimensions(editor)) {
      editor.dom.setAttribs(imgElm, {
        width: String(imgElm.clientWidth),
        height: String(imgElm.clientHeight)
      });
    }

    selectImage();
  };

  imgElm.onerror = selectImage;
};

const blobToDataUri = (blob: Blob): Promise<string> => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => {
    resolve(reader.result as string);
  };
  reader.onerror = () => {
    reject(reader.error?.message);
  };
  reader.readAsDataURL(blob);
});

const isPlaceholderImage = (imgElm: Element): imgElm is HTMLImageElement =>
  imgElm.nodeName === 'IMG' && (imgElm.hasAttribute('data-mce-object') || imgElm.hasAttribute('data-mce-placeholder'));

const isSafeImageUrl = (editor: Editor, src: string): boolean => {
  const getOption = editor.options.get;
  return URI.isDomSafe(src, 'img', {
    allow_html_data_urls: getOption('allow_html_data_urls'),
    allow_script_urls: getOption('allow_script_urls'),
    allow_svg_data_urls: getOption('allow_svg_data_urls')
  });
};

export {
  getImageSize,
  removePixelSuffix,
  addPixelSuffix,
  mergeMargins,
  createImageList,
  waitLoadImage,
  blobToDataUri,
  isPlaceholderImage,
  isSafeImageUrl
};
