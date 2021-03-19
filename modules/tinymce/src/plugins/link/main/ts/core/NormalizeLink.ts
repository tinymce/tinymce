import { Optional, Optionals } from '@ephox/katamari';
import RangeUtils from 'tinymce/core/api/dom/RangeUtils';
import DomTreeWalker from 'tinymce/core/api/dom/TreeWalker';
import Editor from 'tinymce/core/api/Editor';

const isBR = (elm: Node): elm is HTMLBRElement => elm && elm.nodeName.toLowerCase() === 'br';

const isAnchor = (elm: Node): elm is HTMLAnchorElement => elm && elm.nodeName.toLowerCase() === 'a';

const isText = (elm: Node): boolean => elm && elm.nodeType === 3;

const isShortEnded = (editor: Editor, elm: Node): boolean => elm && editor.schema.getShortEndedElements().hasOwnProperty(elm.nodeName);

const isValidNode = (editor: Editor, node: Node): boolean => node.nodeType === 1 && !isShortEnded(editor, node) && !editor.dom.isBlock(node);

const getClosestLink = (editor: Editor, node: Node): Optional<HTMLAnchorElement> => Optional.from(editor.dom.getParent(node, 'a[href]'));

const getParentBlock = (editor: Editor, elm: Node): Optional<Node> => Optional.from(editor.dom.getParent(elm, editor.dom.isBlock));

const getNode = (elm: Node, offset: number): Optional<Node> => Optional.some(RangeUtils.getNode(elm, offset));

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

  const startOffsetChild = getNode(startContainer, rng.startOffset);
  const endOffsetChild = getNode(endContainer, rng.endOffset);

  return getCommonBlockNode(editor, startContainer, endContainer).bind((rootNode) => getClosestLink(editor, startContainer)
    .bind((startLink) => endOffsetChild.filter(isBR).bind((br) => {
      const walker = new DomTreeWalker(br, rootNode);
      while (walker.current()) {
        const node = walker.prev();
        if (node === startLink) {
          return Optional.from(startLink);
        }
        if (!isValidNode(editor, node)) {
          return Optional.none<HTMLAnchorElement>();
        }
      }
    }))
  ).orThunk(() => {
    // Handles IE case where the selection start at the link and ends at link text node <p>[<a href="tiny">link]</a></p>
    const endLink = endOffsetChild.filter(isText).bind((elem) => getClosestLink(editor, elem));
    return startOffsetChild.filter(isAnchor).bind((startLink) => endLink.bind((link) => Optionals.someIf(startLink === link, startLink)));
  }).orThunk(() => getClosestLink(editor, selectedElm));
};

export {
  getSelectedLink
};
