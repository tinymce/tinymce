import * as CefNavigation from './CefNavigation';
import MatchKeys from './MatchKeys';
import VK from '../api/util/VK';
import { Editor } from 'tinymce/core/api/Editor';
import { KeyboardEvent } from '@ephox/dom-globals';

const executeKeydownOverride = (editor: Editor, evt: KeyboardEvent) => {
  MatchKeys.execute([
    { keyCode: VK.END, action: CefNavigation.moveToLineEndPoint(editor, true) },
    { keyCode: VK.HOME, action: CefNavigation.moveToLineEndPoint(editor, false) }
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

export default {
  setup
};