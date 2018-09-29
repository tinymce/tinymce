/**
 * Utils.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { FileReader } from '@ephox/sand';
import Promise from 'tinymce/core/api/util/Promise';
import Tools from 'tinymce/core/api/util/Tools';
import XHR from 'tinymce/core/api/util/XHR';
import Settings from '../api/Settings';
import { document } from '@ephox/dom-globals';
import { Editor } from 'tinymce/core/api/Editor';

/**
 * @class tinymce.image.core.Utils
 * @private
 */

const parseIntAndGetMax = function (val1, val2) {
  return Math.max(parseInt(val1, 10), parseInt(val2, 10));
};

const getImageSize = function (url, callback) {
  const img = document.createElement('img');

  function done(width, height) {
    if (img.parentNode) {
      img.parentNode.removeChild(img);
    }

    callback({ width, height });
  }

  img.onload = function () {
    const width = parseIntAndGetMax(img.width, img.clientWidth);
    const height = parseIntAndGetMax(img.height, img.clientHeight);
    done(width, height);
  };

  img.onerror = function () {
    done(0, 0);
  };

  const style = img.style;
  style.visibility = 'hidden';
  style.position = 'fixed';
  style.bottom = style.left = '0px';
  style.width = style.height = 'auto';

  document.body.appendChild(img);
  img.src = url;
};

const buildListItems = function (inputList, itemCallback, startItems?) {
  function appendItems(values, output?) {
    output = output || [];

    Tools.each(values, function (item) {
      const menuItem: any = { text: item.text || item.title };

      if (item.menu) {
        menuItem.menu = appendItems(item.menu);
      } else {
        menuItem.value = item.value;
        itemCallback(menuItem);
      }

      output.push(menuItem);
    });

    return output;
  }

  return appendItems(inputList, startItems || []);
};

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

