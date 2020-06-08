import {
  Document, Element as DomElement,
  HTMLElement, HTMLElementTagNameMap,
  Node as DomNode,
  ShadowRoot
} from '@ephox/dom-globals';
import * as Node from './Node';
import * as Head from './Head';
import * as Body from './Body';
import { Type } from '@ephox/katamari';
import Element from './Element';

export type RootNode = Element<Document | ShadowRoot>;

export const isShadowRoot = (dos: RootNode): dos is Element<ShadowRoot> =>
  Node.isDocumentFragment(dos);

export const isDocument = (dos: RootNode): dos is Element<Document> =>
  Node.isDocument(dos);

export const isSupported = (): boolean =>
  Type.isFunction((DomElement.prototype as any).attachShadow) &&
  Type.isFunction((DomNode.prototype as any).getRootNode);

// NOTE: Node.getRootNode() doesn't exist on IE11 and pre-Chromium Edge
export const getRootNode = (e: Element<DomNode>): RootNode =>
  Element.fromDom(isSupported() ? (e.dom() as any).getRootNode() : e.dom().ownerDocument);

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
