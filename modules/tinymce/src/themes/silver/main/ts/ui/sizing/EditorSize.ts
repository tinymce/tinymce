/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Option } from '@ephox/katamari';
import Editor from 'tinymce/core/api/Editor';
import { getHeightSetting, getMaxHeightSetting, getMaxWidthSetting, getMinHeightSetting, getMinWidthSetting, getWidthSetting } from '../../api/Settings';
import * as Utils from './Utils';

export const getHeight = (editor: Editor) => {
  const baseHeight = getHeightSetting(editor);
  const minHeight = getMinHeightSetting(editor);
  const maxHeight = getMaxHeightSetting(editor);

  return Utils.parseToInt(baseHeight).map((height) => Utils.calcCappedSize(height, minHeight, maxHeight));
};

export const getHeightWithFallback = (editor: Editor) => {
  const height: Option<string | number> = getHeight(editor);
  return height.getOr(getHeightSetting(editor));
};

export const getWidth = (editor: Editor) => {
  const baseWidth = getWidthSetting(editor);
  const minWidth = getMinWidthSetting(editor);
  const maxWidth = getMaxWidthSetting(editor);

  return Utils.parseToInt(baseWidth).map((width) => Utils.calcCappedSize(width, minWidth, maxWidth));
};

export const getWidthWithFallback = (editor: Editor) => {
  const width: Option<string | number> = getWidth(editor);
  return width.getOr(getWidthSetting(editor));
};
