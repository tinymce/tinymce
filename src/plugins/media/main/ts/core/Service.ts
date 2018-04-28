/**
 * Service.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Promise from 'tinymce/core/api/util/Promise';
import Settings from '../api/Settings';
import DataToHtml from './DataToHtml';

const cache = {};
const embedPromise = function (data, dataToHtml, handler) {
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

const defaultPromise = function (data, dataToHtml) {
  return new Promise<{url: string, html: string}>(function (res) {
    res({ html: dataToHtml(data), url: data.source1 });
  });
};

const loadedData = function (editor) {
  return function (data) {
    return DataToHtml.dataToHtml(editor, data);
  };
};

const getEmbedHtml = function (editor, data) {
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