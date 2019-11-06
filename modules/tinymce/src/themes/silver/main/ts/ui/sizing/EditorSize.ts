/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Editor from 'tinymce/core/api/Editor';
import { getHeightSetting, getMaxHeightSetting, getMaxWidthSetting, getMinHeightSetting, getMinWidthSetting, getWidthSetting } from '../../api/Settings';
import Utils from './Utils';

export const getHeight = (editor: Editor) => {
  const baseHeight = getHeightSetting(editor);
  const minHeight = getMinHeightSetting(editor);
  const maxHeight = getMaxHeightSetting(editor);

  return Utils.parseToInt(baseHeight).map((height) => Utils.calcCappedSize(height, minHeight, maxHeight));
};

export const getWidth = (editor: Editor) => {
  const DOM = DOMUtils.DOM;
  const elm = editor.getElement();

  const baseWidth = getWidthSetting(editor, DOM.getStyle(elm, 'width'));
  const minWidth = getMinWidthSetting(editor);
  const maxWidth = getMaxWidthSetting(editor);

  return Utils.parseToInt(baseWidth).map((width) => Utils.calcCappedSize(width, minWidth, maxWidth));
};
