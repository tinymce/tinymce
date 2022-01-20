/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Optional } from '@ephox/katamari';

import Editor from '../api/Editor';
import * as CaretFinder from '../caret/CaretFinder';
import CaretPosition from '../caret/CaretPosition';
import { isAfterImageBlock, isBeforeImageBlock } from '../caret/CaretPositionPredicates';
import { getChildNodeAtRelativeOffset } from '../caret/CaretUtils';

const deleteCaret = (editor: Editor, forward: boolean): Optional<() => void> => {
  const fromPos = CaretPosition.fromRangeStart(editor.selection.getRng());
  return CaretFinder.fromPosition(forward, editor.getBody(), fromPos)
    .filter((pos) => forward ? isBeforeImageBlock(pos) : isAfterImageBlock(pos))
    .bind((pos) => Optional.from(getChildNodeAtRelativeOffset(forward ? 0 : -1, pos)))
    .map((elm) => () => editor.selection.select(elm));
};

const backspaceDelete = (editor: Editor, forward: boolean): Optional<() => void> =>
  editor.selection.isCollapsed() ? deleteCaret(editor, forward) : Optional.none();

export {
  backspaceDelete
};
