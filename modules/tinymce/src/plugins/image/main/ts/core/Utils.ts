import { Type } from '@ephox/katamari';

import type Editor from 'tinymce/core/api/Editor';
import type { StyleMap } from 'tinymce/core/api/html/Styles';
import URI from 'tinymce/core/api/util/URI';

import * as Options from '../api/Options';
import type { UserListItem } from '../ui/DialogTypes';

import type { ImageData } from './ImageData';

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
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    fetch(imageList)
      .then((res) => {
        if (res.ok) {
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
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
  removePixelSuffix,
  addPixelSuffix,
  mergeMargins,
  createImageList,
  waitLoadImage,
  blobToDataUri,
  isPlaceholderImage,
  isSafeImageUrl
};
