/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { SugarElement } from '@ephox/sugar';
import Editor from '../api/Editor';
import * as BlockBoundary from '../caret/BlockBoundary';
import CaretPosition from '../caret/CaretPosition';
import * as IndentOutdent from '../commands/IndentOutdent';

const backspaceDelete = (editor: Editor, _forward?: boolean) => {
  if (editor.selection.isCollapsed() && IndentOutdent.canOutdent(editor)) {
    const dom = editor.dom;
    const rng = editor.selection.getRng();
    const pos = CaretPosition.fromRangeStart(rng);
    const block = dom.getParent(rng.startContainer, dom.isBlock);
    if (block !== null && BlockBoundary.isAtStartOfBlock(SugarElement.fromDom(block), pos)) {
      IndentOutdent.handle(editor, 'outdent');
      return true;
    }
  }

  return false;
};

export {
  backspaceDelete
};
