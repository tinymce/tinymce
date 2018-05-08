/**
 * Settings.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Editor } from 'tinymce/core/api/Editor';

const getToolbarItems = (editor: Editor): string => {
  return editor.getParam('imagetools_toolbar', 'rotateleft rotateright | flipv fliph | crop editimage imageoptions');
};

const getProxyUrl = (editor: Editor): string => editor.getParam('imagetools_proxy');

const getCorsHosts = (editor: Editor) => editor.getParam('imagetools_cors_hosts', [], 'string[]');

const getCredentialsHosts = (editor: Editor) => editor.getParam('imagetools_credentials_hosts', [], 'string[]');

const getApiKey = (editor: Editor) => {
  return editor.getParam('api_key', editor.getParam('imagetools_api_key', '', 'string'), 'string');
};

const getUploadTimeout = (editor: Editor) => editor.getParam('images_upload_timeout', 30000, 'number');

const shouldReuseFilename = (editor: Editor) => editor.getParam('images_reuse_filename', false, 'boolean');

export {
  getToolbarItems,
  getProxyUrl,
  getCorsHosts,
  getCredentialsHosts,
  getApiKey,
  getUploadTimeout,
  shouldReuseFilename
};