const mergeMargins = function (css) {
  if (css.margin) {

    const splitMargin = css.margin.split(' ');

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

const createImageList = function (editor, callback) {
  const imageList = Settings.getImageList(editor);

  if (typeof imageList === 'string') {
    XHR.send({
      url: imageList,
      success (text) {
        callback(JSON.parse(text));
      }
    });
  } else if (typeof imageList === 'function') {
    imageList(callback);
  } else {
    callback(imageList);
  }
};

const waitLoadImage = function (editor, data, imgElm) {
  function selectImage() {
    imgElm.onload = imgElm.onerror = null;

    if (editor.selection) {
      editor.selection.select(imgElm);
      editor.nodeChanged();
    }
  }

  imgElm.onload = function () {
    if (!data.width && !data.height && Settings.hasDimensions(editor)) {
      editor.dom.setAttribs(imgElm, {
        width: imgElm.clientWidth,
        height: imgElm.clientHeight
      });
    }

    selectImage();
  };

  imgElm.onerror = selectImage;
};

const blobToDataUri = function (blob) {
  return new Promise<string>(function (resolve, reject) {
    const reader = new FileReader();
    reader.onload = function () {
      resolve(reader.result);
    };
    reader.onerror = function () {
      reject(FileReader.error.message);
    };
    reader.readAsDataURL(blob);
  });
};

const setImageToPreview = function (editor: Editor, srcString: string) {
  const params = Settings.getPreview(editor);
  const preview = document.getElementById(params.id);
  const emptyImgSrc = params.emptyImgSrc || 'data:image/jpeg;base64,/9j/4QCLRXhpZgAATU0AKgAAAAgABgEPAAIAAAAIAAAAVgESAAMAAAABAAEAAAEaAAUAAAABAAAAXgEbAAUAAAABAAAAZgEoAAMAAAABAAIAAAExAAIAAAAVAAAAbgAAAABCZUZ1bmt5AAAAASwAAAABAAABLAAAAAFCZUZ1bmt5IFBob3RvIEVkaXRvcgD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCACgAKADASIAAhEBAxEB/8QAHAABAQADAAMBAAAAAAAAAAAAAAYCBAUBAwcJ/8QAOhAAAgICAQMBBAUICwAAAAAAAAECAwQFEQYSIRMUMUFhByJRcYEyMzZCVHKCshUXJCWRkpOxwdHS/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AP1TAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAxnLthKS96XJkYXfmp/usCL1XUHVO5woZeLh4EqZtpOUmn4fD/AFjb9r6x/Ydf/nf/AKOXodTfuOiNZTVJ+nHKc7qlLt9StTfMeS9qqhTXGuuKhCK4jFe5ICUtz+r6a5zlg6/tinJ/XfuX8R2OlttbvNHjZt0YQts7uVBPjxJr4/cbWbk0zozKY2wldCpuVaku6KafDaOR9Hv6I4P8f87AowSnWedsMLY6h4EpOS9aydKk0rYxUW018fHPBsZm39ty+nbsS6Sx8q2Tkoy4Ul2N8NfJgUYJSnGu6o2uzdudlY2LiXez1VYtnp8tLzJv4m70tlZLnscDKulkzwruyN0/ypQa5jz8wO8Dg52VdDrHWURtnGmePbKVak+2TXubRzelN5kWb3aYOXZOyE77ZY0py5/JlxKK+5NPgCwBIa3d5Gy65uhGya18KZ11wUvqzlGSUpcfe2ufkYdU7nMo3MZ4lkli6yMLsuEW+Jqcku1/bxHlgWQOD1TsbqsLCpw7vStzsiFEbl57Yy8uS/AwxtHZq8+iePuMice7i+nMt9RTXHw+xgUII3KcMzqraU5W4ydfTTCp1QqyvST5j58MotLiVYuLL0c6/YVzlyrbrvV+XCf2eAOgAABhd+an+6zMxsj3Qkl72mgPleJ1pLQdIYmHiL+22d8vUa8Vx75efm/BuL6VLP6D7HT/AHp+T38fU/e+/wCRhD6O9oqaq7MfW3utOKnO21Pjlv4cL4s8/wBXWw/YtX/r3f8AYEto8/JlvqrndN23Sask35mn70z6l9Hv6I4P8f8AOyZo6B2mLdG2rE1cbI+Yy9a58P7fLLLpTVXaTRY2HkOEra+7l1vleZN/8gera0zn1PopxhKUILI7pJeI8wXHLOLbp8nV9W66umuU9ZO+eRDtTapk4NSj8k3w0WwAk8bNfS212kMvHyJY+Ve8im6mpzi+V5i+Pczc6VovnZsthfTPG9tuU66rFxJQS4Ta+DZQACfzqLJdZ6u1Vydcce1Smk+E/mzk06LLzcDNniv2bYU7K62iyxOKafCf4Nf7FsAJbD1a02/11cITdGPr5xlYotpy7k3+L8s0tZ0/tdrh5mVLPWDHZSlKzHsxVOSj5STbfPuLYARHs+dZ05r28ey7L1GYu+vt4lbCDa5j9v1Wv8BsI4nVG1wZYWvujkRvhbkZdtLh2Qj+ry/e/cW4AiM14eL1ZtbNhrbcyqyFKqksV2pcR8/D7il0WXiZWG1h4s8SmuTj6c6fS8+/wvxOkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/9k=';
  const brokenImgSrc = params.brokenImgSrc || 'data:image/jpeg;base64,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';
  
  if (srcString) {
    preview.innerHTML 
      = `<img src="${srcString}" style="height: 100%;" onerror=" this.onerror=null; this.src='${brokenImgSrc}'; this.title='Broken image url'" title="">`;
  }
  else {
    preview.innerHTML 
      = `<img src="${emptyImgSrc}" style="height: 100%;" title="No image">`;
  }
}

export default {
  getImageSize,
  buildListItems,
  removePixelSuffix,
  addPixelSuffix,
  mergeMargins,
  createImageList,
  waitLoadImage,
  blobToDataUri,
  setImageToPreview
};