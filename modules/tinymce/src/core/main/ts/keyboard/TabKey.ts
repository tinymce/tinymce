import Editor from '../api/Editor';
import * as Options from '../api/Options';
import { EditorEvent } from '../api/util/EventDispatcher';
import VK from '../api/util/VK';
import * as MatchKeys from './MatchKeys';
import * as TableNavigation from './TableNavigation';

const tableTabNavigation = (editor: Editor): MatchKeys.KeyPattern[] => {
  if (Options.hasTableTabNavigation(editor)) {
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

const setup = (editor: Editor): void => {
  editor.on('keydown', (evt: EditorEvent<KeyboardEvent>) => {
    if (!evt.isDefaultPrevented()) {
      executeKeydownOverride(editor, evt);
    }
  });
};

export {
  setup
};
