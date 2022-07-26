import { Obj, Type } from '@ephox/katamari';
import { Css, Height, SugarElement, SugarPosition, Width } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';

import * as Events from '../../api/Events';
import * as Options from '../../api/Options';
import * as Utils from './Utils';

interface EditorDimensions {
  readonly height: number;
  width?: number;
}

export enum ResizeTypes {
  None, Both, Vertical
}

export const getDimensions = (editor: Editor, deltas: SugarPosition, resizeType: ResizeTypes, originalHeight: number, originalWidth: number): EditorDimensions => {
  const dimensions: EditorDimensions = {
    height: Utils.calcCappedSize(originalHeight + deltas.top, Options.getMinHeightOption(editor), Options.getMaxHeightOption(editor))
  };

  if (resizeType === ResizeTypes.Both) {
    dimensions.width = Utils.calcCappedSize(originalWidth + deltas.left, Options.getMinWidthOption(editor), Options.getMaxWidthOption(editor));
  }

  return dimensions;
};

export const resize = (editor: Editor, deltas: SugarPosition, resizeType: ResizeTypes): void => {
  const container = SugarElement.fromDom(editor.getContainer());

  const dimensions = getDimensions(editor, deltas, resizeType, Height.get(container), Width.get(container));
  Obj.each(dimensions, (val, dim) => {
    if (Type.isNumber(val)) {
      Css.set(container, dim, Utils.numToPx(val));
    }
  });
  Events.fireResizeEditor(editor);
};
