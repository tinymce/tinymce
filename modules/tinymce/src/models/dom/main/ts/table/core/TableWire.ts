import { ResizeWire } from '@ephox/snooker';
import { Css, Insert, Remove, SugarBody, SugarElement } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';

const createContainer = (): SugarElement<HTMLDivElement> => {
  const container = SugarElement.fromTag('div');

  Css.setAll(container, {
    position: 'static',
    height: '0',
    width: '0',
    padding: '0',
    margin: '0',
    border: '0'
  });

  Insert.append(SugarBody.body(), container);

  return container;
};

const get = (editor: Editor, isResizable: (elm: SugarElement<Element>) => boolean): ResizeWire => {
  return editor.inline ? ResizeWire.body(SugarElement.fromDom(editor.getBody()), createContainer(), isResizable) : ResizeWire.only(SugarElement.fromDom(editor.getDoc()), isResizable);
};

const remove = (editor: Editor, wire: ResizeWire): void => {
  if (editor.inline) {
    Remove.remove(wire.parent());
  }
};

export {
  get,
  remove
};
