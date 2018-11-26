/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Promise from 'tinymce/core/api/util/Promise';
import Settings from '../api/Settings';
import DataToHtml, { MediaDialogData, DataToHtmlCallback } from './DataToHtml';
import { Editor } from 'tinymce/core/api/Editor';

const cache = {};
const embedPromise = function (data: MediaDialogData, dataToHtml: DataToHtmlCallback, handler) {
  return new Promise<{url: string, html: string}>(function (res, rej) {
    const wrappedResolve = function (response) {
      if (response.html) {
        cache[data.source1] = response;
      }
      return res({
        url: data.source1,
        html: response.html ? response.html : dataToHtml(data)
      });
    };
    if (cache[data.source1]) {
      wrappedResolve(cache[data.source1]);
    } else {
      handler({ url: data.source1 }, wrappedResolve, rej);
    }
  });
};

const defaultPromise = function (data: MediaDialogData, dataToHtml: DataToHtmlCallback) {
  return new Promise<{url: string, html: string}>(function (res) {
    res({ html: dataToHtml(data), url: data.source1 });
  });
};

const loadedData = function (editor: Editor) {
  return function (data: MediaDialogData) {
    return DataToHtml.dataToHtml(editor, data);
  };
};

const getEmbedHtml = function (editor: Editor, data: MediaDialogData) {
  const embedHandler = Settings.getUrlResolver(editor);

  return embedHandler ? embedPromise(data, loadedData(editor), embedHandler) : defaultPromise(data, loadedData(editor));
};

const isCached = function (url) {
  return cache.hasOwnProperty(url);
};

export default {
  getEmbedHtml,
  isCached
};