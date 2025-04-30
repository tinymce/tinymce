import { ResizeWire } from '@ephox/snooker';
import { SugarElement } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';

const get = (editor: Editor, isResizable: (elm: SugarElement<Element>) => boolean): ResizeWire => {
  const editorBody = SugarElement.fromDom(editor.getBody());

  return ResizeWire.body(editorBody, isResizable);
};

export {
  get
};
