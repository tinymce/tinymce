/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Optional } from '@ephox/katamari';

import Promise from '../api/util/Promise';

/**
 * Converts blob/uris back and forth.
 *
 * @private
 * @class tinymce.file.Conversions
 */

const blobUriToBlob = (url: string): Promise<Blob> => {
  return new Promise((resolve, reject) => {

    const rejectWithError = () => {
      reject('Cannot convert ' + url + ' to Blob. Resource might not exist or is inaccessible.');
    };

    try {
      const xhr = new XMLHttpRequest();

      xhr.open('GET', url, true);
      xhr.responseType = 'blob';

      xhr.onload = () => {
        if (xhr.status === 200) {
          resolve(xhr.response);
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

const parseDataUri = (uri: string) => {
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

const buildBlob = (type: string, data: string): Optional<Blob> => {
  let str: string;

  // Might throw error if data isn't proper base64
  try {
    str = atob(data);
  } catch (e) {
    return Optional.none();
  }

  const arr = new Uint8Array(str.length);

  for (let i = 0; i < arr.length; i++) {
    arr[i] = str.charCodeAt(i);
  }

  return Optional.some(new Blob([ arr ], { type }));
};

const dataUriToBlob = (uri: string): Promise<Blob> => {
  return new Promise((resolve) => {
    const { type, data } = parseDataUri(uri);

    buildBlob(type, data).fold(
      () => resolve(new Blob([])), // TODO: Consider rejecting here instead
      resolve
    );
  });
};

const uriToBlob = (url: string): Promise<Blob> => {
  if (url.indexOf('blob:') === 0) {
    return blobUriToBlob(url);
  }

  if (url.indexOf('data:') === 0) {
    return dataUriToBlob(url);
  }

  return null;
};

const blobToDataUri = (blob: Blob): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      resolve(reader.result as string);
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
