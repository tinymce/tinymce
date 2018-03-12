/**
 * Clipboard.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Compare, Element } from '@ephox/sugar';
import { Editor } from 'tinymce/core/api/Editor';

const getBody = function (editor: Editor) {
  return Element.fromDom(editor.getBody());
};
const getIsRoot = function (editor: Editor) {
  return function (element) {
    return Compare.eq(element, getBody(editor));
  };
};

const removePxSuffix = function (size: string) {
  return size ? size.replace(/px$/, '') : '';
};

const addSizeSuffix = function (size: string) {
  if (/^[0-9]+$/.test(size)) {
    size += 'px';
  }
  return size;
};

export default {
  getBody,
  getIsRoot,
  addSizeSuffix,
  removePxSuffix
};