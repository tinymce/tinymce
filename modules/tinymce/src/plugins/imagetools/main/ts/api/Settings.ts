/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';

const getSetting = <T>(name: string, defaultValue?: T, type?: string) => (editor: Editor): T =>
  editor.getParam(name, defaultValue, type);

const getToolbarItems = getSetting('imagetools_toolbar', 'rotateleft rotateright flipv fliph editimage imageoptions');

const getProxyUrl = getSetting<string>('imagetools_proxy');

const getCorsHosts = getSetting<string[]>('imagetools_cors_hosts', [], 'string[]');

const getCredentialsHosts = getSetting<string[]>('imagetools_credentials_hosts', [], 'string[]');

const getFetchImage = getSetting<undefined | Function>('imagetools_fetch_image', undefined, 'function');

const getApiKey = (editor: Editor) => editor.getParam('api_key', editor.getParam('imagetools_api_key', '', 'string'), 'string');

const getUploadTimeout = getSetting('images_upload_timeout', 30000, 'number');

const shouldReuseFilename = getSetting('images_reuse_filename', false, 'boolean');

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
