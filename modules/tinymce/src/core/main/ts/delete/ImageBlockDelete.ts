/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from '../api/Editor';
import CaretPosition from '../caret/CaretPosition';
import CaretFinder from '../caret/CaretFinder';
import { isBeforeImageBlock, isAfterImageBlock } from '../caret/CaretPositionPredicates';
import { getChildNodeAtRelativeOffset } from '../caret/CaretUtils';
import { Option } from '@ephox/katamari';

const deleteCaret = (editor: Editor, forward: boolean): boolean => {
  const fromPos = CaretPosition.fromRangeStart(editor.selection.getRng());
  return CaretFinder.fromPosition(forward, editor.getBody(), fromPos)
    .filter((pos) => forward ? isBeforeImageBlock(pos) : isAfterImageBlock(pos))
    .bind((pos) => Option.from(getChildNodeAtRelativeOffset(forward ? 0 : -1, pos)))
    .map((elm) => {
      editor.selection.select(elm);
      return true;
    })
    .getOr(false);
};

const backspaceDelete = (editor: Editor, forward: boolean): boolean => {
  return editor.selection.isCollapsed() ? deleteCaret(editor, forward) : false;
};

export default {
  backspaceDelete
};
