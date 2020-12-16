/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Promise from 'tinymce/core/api/util/Promise';
import Tools from 'tinymce/core/api/util/Tools';

const isValue = (obj) => {
  return obj !== null && obj !== undefined;
};

const traverse = (json, path) => {
  const value = path.reduce((result, key) => {
    return isValue(result) ? result[key] : undefined;
  }, json);

  return isValue(value) ? value : null;
};

const requestUrlAsBlob = (url: string, headers: Record<string, string>, withCredentials: boolean) => {
  return new Promise<{status: number; blob: Blob}>((resolve) => {
    const xhr = new XMLHttpRequest();

    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        resolve({
          status: xhr.status,
          blob: xhr.response
        });
      }
    };

    xhr.open('GET', url, true);

    xhr.withCredentials = withCredentials;

    Tools.each(headers, (value, key) => {
      xhr.setRequestHeader(key, value);
    });

    xhr.responseType = 'blob';
    xhr.send();
  });
};

const readBlob = (blob) => {
  return new Promise((resolve) => {
    const fr = new FileReader();

    fr.onload = (e) => {
      const data = e.target;
      resolve(data.result);
    };

    fr.readAsText(blob);
  });
};

const parseJson = (text) => {
  let json;

  try {
    json = JSON.parse(text);
  } catch (ex) {
    // Ignore
  }

  return json;
};

export {
  traverse,
  readBlob,
  requestUrlAsBlob,
  parseJson
};
