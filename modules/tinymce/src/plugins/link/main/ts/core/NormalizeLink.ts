import RangeUtils from 'tinymce/core/api/dom/RangeUtils';
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
  const startContainer = rng.startContainer;
  const endContainer = rng.endContainer;

  const endOffsetChild = RangeUtils.getNode(endContainer, rng.endOffset);
  const startOffsetChild = RangeUtils.getNode(startContainer, rng.startOffset);

  if (endContainer.nodeType === 1 && isBR(endOffsetChild)) {
    let startNode: Node = endOffsetChild;
    let rootNode: Node = endOffsetChild.parentNode;
    const startLink = getClosestLink(editor, startContainer);

    if (!hasSameParent(editor, startContainer, endOffsetChild) && isAnchor(startLink)) {
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

  if (startContainer.nodeType === 1 && endContainer.nodeType === 3 && isAnchor(startOffsetChild)) {
    return (startOffsetChild) as HTMLAnchorElement;
  }

  return editor.dom.getParent(selectedElm, 'a[href]') as HTMLAnchorElement;

};

export {
  getSelectedLink
};
