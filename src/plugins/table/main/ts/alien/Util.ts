/**
 * Clipboard.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Compare } from '@ephox/sugar';
import { Element } from '@ephox/sugar';

var getBody = function (editor) {
  return Element.fromDom(editor.getBody());
};
var getIsRoot = function (editor) {
  return function (element) {
    return Compare.eq(element, getBody(editor));
  };
};

var removePxSuffix = function (size) {
  return size ? size.replace(/px$/, '') : "";
};

var addSizeSuffix = function (size) {
  if (/^[0-9]+$/.test(size)) {
    size += "px";
  }
  return size;
};

export default <any> {
  getBody: getBody,
  getIsRoot: getIsRoot,
  addSizeSuffix: addSizeSuffix,
  removePxSuffix: removePxSuffix
};