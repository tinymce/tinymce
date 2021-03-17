import { Fun, Optional } from '@ephox/katamari';
import RangeUtils from 'tinymce/core/api/dom/RangeUtils';
import DomTreeWalker from 'tinymce/core/api/dom/TreeWalker';
import Editor from 'tinymce/core/api/Editor';

const isBR = (elm: Node): Boolean => elm && elm.nodeName.toLowerCase() === 'br';

const isAnchor = (elm: Node): Boolean => elm && elm.nodeName.toLowerCase() === 'a';

const isShortEnded = (editor: Editor, elm: Node): Boolean => elm && editor.schema.getShortEndedElements().hasOwnProperty(elm.nodeName);

const isValidNode = (editor: Editor, node: Node): Boolean => !isShortEnded(editor, node) && isAnchor(node);

const getClosestLink = (editor: Editor, node: Node): Optional<HTMLAnchorElement> => Optional.from(editor.dom.getParent(node, 'a[href]'));

const getParentBlock = (editor: Editor, elm: Node): Optional<Node> => Optional.from(editor.dom.getParent(elm, editor.dom.isBlock));

const getCommonBlockNode = (editor: Editor, node1: Node, node2: Node): Optional<Node> =>
  getParentBlock(editor, node1).bind(
    (block1: Node) => getParentBlock(editor, node2).bind(
      (block2: Node) => block1 === block2 ? Optional.some(block1) : Optional.none()
    )
  );

const getSelectedLink = (editor: Editor, selectedElm?: Element): Optional<HTMLAnchorElement> => {
  const rng = editor.selection.getRng();
  const startContainer = rng.startContainer;
  const endContainer = rng.endContainer;

  const endOffsetChild = RangeUtils.getNode(endContainer, rng.endOffset);
  const startOffsetChild = RangeUtils.getNode(startContainer, rng.startOffset);

  if (endContainer.nodeType === 1 && isBR(endOffsetChild)) {
    let startNode = Optional.some(endOffsetChild);
    let rootNode = Optional.some((endOffsetChild.parentNode) as Node);
    const startLink = getClosestLink(editor, startContainer);

    getCommonBlockNode(editor, startContainer, endOffsetChild).fold(
      () => startLink.each((link) => {
        rootNode = getParentBlock(editor, link);
        startNode = rootNode.map((node: Node) => node.lastChild);
      }),
      Fun.noop
    );

    const walker = new DomTreeWalker(startNode.getOrNull(), rootNode.getOrNull());
    while (walker.current()) {
      const node = walker.prev();
      if (isValidNode(editor, node) && node === startLink.getOrNull()) {
        return Optional.from(node as HTMLAnchorElement);
      }
    }
  }

  if (startContainer.nodeType === 1 && endContainer.nodeType === 3 && isAnchor(startOffsetChild)) {
    return Optional.from(startOffsetChild as HTMLAnchorElement);
  }

  return getClosestLink(editor, selectedElm);

};

export {
  getSelectedLink
};
