/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Optional } from '@ephox/katamari';
import Editor from '../api/Editor';
import { EditorEvent } from '../api/PublicApi';
import VK from '../api/util/VK';
import * as InlineBoundariesNavigation from './InlineBoundariesNavigation';
import * as MatchKeys from './MatchKeys';

const executeKeyupAction = (editor: Editor, evt: KeyboardEvent) => {
  MatchKeys.execute([
    { keyCode: VK.PAGE_UP, action: MatchKeys.action(InlineBoundariesNavigation.moveOutInlineBoundaries, editor, false) },
    { keyCode: VK.PAGE_DOWN, action: MatchKeys.action(InlineBoundariesNavigation.moveOutInlineBoundaries, editor, true) }
  ], evt);
};

const Blocker = (() => {
  let isBlockerRegistered = false;

  const handler = {
    toaggleBlockerRegistered: (val: boolean) => {
      return isBlockerRegistered = val;
    },
    isPageUpDown: (evt: EditorEvent<KeyboardEvent>) => {
      return evt.keyCode === VK.PAGE_UP || evt.keyCode === VK.PAGE_DOWN;
    },
    canAddNewBlocker: (evt: EditorEvent<KeyboardEvent>) => {
      return handler.isPageUpDown(evt) && !isBlockerRegistered ? Optional.some(true) : Optional.none();
    },
    canRemoveBlocker: (evt: EditorEvent<KeyboardEvent>) => {
      return handler.isPageUpDown(evt) && isBlockerRegistered ? Optional.some(true) : Optional.none();
    },
    stopImmediatePropagation: (e) => {
      e.stopImmediatePropagation();
    }
  };

  return handler;
})();

const setup = (editor: Editor) => {
  /*
    Prevents a flickering UI while caret move in and out of the inline boundary element
    we have no custom page up/down logic so we can't override the default 
  */
  editor.on('keydown', (evt) => {
    Blocker.canAddNewBlocker(evt).exists(() => {
      Blocker.toaggleBlockerRegistered(true);
      editor.on('NodeChange', Blocker.stopImmediatePropagation, true);
      return true;
    });
  });

  editor.on('keyup', (evt) => {
    Blocker.canRemoveBlocker(evt).exists(() => {
      Blocker.toaggleBlockerRegistered(false);
      editor.off('NodeChange', Blocker.stopImmediatePropagation);
      return false;
    });
  });

  editor.on('keyup', (evt) => {
    if (evt.isDefaultPrevented() === false) {
      executeKeyupAction(editor, evt);
    }
  });
};

export {
  setup
};
