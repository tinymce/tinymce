import { Cell } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';

import Editor from '../api/Editor';
import VK from '../api/util/VK';
import * as BoundarySelection from './BoundarySelection';
import * as CefNavigation from './CefNavigation';
import * as MatchKeys from './MatchKeys';
import * as MediaNavigation from './MediaNavigation';

const executeKeydownOverride = (editor: Editor, caret: Cell<Text>, evt: KeyboardEvent) => {
  const os = PlatformDetection.detect().os;

  const keyPatterns: MatchKeys.KeyPattern[] = [
    { keyCode: VK.END, action: MatchKeys.action(CefNavigation.moveToLineEndPoint, editor, true) },
    { keyCode: VK.HOME, action: MatchKeys.action(CefNavigation.moveToLineEndPoint, editor, false) },
    { keyCode: VK.END, action: MatchKeys.action(CefNavigation.selectToEndPoint, editor, true), ctrlKey: true, shiftKey: true },
    { keyCode: VK.HOME, action: MatchKeys.action(CefNavigation.selectToEndPoint, editor, false), ctrlKey: true, shiftKey: true },
    { keyCode: VK.END, action: MatchKeys.action(MediaNavigation.moveToLineEndPoint, editor, true) },
    { keyCode: VK.HOME, action: MatchKeys.action(MediaNavigation.moveToLineEndPoint, editor, false) },
    { keyCode: VK.END, action: MatchKeys.action(BoundarySelection.moveToLineEndPoint, editor, true, caret) },
    { keyCode: VK.HOME, action: MatchKeys.action(BoundarySelection.moveToLineEndPoint, editor, false, caret) }
  ];
  if (!os.isMacOS()) {
    keyPatterns.push({ keyCode: VK.HOME, action: MatchKeys.action(CefNavigation.selectToEndPoint, editor, false), ctrlKey: true, shiftKey: true });
    keyPatterns.push({ keyCode: VK.END, action: MatchKeys.action(CefNavigation.selectToEndPoint, editor, true), ctrlKey: true, shiftKey: true });
  }
  MatchKeys.execute(keyPatterns, evt).each((_) => {
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
