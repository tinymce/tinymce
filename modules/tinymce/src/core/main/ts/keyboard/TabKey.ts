/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from '../api/Editor';
import { hasTableTabNavigation } from '../api/Options';
import { EditorEvent } from '../api/util/EventDispatcher';
import VK from '../api/util/VK';
import * as MatchKeys from './MatchKeys';
import * as TableNavigation from './TableNavigation';

const tableTabNavigation = (editor: Editor): MatchKeys.KeyPattern[] => {
  if (hasTableTabNavigation(editor)) {
    return [
      { keyCode: VK.TAB, action: MatchKeys.action(TableNavigation.handleTab, editor, true) },
      { keyCode: VK.TAB, shiftKey: true, action: MatchKeys.action(TableNavigation.handleTab, editor, false) },
    ];
  } else {
    return [];
  }
};

const executeKeydownOverride = (editor: Editor, evt: KeyboardEvent) => {
  MatchKeys.execute([
    ...tableTabNavigation(editor)
  ], evt).each((_) => {
    evt.preventDefault();
  });
};

const setup = (editor: Editor) => {
  editor.on('keydown', (evt: EditorEvent<KeyboardEvent>) => {
    if (evt.isDefaultPrevented() === false) {
      executeKeydownOverride(editor, evt);
    }
  });
};

export {
  setup
};
