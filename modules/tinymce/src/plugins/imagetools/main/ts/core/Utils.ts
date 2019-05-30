/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { FileReader, XMLHttpRequest } from '@ephox/sand';

import Promise from 'tinymce/core/api/util/Promise';
import Tools from 'tinymce/core/api/util/Tools';
import { Blob } from '@ephox/dom-globals';

const isValue = function (obj) {
  return obj !== null && obj !== undefined;
};

const traverse = function (json, path) {
  let value;

  value = path.reduce(function (result, key) {
    return isValue(result) ? result[key] : undefined;
  }, json);

  return isValue(value) ? value : null;
};

const requestUrlAsBlob = function (url: string, headers: Record<string, string>, withCredentials: boolean) {
  return new Promise<{status: number, blob: Blob}>(function (resolve) {
    let xhr;

    xhr = XMLHttpRequest();

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        resolve({
          status: xhr.status,
          blob: this.response
        });
      }
    };

    xhr.open('GET', url, true);

    xhr.withCredentials = withCredentials;

    Tools.each(headers, function (value, key) {
      xhr.setRequestHeader(key, value);
    });

    xhr.responseType = 'blob';
    xhr.send();
  });
};

const readBlob = function (blob) {
  return new Promise(function (resolve) {
    const fr = FileReader();

    fr.onload = function (e) {
      const data = e.target;
      resolve(data.result);
    };

    fr.readAsText(blob);
  });
};

const parseJson = function (text) {
  let json;

  try {
    json = JSON.parse(text);
  } catch (ex) {
    // Ignore
  }

  return json;
};

export default {
  traverse,
  readBlob,
  requestUrlAsBlob,
  parseJson
};