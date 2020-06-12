/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { atob, Blob, FileReader, XMLHttpRequest } from '@ephox/dom-globals';
import { Option } from '@ephox/katamari';
import Promise from '../api/util/Promise';

/**
 * Converts blob/uris back and forth.
 *
 * @private
 * @class tinymce.file.Conversions
 */

const blobUriToBlob = function (url: string): Promise<Blob> {
  return new Promise(function (resolve, reject) {

    const rejectWithError = function () {
      reject('Cannot convert ' + url + ' to Blob. Resource might not exist or is inaccessible.');
    };

    try {
      const xhr = new XMLHttpRequest();

      xhr.open('GET', url, true);
      xhr.responseType = 'blob';

      xhr.onload = function () {
        if (this.status === 200) {
          resolve(this.response);
        } else {
          // IE11 makes it into onload but responds with status 500
          rejectWithError();
        }
      };

      // Chrome fires an error event instead of the exception
      // Also there seems to be no way to intercept the message that is logged to the console
      xhr.onerror = rejectWithError;

      xhr.send();
    } catch (ex) {
      rejectWithError();
    }
  });
};

const parseDataUri = function (uri: string) {
  let type;

  const uriParts = decodeURIComponent(uri).split(',');

  const matches = /data:([^;]+)/.exec(uriParts[0]);
  if (matches) {
    type = matches[1];
  }

  return {
    type,
    data: uriParts[1]
  };
};

const buildBlob = (type: string, data: string): Option<Blob> => {
  let str: string;

  // Might throw error if data isn't proper base64
  try {
    str = atob(data);
  } catch (e) {
    return Option.none();
  }

  const arr = new Uint8Array(str.length);

  for (let i = 0; i < arr.length; i++) {
    arr[i] = str.charCodeAt(i);
  }

  return Option.some(new Blob([ arr ], { type }));
};

const dataUriToBlob = function (uri: string): Promise<Blob> {
  return new Promise((resolve) => {
    const { type, data } = parseDataUri(uri);

    buildBlob(type, data).fold(
      () => resolve(new Blob([])), // TODO: Consider rejecting here instead
      resolve
    );
  });
};

const uriToBlob = function (url: string): Promise<Blob> {
  if (url.indexOf('blob:') === 0) {
    return blobUriToBlob(url);
  }

  if (url.indexOf('data:') === 0) {
    return dataUriToBlob(url);
  }

  return null;
};

const blobToDataUri = function (blob: Blob): Promise<string> {
  return new Promise(function (resolve) {
    const reader = new FileReader();

    reader.onloadend = function () {
      resolve(reader.result);
    };

    reader.readAsDataURL(blob);
  });
};

export {
  buildBlob,
  uriToBlob,
  blobToDataUri,
  parseDataUri
};
