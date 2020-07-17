/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Cell } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import Editor from '../api/Editor';
import VK from '../api/util/VK';
import * as BoundarySelection from './BoundarySelection';
import * as CefNavigation from './CefNavigation';
import * as ContentEndpointNavigation from './ContentEndpointNavigation';
import * as MatchKeys from './MatchKeys';
import * as MediaNavigation from './MediaNavigation';
import * as TableNavigation from './TableNavigation';

const executeKeydownOverride = (editor: Editor, caret: Cell<Text>, evt: KeyboardEvent) => {
  const os = PlatformDetection.detect().os;

  MatchKeys.execute([
    { keyCode: VK.RIGHT, action: MatchKeys.action(CefNavigation.moveH, editor, true) },
    { keyCode: VK.LEFT, action: MatchKeys.action(CefNavigation.moveH, editor, false) },
    { keyCode: VK.UP, action: MatchKeys.action(CefNavigation.moveV, editor, false) },
    { keyCode: VK.DOWN, action: MatchKeys.action(CefNavigation.moveV, editor, true) },
    { keyCode: VK.RIGHT, action: MatchKeys.action(TableNavigation.moveH, editor, true) },
    { keyCode: VK.LEFT, action: MatchKeys.action(TableNavigation.moveH, editor, false) },
    { keyCode: VK.UP, action: MatchKeys.action(TableNavigation.moveV, editor, false) },
    { keyCode: VK.DOWN, action: MatchKeys.action(TableNavigation.moveV, editor, true) },
    { keyCode: VK.RIGHT, action: MatchKeys.action(MediaNavigation.moveH, editor, true) },
    { keyCode: VK.LEFT, action: MatchKeys.action(MediaNavigation.moveH, editor, false) },
    { keyCode: VK.UP, action: MatchKeys.action(MediaNavigation.moveV, editor, false) },
    { keyCode: VK.DOWN, action: MatchKeys.action(MediaNavigation.moveV, editor, true) },
    { keyCode: VK.RIGHT, action: MatchKeys.action(BoundarySelection.move, editor, caret, true) },
    { keyCode: VK.LEFT, action: MatchKeys.action(BoundarySelection.move, editor, caret, false) },
    { keyCode: VK.RIGHT, ctrlKey: !os.isOSX(), altKey: os.isOSX(), action: MatchKeys.action(BoundarySelection.moveNextWord, editor, caret) },
    { keyCode: VK.LEFT, ctrlKey: !os.isOSX(), altKey: os.isOSX(), action: MatchKeys.action(BoundarySelection.movePrevWord, editor, caret) },
    { keyCode: VK.UP, action: MatchKeys.action(ContentEndpointNavigation.moveV, editor, false) },
    { keyCode: VK.DOWN, action: MatchKeys.action(ContentEndpointNavigation.moveV, editor, true) }
  ], evt).each((_) => {
    evt.preventDefault();
  });
};

const setup = (editor: Editor, caret: Cell<Text>) => {
  editor.on('keydown', (evt) => {
    if (evt.isDefaultPrevented() === false) {
      executeKeydownOverride(editor, caret, evt);
    }
  });
};

export {
  setup
};
