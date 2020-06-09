import {
  Document, Element as DomElement,
  HTMLElement, HTMLElementTagNameMap,
  Node as DomNode,
  ShadowRoot
} from '@ephox/dom-globals';
import * as Node from './Node';
import * as Head from './Head';
import * as Body from './Body';
import { Fun, Option, Type } from '@ephox/katamari';
import Element from './Element';
import * as Traverse from '../search/Traverse';

export type RootNode = Element<Document | ShadowRoot>;

/**
 * Is the element a ShadowRoot?
 *
 * Note: this is insufficient to test if any element is a shadow root, but it is sufficient to differentiate between
 * a Document and a ShadowRoot.
 */
export const isShadowRoot = (dos: RootNode): dos is Element<ShadowRoot> =>
  Node.isDocumentFragment(dos);

const supported: boolean =
  Type.isFunction((DomElement.prototype as any).attachShadow) &&
  Type.isFunction((DomNode.prototype as any).getRootNode);

/**
 * Does the browser support shadow DOM?
 *
 * NOTE: Node.getRootNode() and Element.attachShadow don't exist on IE11 and pre-Chromium Edge.
 */
export const isSupported = Fun.constant(supported);

export const getRootNode: (e: Element<DomNode>) => RootNode =
  supported
    ? (e) => Element.fromDom((e.dom() as any).getRootNode())
    : Traverse.documentOrOwner;


/** Create an element, using the actual document. */
export const createElement: {
  <K extends keyof HTMLElementTagNameMap>(dos: RootNode, tag: K): Element<HTMLElementTagNameMap[K]>;
  (dos: RootNode, tag: string): Element<HTMLElement>;
} = (dos: RootNode, tag: string) =>
  Element.fromTag(tag, Traverse.documentOrOwner(dos).dom());

/** Where style tags need to go. ShadowRoot or document head */
export const getStyleContainer = (dos: RootNode): Element<DomNode> =>
  isShadowRoot(dos) ? dos : Head.getHead(Traverse.documentOrOwner(dos));

/** Where content needs to go. ShadowRoot or document body */
export const getContentContainer = (dos: RootNode): Element<DomNode> =>
  isShadowRoot(dos) ? dos : Body.getBody(Traverse.documentOrOwner(dos));

/** Is this element either a ShadowRoot or a descendent of a ShadowRoot. */
export const isInShadowRoot = (e: Element<DomNode>): boolean =>
  getShadowRoot(e).isSome();

/** If this element is in a ShadowRoot, return it. */
export const getShadowRoot = (e: Element<DomNode>): Option<Element<ShadowRoot>> => {
  const r = getRootNode(e);
  return isShadowRoot(r) ? Option.some(r) : Option.none();
};

/** Return the host of a ShadowRoot.
 *
 * This function will throw if Shadow DOM is unsupported in the browser, or if the host is null.
 * If you actually have a ShadowRoot, this shouldn't happen.
 */
export const getShadowHost = (e: Element<ShadowRoot>): Element<DomElement> =>
  Element.fromDom(e.dom().host);
