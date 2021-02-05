/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Obj } from '@ephox/katamari';
import { Css, Height, SugarElement, SugarPosition, Width } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import * as Events from '../../api/Events';
import { getMaxHeightSetting, getMaxWidthSetting, getMinHeightSetting, getMinWidthSetting } from '../../api/Settings';
import * as Utils from './Utils';

interface EditorDimensions {
  height?: number;
  width?: number;
}

export enum ResizeTypes {
  None, Both, Vertical
}

export const getDimensions = (editor: Editor, deltas: SugarPosition, resizeType: ResizeTypes, originalHeight: number, originalWidth: number) => {
  const dimensions: EditorDimensions = {};

  dimensions.height = Utils.calcCappedSize(originalHeight + deltas.top, getMinHeightSetting(editor), getMaxHeightSetting(editor));

  if (resizeType === ResizeTypes.Both) {
    dimensions.width = Utils.calcCappedSize(originalWidth + deltas.left, getMinWidthSetting(editor), getMaxWidthSetting(editor));
  }

  return dimensions;
};

export const resize = (editor: Editor, deltas: SugarPosition, resizeType: ResizeTypes) => {
  const container = SugarElement.fromDom(editor.getContainer());

  const dimensions = getDimensions(editor, deltas, resizeType, Height.get(container), Width.get(container));
  Obj.each(dimensions, (val, dim) => Css.set(container, dim, Utils.numToPx(val)));
  Events.fireResizeEditor(editor);
};
