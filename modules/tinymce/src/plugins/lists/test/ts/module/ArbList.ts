import { Arr } from '@ephox/katamari';
import * as fc from 'fast-check';

interface ArbTextNode {
  readonly type: '#text';
  readonly value: string;
}

interface ArbCommentNode {
  readonly type: '#comment';
  readonly value: string;
}

interface ArbElementNode {
  readonly type: 'strong' | 'em' | 'h3' | 'div';
  readonly children: Array<ArbTextNode | ArbCommentNode>;
}

type ArbListItemChildNode = ArbListElement | ArbTextNode | ArbCommentNode | ArbElementNode;

interface ArbListItem {
  readonly type: 'li';
  readonly children: ArbListItemChildNode[];
}

interface ArbListElement {
  readonly type: 'ul' | 'ol';
  readonly children: ArbListItem[];
}

interface ArbListElementWithSelection {
  readonly list: ArbListElement;
  readonly startTextNodeIndex: number;
  readonly endTextNodeIndex: number;
}

export interface ArbDomListElementWithSelection {
  readonly list: HTMLOListElement | HTMLUListElement;
  readonly range: Range;
}

const isArbListElement = (arb: ArbListItemChildNode): arb is ArbListElement => arb.type === 'ol' || arb.type === 'ul';
const isArbTextNode = (arb: ArbListItemChildNode): arb is ArbTextNode => arb.type === '#text';
const isArbCommentNode = (arb: ArbListItemChildNode): arb is ArbCommentNode => arb.type === '#comment';

const textGenerator = fc.hexaString({ minLength: 1, maxLength: 5 });

const textNodeGenerator: fc.Arbitrary<ArbTextNode> = fc.record({
  type: fc.constant('#text'),
  value: textGenerator
});

const commentNodeGenerator: fc.Arbitrary<ArbCommentNode> = fc.record({
  type: fc.constant('#comment'),
  value: textGenerator
});

const elementNodeGenerator: fc.Arbitrary<ArbElementNode> = fc.record({
  type: fc.constantFrom('strong', 'em', 'h3', 'div'),
  children: fc.array(fc.oneof(textNodeGenerator, commentNodeGenerator), { minLength: 1, maxLength: 5 })
});

const depthIdentifier = fc.createDepthIdentifier();

const listElementGenerator = fc.letrec((tie) => ({
  node: fc.record({
    type: fc.constantFrom('ul', 'ol'),
    children: fc.array(
      fc.oneof(
        { maxDepth: 5, depthIdentifier },
        fc.record({
          type: fc.constant('li'),
          children: fc.array(
            fc.oneof(
              { maxDepth: 5, depthIdentifier },
              textNodeGenerator,
              commentNodeGenerator,
              elementNodeGenerator,
              tie('node')
            ),
            { minLength: 1, maxLength: 5 }
          )
        })
      ),
      { minLength: 1, maxLength: 5 }
    ),
  }),
})).node as unknown as fc.Arbitrary<ArbListElement>; // Need magic lie here since tie are unknowns but they are not in the generated output

const getTextNodes = (list: ArbListElement) => {
  const textNodes: ArbTextNode[] = [];

  const helper = (list: ArbListElement) => {
    const collectTextNodesInElement = (child: ArbElementNode) => {
      Arr.each(child.children, (child) => {
        if (isArbTextNode(child)) {
          textNodes.push(child);
        }
      });
    };

    Arr.each(list.children, (li) => {
      Arr.each(li.children, (child) => {
        if (isArbTextNode(child)) {
          textNodes.push(child);
        } else if (isArbListElement(child)) {
          helper(child);
        } else if (!isArbCommentNode(child)) {
          collectTextNodesInElement(child);
        }
      });
    });
  };

  helper(list);

  return textNodes;
};

const listElementWithSelectionGenerator: fc.Arbitrary<ArbListElementWithSelection> = listElementGenerator.chain((list) => {
  const textNodes = getTextNodes(list);
  const numTextNodes = textNodes.length;

  return fc.record<ArbListElementWithSelection>({
    list: fc.constant(list),
    startTextNodeIndex: fc.nat(numTextNodes),
    endTextNodeIndex: fc.nat(numTextNodes)
  });
}).filter(({ startTextNodeIndex, endTextNodeIndex }) => startTextNodeIndex > 0 && endTextNodeIndex > 0).map((list) => {
  return { ...list, startTextNodeIndex: list.startTextNodeIndex - 1, endTextNodeIndex: list.endTextNodeIndex - 1 };
});

const toDomListElementWithSelection = (arbList: ArbListElementWithSelection) => {
  const textNodes: Text[] = [];

  const helper = (list: ArbListElement) => {
    const listEl = document.createElement(list.type);

    const toDomElement = (child: ArbElementNode) => {
      const el = document.createElement(child.type);

      Arr.each(child.children, (child) => {
        if (isArbTextNode(child)) {
          const textNode = document.createTextNode(child.value);
          el.appendChild(textNode);
          textNodes.push(textNode);
        } else if (isArbCommentNode(child)) {
          const commentNode = document.createComment(child.value);
          el.appendChild(commentNode);
        }
      });

      return el;
    };

    Arr.each(list.children, (li) => {
      const liEl = document.createElement(li.type);

      Arr.each(li.children, (child) => {
        if (isArbTextNode(child)) {
          const textNode = document.createTextNode(child.value);
          liEl.appendChild(textNode);
          textNodes.push(textNode);
        } else if (isArbCommentNode(child)) {
          liEl.appendChild(document.createComment(child.value));
        } else if (isArbListElement(child)) {
          liEl.appendChild(helper(child));
        } else {
          liEl.appendChild(toDomElement(child));
        }
      });

      listEl.appendChild(liEl);
    });

    return listEl;
  };

  const listElement = helper(arbList.list);
  const { startTextNodeIndex, endTextNodeIndex } = arbList;
  const startContainer = textNodes[startTextNodeIndex > endTextNodeIndex ? endTextNodeIndex : startTextNodeIndex];
  const endContainer = textNodes[endTextNodeIndex < startTextNodeIndex ? startTextNodeIndex : endTextNodeIndex];
  const startOffset = 0;
  const endOffset = endContainer.data.length;

  return { listElement, startContainer, startOffset, endContainer, endOffset };
};

// TODO: This can be optimized so that it doesn't produce a DOM Range and then just throws it away
export const domListGenerator: fc.Arbitrary<HTMLUListElement | HTMLOListElement> = listElementWithSelectionGenerator.chain((arbList) => fc.constant(toDomListElementWithSelection(arbList).listElement));

export const domListWithSelectionGenerator: fc.Arbitrary<ArbDomListElementWithSelection> = listElementWithSelectionGenerator.chain((arbList) => {
  const { listElement, startContainer, startOffset, endContainer, endOffset } = toDomListElementWithSelection(arbList);

  const range = document.createRange();
  range.setStart(startContainer, startOffset);
  range.setEnd(endContainer, endOffset);

  return fc.record<ArbDomListElementWithSelection>({
    list: fc.constant(listElement),
    range: fc.constant(range)
  });
});

