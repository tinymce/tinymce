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

const setAlign = (editor: Editor, elm: Element, name: string | undefined): void => {
  // Alignment formats may not use the same styles so ensure to remove any existing horizontal alignment format first
  Tools.each('left center right'.split(' '), (align) => {
    if (align !== name) {
      editor.formatter.remove('align' + align, {}, elm);
    }
  });

  if (name) {
    editor.formatter.apply('align' + name, {}, elm);
  }
};

const setVAlign = (editor: Editor, elm: Element, name: string | undefined): void => {
  // Alignment formats may not use the same styles so ensure to remove any existing vertical alignment format first
  Tools.each('top middle bottom'.split(' '), (align) => {
    if (align !== name) {
      editor.formatter.remove('valign' + align, {}, elm);
    }
  });

  if (name) {
    editor.formatter.apply('valign' + name, {}, elm);
  }
};

export {
  setAlign,
  setVAlign,
  getTDTHOverallStyle
};
