/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from '../api/Editor';
import VK from '../api/util/VK';
import * as InlineBoundariesNavigation from './InlineBoundariesNavigation';
import * as MatchKeys from './MatchKeys';

const executeKeydownOverride = (editor: Editor, evt: KeyboardEvent) => {
  MatchKeys.execute([
    { keyCode: VK.PAGE_UP, action: MatchKeys.action(InlineBoundariesNavigation.moveToLineEndPoint, editor, false) },
    { keyCode: VK.PAGE_DOWN, action: MatchKeys.action(InlineBoundariesNavigation.moveToLineEndPoint, editor, true) }
  ], evt).each((_) => {
    evt.preventDefault();
  });
};

const setup = (editor: Editor) => {
  editor.on('keydown', (evt) => {
    if (evt.isDefaultPrevented() === false) {
      executeKeydownOverride(editor, evt);
    }
  });
};

export {
  setup
};
