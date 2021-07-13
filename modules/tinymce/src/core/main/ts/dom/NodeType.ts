/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr } from '@ephox/katamari';

type NullableNode = Node | null | undefined;

const isNodeType = <T extends Node>(type: number) => {
  return (node: NullableNode): node is T => {
    return !!node && node.nodeType === type;
  };
};

// Firefox can allow you to get a selection on a restricted node, such as file/number inputs. These nodes
// won't implement the Object prototype, so Object.getPrototypeOf() will return null or something similar.
const isRestrictedNode = (node: NullableNode): boolean => !!node && !Object.getPrototypeOf(node);

const isElement = isNodeType<HTMLElement>(1);

const matchNodeNames = <T extends Node>(names: string[]): (node: NullableNode) => node is T => {
  const lowercasedNames = names.map((s) => s.toLowerCase());

  return (node: NullableNode): node is T => {
    if (node && node.nodeName) {
      const nodeName = node.nodeName.toLowerCase();
      return Arr.contains(lowercasedNames, nodeName);
    }

    return false;
  };
};

const matchStyleValues = (name: string, values: string): (node: NullableNode) => boolean => {
  const items = values.toLowerCase().split(' ');

  return (node: NullableNode) => {
    if (isElement(node)) {
      for (let i = 0; i < items.length; i++) {
        const computed = node.ownerDocument.defaultView.getComputedStyle(node, null);
        const cssValue = computed ? computed.getPropertyValue(name) : null;
        if (cssValue === items[i]) {
          return true;
        }
      }
    }

    return false;
  };
};

const hasPropValue = (propName: keyof HTMLElement, propValue: any) => {
  return (node: NullableNode): boolean => {
    return isElement(node) && node[propName] === propValue;
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
const isTable = (node: NullableNode): node is Element => isElement(node) && node.tagName === 'TABLE';

const hasContentEditableState = (value: string) => {
  return (node: NullableNode): node is HTMLElement => {
    if (isElement(node)) {
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
const isComment = isNodeType<Comment>(8);
const isDocument = isNodeType<Document>(9);
const isDocumentFragment = isNodeType<DocumentFragment>(11);
const isBr = matchNodeNames<HTMLBRElement>([ 'br' ]);
const isImg = matchNodeNames<HTMLImageElement>([ 'img' ]);
const isContentEditableTrue = hasContentEditableState('true');
const isContentEditableFalse = hasContentEditableState('false');

const isTableCell = matchNodeNames<HTMLTableCellElement>([ 'td', 'th' ]);
const isMedia = matchNodeNames<HTMLElement>([ 'video', 'audio', 'object', 'embed' ]);

export {
  isText,
  isElement,
  isComment,
  isDocument,
  isDocumentFragment,
  isBr,
  isImg,
  isContentEditableTrue,
  isContentEditableFalse,
  isMedia,
  isTableCell,
  isRestrictedNode,
  matchNodeNames,
  hasPropValue,
  hasAttribute,
  hasAttributeValue,
  matchStyleValues,
  isBogus,
  isBogusAll,
  isTable,
  isTextareaOrInput
};
