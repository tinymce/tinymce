/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Optional } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';

const getToolbarItems = (editor: Editor): string =>
  editor.getParam('imagetools_toolbar', 'rotateleft rotateright flipv fliph editimage imageoptions');

const getProxyUrl = (editor: Editor): string =>
  editor.getParam('imagetools_proxy');

const getCorsHosts = (editor: Editor): string[] =>
  editor.getParam('imagetools_cors_hosts', [], 'string[]');

const getCredentialsHosts = (editor: Editor): string[] =>
  editor.getParam('imagetools_credentials_hosts', [], 'string[]');

const getFetchImage = (editor: Editor): Optional<(img: HTMLImageElement) => Promise<Blob>> =>
  Optional.from(editor.getParam('imagetools_fetch_image', null, 'function'));

const getApiKey = (editor: Editor): string =>
  editor.getParam('api_key', editor.getParam('imagetools_api_key', '', 'string'), 'string');

const getUploadTimeout = (editor: Editor): number =>
  editor.getParam('images_upload_timeout', 30000, 'number');

const shouldReuseFilename = (editor: Editor): boolean =>
  editor.getParam('images_reuse_filename', false, 'boolean');

export {
  getToolbarItems,
  getProxyUrl,
  getCorsHosts,
  getCredentialsHosts,
  getFetchImage,
  getApiKey,
  getUploadTimeout,
  shouldReuseFilename
};
