import { Cell } from '@ephox/katamari';

import Editor from '../api/Editor';
import Env from '../api/Env';
import VK from '../api/util/VK';
import * as BoundarySelection from './BoundarySelection';
import * as CefNavigation from './CefNavigation';
import * as MatchKeys from './MatchKeys';
import * as MediaNavigation from './MediaNavigation';

const executeKeydownOverride = (editor: Editor, caret: Cell<Text | null>, evt: KeyboardEvent) => {
  const isMac = Env.os.isMacOS() || Env.os.isiOS();

  MatchKeys.execute([
    { keyCode: VK.END, action: MatchKeys.action(CefNavigation.moveToLineEndPoint, editor, true) },
    { keyCode: VK.HOME, action: MatchKeys.action(CefNavigation.moveToLineEndPoint, editor, false) },
    ...(!isMac ? [
      { keyCode: VK.HOME, action: MatchKeys.action(CefNavigation.selectToEndPoint, editor, false), ctrlKey: true, shiftKey: true },
      { keyCode: VK.END, action: MatchKeys.action(CefNavigation.selectToEndPoint, editor, true), ctrlKey: true, shiftKey: true }
    ] : []),
    { keyCode: VK.END, action: MatchKeys.action(MediaNavigation.moveToLineEndPoint, editor, true) },
    { keyCode: VK.HOME, action: MatchKeys.action(MediaNavigation.moveToLineEndPoint, editor, false) },
    { keyCode: VK.END, action: MatchKeys.action(BoundarySelection.moveToLineEndPoint, editor, true, caret) },
    { keyCode: VK.HOME, action: MatchKeys.action(BoundarySelection.moveToLineEndPoint, editor, false, caret) }
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
