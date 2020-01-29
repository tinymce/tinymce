/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { FormData, XMLHttpRequest } from '@ephox/dom-globals';
import { Fun } from '@ephox/katamari';
import { BlobInfo } from 'tinymce/core/api/file/BlobCache';
import Promise from 'tinymce/core/api/util/Promise';
import Tools from 'tinymce/core/api/util/Tools';

/**
 * This is basically cut down version of tinymce.core.file.Uploader, which we could use directly
 * if it wasn't marked as private.
 */

// TODO: TINY-4601 Remove this file and expose the core uploader instead to remove duplication

export type SuccessCallback = (path: string) => void;
export type FailureCallback = (error: string) => void;
export type ProgressCallback = (percent: number) => void;
export type UploadHandler = (blobInfo: BlobInfo, success: SuccessCallback, failure: FailureCallback, progress: ProgressCallback) => void;

export interface UploaderSettings {
  url?: string;
  credentials?: boolean;
  basePath?: string;
  handler?: UploadHandler;
}

const pathJoin = (path1: string | undefined, path2: string) => {
  if (path1) {
    return path1.replace(/\/$/, '') + '/' + path2.replace(/^\//, '');
  }

  return path2;
};

export default (settings: UploaderSettings) => {
  const defaultHandler = (blobInfo: BlobInfo, success: SuccessCallback, failure: FailureCallback, progress: ProgressCallback) => {
    let xhr, formData;

    xhr = new XMLHttpRequest();
    xhr.open('POST', settings.url);
    xhr.withCredentials = settings.credentials;

    xhr.upload.onprogress = (e) => {
      progress(e.loaded / e.total * 100);
    };

    xhr.onerror = () => {
      failure('Image upload failed due to a XHR Transport error. Code: ' + xhr.status);
    };

    xhr.onload = () => {
      let json;

      if (xhr.status < 200 || xhr.status >= 300) {
        failure('HTTP Error: ' + xhr.status);
        return;
      }

      json = JSON.parse(xhr.responseText);

      if (!json || typeof json.location !== 'string') {
        failure('Invalid JSON: ' + xhr.responseText);
        return;
      }

      success(pathJoin(settings.basePath, json.location));
    };

    formData = new FormData();
    formData.append('file', blobInfo.blob(), blobInfo.filename());

    xhr.send(formData);
  };

  const uploadBlob = (blobInfo: BlobInfo, handler: UploadHandler) => {
    return new Promise<string>((resolve, reject) => {
      try {
        handler(blobInfo, resolve, reject, Fun.noop);
      } catch (ex) {
        reject(ex.message);
      }
    });
  };

  const isDefaultHandler = (handler: Function) => {
    return handler === defaultHandler;
  };

  const upload = (blobInfo: BlobInfo): Promise<string> => {
    return (!settings.url && isDefaultHandler(settings.handler)) ? Promise.reject('Upload url missing from the settings.') : uploadBlob(blobInfo, settings.handler);
  };

  settings = Tools.extend({
    credentials: false,
    handler: defaultHandler
  }, settings);

  return {
    upload
  };
};
