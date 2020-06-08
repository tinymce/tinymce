import {
  Document, Element as DomElement,
  HTMLElement, HTMLElementTagNameMap,
  Node as DomNode,
  ShadowRoot
} from '@ephox/dom-globals';
import * as Node from './Node';
import * as Head from './Head';
import * as Body from './Body';
import { Option, Type } from '@ephox/katamari';
import Element from './Element';

export type RootNode = Element<Document | ShadowRoot>;

export const isShadowRoot = (dos: RootNode): dos is Element<ShadowRoot> =>
  Node.isDocumentFragment(dos);

export const isDocument = (dos: RootNode): dos is Element<Document> =>
  Node.isDocument(dos);

/**
 * Does the browser support shadow DOM?
 *
 * NOTE: Node.getRootNode() and Element.attachShadow don't exist on IE11 and pre-Chromium Edge.
 */
export const isSupported = (): boolean =>
  Type.isFunction((DomElement.prototype as any).attachShadow) &&
  Type.isFunction((DomNode.prototype as any).getRootNode);

export const getRootNode = (e: Element<DomNode>): RootNode => {
  if (isSupported()) {
    return Element.fromDom((e.dom() as any).getRootNode());
  } else {
    // ownerDocument returns null for a document, and Element.fromDom requires non-null,
    // so we have to check if the element is a document.
    return Node.isDocument(e) ? e : Element.fromDom(e.dom().ownerDocument);
  }
};

export const actualDocument = (dos: RootNode): Element<Document> =>
  isDocument(dos) ? dos : Element.fromDom(dos.dom().ownerDocument);

export const createElement: {
  <K extends keyof HTMLElementTagNameMap>(dos: RootNode, tag: K): Element<HTMLElementTagNameMap[K]>;
  (dos: RootNode, tag: string): Element<HTMLElement>;
} = (dos: RootNode, tag: string) =>
  Element.fromTag(tag, actualDocument(dos).dom());

/** Where style tags need to go. ShadowRoot or document head */
export const getStyleContainer = (dos: RootNode): Element<DomNode> =>
  isShadowRoot(dos) ? dos : Head.getHead(actualDocument(dos));

/** Where content needs to go. ShadowRoot or document body */
export const getContentContainer = (dos: RootNode): Element<DomNode> =>
  isShadowRoot(dos) ? dos : Body.getBody(actualDocument(dos));

export const isInShadowRoot = (e: Element<DomNode>): boolean =>
  isShadowRoot(getRootNode(e));

export const getShadowRoot = (e: Element<DomNode>): Option<Element<ShadowRoot>> => {
  const r = getRootNode(e);
  return isShadowRoot(r) ? Option.some(r) : Option.none();
};

export const getShadowHost = (e: Element<ShadowRoot>): Element<DomElement> =>
  Element.fromDom(e.dom().host);
