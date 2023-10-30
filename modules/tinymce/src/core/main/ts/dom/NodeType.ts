import { Arr, Type } from '@ephox/katamari';
import { SugarElement, SugarNode } from '@ephox/sugar';

type NullableNode = Node | null | undefined;

const isNodeType = <T extends Node>(type: number) => {
  return (node: NullableNode): node is T => {
    return !!node && node.nodeType === type;
  };
};

// Firefox can allow you to get a selection on a restricted node, such as file/number inputs. These nodes
// won't implement the Object prototype, so Object.getPrototypeOf() will return null or something similar.
const isRestrictedNode = (node: NullableNode): boolean => !!node && !Object.getPrototypeOf(node);

const isElement = isNodeType<Element>(1);
const isHTMLElement = (node: NullableNode): node is HTMLElement => isElement(node) && SugarNode.isHTMLElement(SugarElement.fromDom(node));
const isSVGElement = (node: NullableNode): node is SVGElement => isElement(node) && node.namespaceURI === 'http://www.w3.org/2000/svg';

const matchNodeName = <T extends Node>(name: string): (node: NullableNode) => node is T => {
  const lowerCasedName = name.toLowerCase();

  return (node: NullableNode): node is T =>
    Type.isNonNullable(node) && node.nodeName.toLowerCase() === lowerCasedName;
};

const matchNodeNames = <T extends Node>(names: string[]): (node: NullableNode) => node is T => {
  const lowerCasedNames = names.map((s) => s.toLowerCase());

  return (node: NullableNode): node is T => {
    if (node && node.nodeName) {
      const nodeName = node.nodeName.toLowerCase();
      return Arr.contains(lowerCasedNames, nodeName);
    }

    return false;
  };
};

const matchStyleValues = (name: string, values: string): (node: NullableNode) => boolean => {
  const items = values.toLowerCase().split(' ');

  return (node: NullableNode) => {
    if (isElement(node)) {
      const win: Window | null = node.ownerDocument.defaultView;
      if (win) {
        for (let i = 0; i < items.length; i++) {
          const computed = win.getComputedStyle(node, null);
          const cssValue = computed ? computed.getPropertyValue(name) : null;
          if (cssValue === items[i]) {
            return true;
          }
        }
      }
    }

    return false;
  };
};

const hasAttribute = (attrName: string) => {
  return (node: NullableNode): boolean => {
    return isElement(node) && node.hasAttribute(attrName);
  };
};

const hasAttributeValue = (attrName: string, attrValue: string) => {
  return (node: NullableNode): boolean => {
    return isElement(node) && node.getAttribute(attrName) === attrValue;
  };
};

const isBogus = (node: NullableNode): node is Element => isElement(node) && node.hasAttribute('data-mce-bogus');
const isBogusAll = (node: NullableNode): node is Element => isElement(node) && node.getAttribute('data-mce-bogus') === 'all';
const isTable = (node: NullableNode): node is HTMLTableElement => isElement(node) && node.tagName === 'TABLE';

const hasContentEditableState = (value: string) => {
  return (node: NullableNode): node is HTMLElement => {
    if (isHTMLElement(node)) {
      if (node.contentEditable === value) {
        return true;
      }

      if (node.getAttribute('data-mce-contenteditable') === value) {
        return true;
      }
    }

    return false;
  };
};

const isTextareaOrInput = matchNodeNames<HTMLTextAreaElement | HTMLInputElement>([ 'textarea', 'input' ]);

const isText = isNodeType<Text>(3);
const isCData = isNodeType<CDATASection>(4);
const isPi = isNodeType<ProcessingInstruction>(7);
const isComment = isNodeType<Comment>(8);
const isDocument = isNodeType<Document>(9);
const isDocumentFragment = isNodeType<DocumentFragment>(11);
const isBr = matchNodeName<HTMLBRElement>('br');
const isImg = matchNodeName<HTMLImageElement>('img');
const isContentEditableTrue = hasContentEditableState('true');
const isContentEditableFalse = hasContentEditableState('false');

const isTableCell = matchNodeNames<HTMLTableCellElement>([ 'td', 'th' ]);
const isTableCellOrCaption = matchNodeNames<HTMLTableCellElement>([ 'td', 'th', 'caption' ]);
const isMedia = matchNodeNames<HTMLElement>([ 'video', 'audio', 'object', 'embed' ]);
const isListItem = matchNodeName<HTMLLIElement>('li');
const isDetails = matchNodeName<HTMLDetailsElement>('details');
const isSummary = matchNodeName<HTMLElement>('summary');

export {
  isText,
  isElement,
  isHTMLElement,
  isSVGElement,
  isCData,
  isPi,
  isComment,
  isDocument,
  isDocumentFragment,
  isBr,
  isImg,
  isContentEditableTrue,
  isContentEditableFalse,
  isMedia,
  isTableCell,
  isTableCellOrCaption,
  isRestrictedNode,
  matchNodeNames,
  hasAttribute,
  hasAttributeValue,
  matchStyleValues,
  isBogus,
  isBogusAll,
  isTable,
  isTextareaOrInput,
  isListItem,
  isDetails,
  isSummary
};
