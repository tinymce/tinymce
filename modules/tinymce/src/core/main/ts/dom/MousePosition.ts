import Editor from '../api/Editor';
import { EditorEvent } from '../api/util/EventDispatcher';

/**
 * This module calculates an absolute coordinate inside the editor body for both local and global mouse events.
 *
 * @private
 * @class tinymce.dom.MousePosition
 */

export interface PagePosition {
  pageX: number;
  pageY: number;
}

interface Position {
  top: number;
  left: number;
}

const getAbsolutePosition = (elm: HTMLElement): Position => {
  const clientRect = elm.getBoundingClientRect();
  const doc = elm.ownerDocument;
  const docElem = doc.documentElement;
  const win = doc.defaultView;

  return {
    top: clientRect.top + (win?.scrollY ?? 0) - docElem.clientTop,
    left: clientRect.left + (win?.scrollX ?? 0) - docElem.clientLeft
  };
};

const getBodyPosition = (editor: Editor): Position =>
  editor.inline ? getAbsolutePosition(editor.getBody()) : { left: 0, top: 0 };

const getScrollPosition = (editor: Editor): Position => {
  const body = editor.getBody();
  return editor.inline ? { left: body.scrollLeft, top: body.scrollTop } : { left: 0, top: 0 };
};

const getBodyScroll = (editor: Editor): Position => {
  const body = editor.getBody(), docElm = editor.getDoc().documentElement;
  const inlineScroll = { left: body.scrollLeft, top: body.scrollTop };
  const iframeScroll = { left: body.scrollLeft || docElm.scrollLeft, top: body.scrollTop || docElm.scrollTop };

  return editor.inline ? inlineScroll : iframeScroll;
};

const getMousePosition = (editor: Editor, event: EditorEvent<MouseEvent>): Position => {
  if (event.target.ownerDocument !== editor.getDoc()) {
    const iframePosition = getAbsolutePosition(editor.getContentAreaContainer());
    const scrollPosition = getBodyScroll(editor);

    return {
      left: event.pageX - iframePosition.left + scrollPosition.left,
      top: event.pageY - iframePosition.top + scrollPosition.top
    };
  }

  return {
    left: event.pageX,
    top: event.pageY
  };
};

const calculatePosition = (bodyPosition: Position, scrollPosition: Position, mousePosition: Position): PagePosition => ({
  pageX: (mousePosition.left - bodyPosition.left) + scrollPosition.left,
  pageY: (mousePosition.top - bodyPosition.top) + scrollPosition.top
});

const calc = (editor: Editor, event: EditorEvent<MouseEvent>): PagePosition =>
  calculatePosition(getBodyPosition(editor), getScrollPosition(editor), getMousePosition(editor, event));

export {
  calc
};
