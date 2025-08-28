import { Obj, Type } from '@ephox/katamari';
import { Css, Height, SugarElement, SugarPosition, Width } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';

import * as Events from '../../api/Events';
import * as Options from '../../api/Options';

import * as Utils from './Utils';

export interface EditorDimensions {
  readonly height: number;
  readonly width: number;
}

export enum ResizeTypes {
  None, Both, Vertical
}

export const getOriginalDimensions = (editor: Editor): EditorDimensions => {
  const container = SugarElement.fromDom(editor.getContainer());
  const originalHeight: number = Height.get(container);
  const originalWidth: number = Width.get(container);
  return {
    height: originalHeight,
    width: originalWidth,
  };
};

export const getDimensions = (editor: Editor, deltas: SugarPosition, resizeType: ResizeTypes, originalDimentions: EditorDimensions): EditorDimensions => {
  const dimensions = {
    height: Utils.calcCappedSize(
      originalDimentions.height + deltas.top,
      Options.getMinHeightOption(editor),
      Options.getMaxHeightOption(editor)
    ),
    width:
      resizeType === ResizeTypes.Both
        ? Utils.calcCappedSize(
          originalDimentions.width + deltas.left,
          Options.getMinWidthOption(editor),
          Options.getMaxWidthOption(editor)
        )
        : originalDimentions.width,
  };

  return dimensions;
};

export const resize = (editor: Editor, deltas: SugarPosition, resizeType: ResizeTypes): EditorDimensions => {
  const container = SugarElement.fromDom(editor.getContainer());

  const originalDimentions = getOriginalDimensions(editor);
  const dimensions = getDimensions(editor, deltas, resizeType, originalDimentions);
  Obj.each(dimensions, (val, dim) => {
    if (Type.isNumber(val)) {
      Css.set(container, dim, Utils.numToPx(val));
    }
  });
  Events.fireResizeEditor(editor);

  return dimensions;
};
