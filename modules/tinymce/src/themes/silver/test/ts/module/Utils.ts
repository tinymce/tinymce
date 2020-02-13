import { HTMLElement } from '@ephox/dom-globals';
import { Element, Insert, Remove } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';

const createScrollDiv = (height: number) => {
  return Element.fromHtml<HTMLElement>(`<div style="height: ${height}px;"></div>`);
};

const setupPageScroll = (editor: Editor, amount: number) => {
  const target = Element.fromDom(editor.inline ? editor.getBody() : editor.getContainer());

  const divBefore = createScrollDiv(amount);
  const divAfter = createScrollDiv(amount);

  Insert.before(target, divBefore);
  Insert.after(target, divAfter);

  return () => {
    Remove.remove(divBefore);
    Remove.remove(divAfter);
  };
};

export {
  setupPageScroll
};