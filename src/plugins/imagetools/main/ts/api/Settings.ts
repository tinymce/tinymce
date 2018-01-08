/**
 * Settings.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

var getToolbarItems = function (editor) {
  return editor.getParam('imagetools_toolbar', 'rotateleft rotateright | flipv fliph | crop editimage imageoptions');
};

var getProxyUrl = function (editor) {
  return editor.getParam('imagetools_proxy');
};

export default <any> {
  getToolbarItems: getToolbarItems,
  getProxyUrl: getProxyUrl
};