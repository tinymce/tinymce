import { Unicode } from '@ephox/katamari';

const isTextNode = (node: Node): node is Text =>
  node.nodeType === 3;

const isElement = (node: Node): node is Element =>
  node.nodeType === 1;

const isBracketOrSpace = (char: string): boolean =>
  /^[(\[{ \u00a0]$/.test(char);

// Note: This is similar to the Polaris protocol detection, except it also handles `mailto` and any length scheme
const hasProtocol = (url: string): boolean =>
  /^([A-Za-z][A-Za-z\d.+-]*:\/\/)|mailto:/.test(url);

// A limited list of punctuation characters that might be used after a link
const isPunctuation = (char: string): boolean =>
  /[?!,.;:]/.test(char);

const findChar = (text: string, index: number, predicate: (char: string) => boolean): number => {
  for (let i = index - 1; i >= 0; i--) {
    const char = text.charAt(i);
    if (!Unicode.isZwsp(char) && predicate(char)) {
      return i;
    }
  }

  return -1;
};

const freefallRtl = (container: Node, offset: number): { container: Node; offset: number } => {
  let tempNode = container;
  let tempOffset = offset;
  while (isElement(tempNode) && tempNode.childNodes[tempOffset]) {
    tempNode = tempNode.childNodes[tempOffset];
    tempOffset = isTextNode(tempNode) ? tempNode.data.length : tempNode.childNodes.length;
  }

  return { container: tempNode, offset: tempOffset };
};

export {
  freefallRtl,
  findChar,
  isElement,
  isTextNode,
  isPunctuation,
  isBracketOrSpace,
  hasProtocol
};
