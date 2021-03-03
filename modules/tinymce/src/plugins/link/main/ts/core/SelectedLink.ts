import DomTreeWalker from 'tinymce/core/api/dom/TreeWalker';
import Editor from 'tinymce/core/api/Editor';

const isBR = (elm: Node): elm is HTMLAnchorElement => elm && elm.nodeName.toLowerCase() === 'br';
const isAnchor = (elm: Node): elm is HTMLAnchorElement => elm && elm.nodeName.toLowerCase() === 'a';

const getSelectedLink = (editor: Editor, selectedElm?: Element): HTMLAnchorElement | null => {
  const isShortEnded = (elm: Node) => elm && editor.schema.getShortEndedElements().hasOwnProperty(elm.nodeName);
  const isSameSiblingAnchor = (elm: Node, sibling: Node): elm is HTMLAnchorElement => (
    elm === sibling.parentNode ||
    sibling.parentNode && elm === sibling.parentNode.nextSibling
  );
  const isValidNode = (node: Node) => !isShortEnded(node) && isAnchor(node);

  const rng = editor.selection.getRng();
  const start = rng.startContainer;
  const end = rng.endContainer;

  const endOffsetChild = end.childNodes[rng.endOffset];
  const startOffsetChild = start.childNodes[rng.startOffset];

  if (end.nodeType === 1 && isBR(endOffsetChild)) {
    const walker = new DomTreeWalker(endOffsetChild, endOffsetChild.parentNode);

    while (walker.current()) {
      const node = walker.prev();
      if (isValidNode(node) && isSameSiblingAnchor(node, start)) {
        return (node) as HTMLAnchorElement;
      }
    }
  }

  // IE
  if (start.nodeType === 1 && end.nodeType === 3 && isAnchor(startOffsetChild)) {
    return (startOffsetChild) as HTMLAnchorElement;
  }

  return editor.dom.getParent(selectedElm, 'a[href]') as HTMLAnchorElement;

};

export {
  getSelectedLink
};
