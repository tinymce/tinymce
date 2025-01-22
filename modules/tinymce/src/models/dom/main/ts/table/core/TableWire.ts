import { Id } from '@ephox/katamari';
import { ResizeWire } from '@ephox/snooker';
import { Attribute, Css, Insert, Remove, SugarBody, SugarElement } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';

import * as Options from '../api/Options';

type PositionType = 'relative' | 'static';

const createContainer = (position: PositionType): SugarElement<HTMLDivElement> => {
  const id = Id.generate('resizer-container');
  const container = SugarElement.fromTag('div');

  Attribute.set(container, 'id', id);
  Css.setAll(container, {
    position,
    height: '0',
    width: '0',
    padding: '0',
    margin: '0',
    border: '0'
  });

  return container;
};

const getInlineResizeWire = (editor: Editor, isResizable: (elm: SugarElement<Element>) => boolean): ResizeWire => {
  const isSplitUiMode = Options.isSplitUiMode(editor);
  const editorBody = SugarElement.fromDom(editor.getBody());
  const container = createContainer(isSplitUiMode ? 'relative' : 'static');
  const body = SugarBody.body();

  if (isSplitUiMode) {
    Insert.after(editorBody, container);
    return ResizeWire.scrollable(editorBody, container, body, isResizable);
  }

  Insert.append(body, container);
  return ResizeWire.body(editorBody, container, isResizable);
};

const get = (editor: Editor, isResizable: (elm: SugarElement<Element>) => boolean): ResizeWire => {
  if (editor.inline) {
    return getInlineResizeWire(editor, isResizable);
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
