import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Editor from 'tinymce/core/api/Editor';
import Tools from 'tinymce/core/api/util/Tools';

const getTDTHOverallStyle = (dom: DOMUtils, elm: Element, name: string): string => {
  const cells = dom.select('td,th', elm);
  let firstChildStyle: string | undefined;

  const checkChildren = (firstChildStyle: string | undefined, elms: Element[]) => {
    for (let i = 0; i < elms.length; i++) {
      const currentStyle = dom.getStyle(elms[i], name);
      if (typeof firstChildStyle === 'undefined') {
        firstChildStyle = currentStyle;
      }
      if (firstChildStyle !== currentStyle) {
        return '';
      }
    }
    return firstChildStyle;
  };

  return checkChildren(firstChildStyle, cells);
};

const setAlign = (editor: Editor, elm: Element, name: string): void => {
  if (name) {
    editor.formatter.apply('align' + name, {}, elm);
  } else {
    Tools.each('left center right'.split(' '), (name) => {
      editor.formatter.remove('align' + name, {}, elm);
    });
  }
};

const setVAlign = (editor: Editor, elm: Element, name: string): void => {
  if (name) {
    editor.formatter.apply('valign' + name, {}, elm);
  } else {
    Tools.each('top middle bottom'.split(' '), (name) => {
      editor.formatter.remove('valign' + name, {}, elm);
    });
  }
};

export {
  setAlign,
  setVAlign,
  getTDTHOverallStyle
};
