import Editor from '../../api/Editor';

import { Entry } from './Entry';
import { canIncreaseDepthOfList } from './Util';

export const enum Indentation {
  Indent = 'Indent',
  Outdent = 'Outdent',
  Flatten = 'Flatten'
}

export const indentEntry = (editor: Editor, indentation: Indentation, entry: Entry): void => {
  switch (indentation) {
    case Indentation.Indent:
      if (canIncreaseDepthOfList(editor, entry.depth)) {
        entry.depth++;
      } else {
        return;
      }
      break;

    case Indentation.Outdent:
      entry.depth--;
      break;

    case Indentation.Flatten:
      entry.depth = 0;
  }
  entry.dirty = true;
};
