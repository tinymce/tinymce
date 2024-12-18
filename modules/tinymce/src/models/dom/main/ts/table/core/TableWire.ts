import { Id } from '@ephox/katamari';
import { ResizeWire } from '@ephox/snooker';
import { Attribute, Css, Insert, Remove, SugarElement } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';

const createContainer = (): SugarElement<HTMLDivElement> => {
  const container = SugarElement.fromTag('div');
  const id = Id.generate('resizer-container');

  Attribute.set(container, 'id', id);
  Css.setAll(container, {
    position: 'static',
    height: '0',
    width: '0',
    padding: '0',
    margin: '0',
    border: '0'
  });
  Attribute.set(container, 'data-mce-bogus', 'all');

  return container;
};

const get = (editor: Editor, isResizable: (elm: SugarElement<Element>) => boolean): ResizeWire => {
  if (editor.inline) {
    const editorBody = SugarElement.fromDom(editor.getBody());
    const container = createContainer();
    Insert.append(editorBody, container);
    return ResizeWire.body(editorBody, container, isResizable);
  }

  return ResizeWire.only(SugarElement.fromDom(editor.getDoc()), isResizable);
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
