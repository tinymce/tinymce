import { Cell } from '@ephox/katamari';

import Editor from '../api/Editor';
import Env from '../api/Env';
import VK from '../api/util/VK';
import * as BoundarySelection from './BoundarySelection';
import * as CefNavigation from './CefNavigation';
import * as ContentEndpointNavigation from './ContentEndpointNavigation';
import * as DetailsNavigation from './DetailsNavigation';
import * as MatchKeys from './MatchKeys';
import * as MediaNavigation from './MediaNavigation';
import * as TableNavigation from './TableNavigation';

const executeKeydownOverride = (editor: Editor, caret: Cell<Text | null>, evt: KeyboardEvent) => {
  const isMac = Env.os.isMacOS() || Env.os.isiOS();

  MatchKeys.execute([
    { keyCode: VK.RIGHT, action: MatchKeys.action(CefNavigation.moveH, editor, true) },
    { keyCode: VK.LEFT, action: MatchKeys.action(CefNavigation.moveH, editor, false) },
    { keyCode: VK.UP, action: MatchKeys.action(CefNavigation.moveV, editor, false) },
    { keyCode: VK.DOWN, action: MatchKeys.action(CefNavigation.moveV, editor, true) },
    ...(isMac ? [
      { keyCode: VK.UP, action: MatchKeys.action(CefNavigation.selectToEndPoint, editor, false), metaKey: true, shiftKey: true },
      { keyCode: VK.DOWN, action: MatchKeys.action(CefNavigation.selectToEndPoint, editor, true), metaKey: true, shiftKey: true }
    ] : []),
    { keyCode: VK.RIGHT, action: MatchKeys.action(TableNavigation.moveH, editor, true) },
    { keyCode: VK.LEFT, action: MatchKeys.action(TableNavigation.moveH, editor, false) },
    { keyCode: VK.UP, action: MatchKeys.action(TableNavigation.moveV, editor, false) },
    { keyCode: VK.DOWN, action: MatchKeys.action(TableNavigation.moveV, editor, true) },
    { keyCode: VK.UP, action: MatchKeys.action(TableNavigation.moveV, editor, false) },
    { keyCode: VK.UP, action: MatchKeys.action(DetailsNavigation.moveV, editor, false) },
    { keyCode: VK.DOWN, action: MatchKeys.action(DetailsNavigation.moveV, editor, true) },
    { keyCode: VK.RIGHT, action: MatchKeys.action(MediaNavigation.moveH, editor, true) },
    { keyCode: VK.LEFT, action: MatchKeys.action(MediaNavigation.moveH, editor, false) },
    { keyCode: VK.UP, action: MatchKeys.action(MediaNavigation.moveV, editor, false) },
    { keyCode: VK.DOWN, action: MatchKeys.action(MediaNavigation.moveV, editor, true) },
    { keyCode: VK.RIGHT, action: MatchKeys.action(BoundarySelection.move, editor, caret, true) },
    { keyCode: VK.LEFT, action: MatchKeys.action(BoundarySelection.move, editor, caret, false) },
    { keyCode: VK.RIGHT, ctrlKey: !isMac, altKey: isMac, action: MatchKeys.action(BoundarySelection.moveNextWord, editor, caret) },
    { keyCode: VK.LEFT, ctrlKey: !isMac, altKey: isMac, action: MatchKeys.action(BoundarySelection.movePrevWord, editor, caret) },
    { keyCode: VK.UP, action: MatchKeys.action(ContentEndpointNavigation.moveV, editor, false) },
    { keyCode: VK.DOWN, action: MatchKeys.action(ContentEndpointNavigation.moveV, editor, true) }
  ], evt).each((_) => {
    evt.preventDefault();
  });
};

const setup = (editor: Editor, caret: Cell<Text | null>): void => {
  editor.on('keydown', (evt) => {
    if (!evt.isDefaultPrevented()) {
      executeKeydownOverride(editor, caret, evt);
    }
  });
};

export {
  setup
};
