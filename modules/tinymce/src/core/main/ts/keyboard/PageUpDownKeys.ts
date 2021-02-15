/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Cell } from '@ephox/katamari';
import Editor from '../api/Editor';
import { NodeChangeEvent } from '../api/EventTypes';
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

const stopImmediatePropagation = (e: EditorEvent<NodeChangeEvent>) => e.stopImmediatePropagation();

const isPageUpDown = (evt: EditorEvent<KeyboardEvent>) =>
  evt.keyCode === VK.PAGE_UP || evt.keyCode === VK.PAGE_DOWN;

const setNodeChangeBlocker = (blocked: Cell<boolean>, editor: Editor, block: boolean) => {
  // Prevents registering multiple event blockers
  if (block && !blocked.get()) {
    editor.on('NodeChange', stopImmediatePropagation, true);
  } else if (!block && blocked.get()) {
    editor.off('NodeChange', stopImmediatePropagation);
  }

  blocked.set(block);
};

/*
  Prevents a flickering UI while caret move in and out of the inline boundary element
  we have no custom page up/down logic, so we can't override the default
*/
const setup = (editor: Editor) => {
  const blocked = Cell(false);

  editor.on('keydown', (evt) => {
    if (isPageUpDown(evt)) {
      setNodeChangeBlocker(blocked, editor, true);
    }
  });

  editor.on('keyup', (evt) => {
    if (evt.isDefaultPrevented() === false) {
      executeKeyupAction(editor, evt);
    }

    if (isPageUpDown(evt) && blocked.get()) {
      setNodeChangeBlocker(blocked, editor, false);
      editor.nodeChanged();
    }
  });
};

export {
  setup
};
