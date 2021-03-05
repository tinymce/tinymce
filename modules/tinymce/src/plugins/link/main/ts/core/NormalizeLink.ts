import DomTreeWalker from 'tinymce/core/api/dom/TreeWalker';
import Editor from 'tinymce/core/api/Editor';

const isBR = (elm: Node): elm is HTMLAnchorElement => elm && elm.nodeName.toLowerCase() === 'br';

const isAnchor = (elm: Node): elm is HTMLAnchorElement => elm && elm.nodeName.toLowerCase() === 'a';

const isShortEnded = (editor: Editor, elm: Node) => elm && editor.schema.getShortEndedElements().hasOwnProperty(elm.nodeName);

const isValidNode = (editor: Editor, node: Node) => !isShortEnded(editor, node) && isAnchor(node);

const getClosestLink = (editor: Editor, node: Node) => editor.dom.getParent(node, 'a[href]');

const hasSameParent = (editor: Editor, elm: Node, nextNode: Node): elm is HTMLAnchorElement =>
  editor.dom.getParent(elm, 'p') === editor.dom.getParent(nextNode, 'p');

const getSelectedLink = (editor: Editor, selectedElm?: Element): HTMLAnchorElement | null => {
  const rng = editor.selection.getRng();
  const startRng = rng.startContainer;
  const endRng = rng.endContainer;

  const endOffsetChild = endRng.childNodes[rng.endOffset];
  const startOffsetChild = startRng.childNodes[rng.startOffset];

  if (endRng.nodeType === 1 && isBR(endOffsetChild)) {
    let startNode: Node = endOffsetChild;
    let rootNode: Node = endOffsetChild.parentNode;
    const startLink = getClosestLink(editor, startRng);

    if (!hasSameParent(editor, startRng, endOffsetChild) && isAnchor(startLink)) {
      rootNode = editor.dom.getParent(startLink, 'p');
      startNode = rootNode.lastChild;
    }

    const walker = new DomTreeWalker(startNode, rootNode);
    while (walker.current()) {
      const node = walker.prev();
      if (isValidNode(editor, node) && node === startLink) {
        return (node) as HTMLAnchorElement;
      }
    }
  }

  if (startRng.nodeType === 1 && endRng.nodeType === 3 && isAnchor(startOffsetChild)) {
    return (startOffsetChild) as HTMLAnchorElement;
  }

  return editor.dom.getParent(selectedElm, 'a[href]') as HTMLAnchorElement;

};

export {
  getSelectedLink
};
