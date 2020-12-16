/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';
import Promise from 'tinymce/core/api/util/Promise';
import * as Settings from '../api/Settings';
import * as DataToHtml from './DataToHtml';
import { MediaData } from './Types';

const cache = {};
const embedPromise = (data: MediaData, dataToHtml: DataToHtml.DataToHtmlCallback, handler) => {
  return new Promise<{url: string; html: string}>((res, rej) => {
    const wrappedResolve = (response) => {
      if (response.html) {
        cache[data.source] = response;
      }
      return res({
        url: data.source,
        html: response.html ? response.html : dataToHtml(data)
      });
    };
    if (cache[data.source]) {
      wrappedResolve(cache[data.source]);
    } else {
      handler({ url: data.source }, wrappedResolve, rej);
    }
  });
};

const defaultPromise = (data: MediaData, dataToHtml: DataToHtml.DataToHtmlCallback) => {
  return new Promise<{url: string; html: string}>((res) => {
    res({ html: dataToHtml(data), url: data.source });
  });
};

const loadedData = (editor: Editor) => {
  return (data: MediaData) => {
    return DataToHtml.dataToHtml(editor, data);
  };
};

const getEmbedHtml = (editor: Editor, data: MediaData) => {
  const embedHandler = Settings.getUrlResolver(editor);

  return embedHandler ? embedPromise(data, loadedData(editor), embedHandler) : defaultPromise(data, loadedData(editor));
};

const isCached = (url: string) => {
  return cache.hasOwnProperty(url);
};

export {
  getEmbedHtml,
  isCached
};
