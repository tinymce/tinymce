import Editor from 'tinymce/core/api/Editor';

import * as Actions from '../core/Actions';
import * as CharMap from '../core/CharMap';

export interface Api {
  readonly getCharMap: () => CharMap.CharMap[];
  readonly insertChar: (chr: string) => void;
}

const get = (editor: Editor): Api => {
  const getCharMap = () => {
    return CharMap.getCharMap(editor);
  };

  const insertChar = (chr: string) => {
    Actions.insertChar(editor, chr);
  };

  return {
    getCharMap,
    insertChar
  };
};

export {
  get
};
