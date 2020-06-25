import {
  Document, Element as DomElement, Event, EventTarget,
  HTMLElement, HTMLElementTagNameMap,
  Node as DomNode,
  ShadowRoot
} from '@ephox/dom-globals';
import * as Node from './Node';
import * as Head from './Head';
import { Arr, Fun, Option, Type } from '@ephox/katamari';
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
  // Can't use Body.body without causing a circular module reference (since Body.inBody uses ShadowDom)
  isShadowRoot(dos) ? dos : Element.fromDom(Traverse.documentOrOwner(dos).dom().body);

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

/**
 * When Events bubble up through a ShadowRoot, the browser changes the target to be the shadow host.
 * This function gets the "original" event target if possible.
 * This only works if the shadow tree is open - if the shadow tree is closed, event.target is returned.
 * See: https://developers.google.com/web/fundamentals/web-components/shadowdom#events
 */
export const getOriginalEventTarget = (event: Event): Option<EventTarget> => {
  if (isSupported() && Type.isNonNullable(event.target)) {
    const el = Element.fromDom(event.target as DomNode);
    if (Node.isElement(el) && isOpenShadowHost(Element.fromDom(event.target as DomElement))) {
      // When target element is inside Shadow DOM we need to take first element from composedPath
      // otherwise we'll get Shadow Root parent, not actual target element.
      // TODO: TINY-3312 Upgrade to latest dom-globals which includes the missing Event.composedPath property
      const eventAny = event as any;
      if (eventAny.composed && eventAny.composedPath) {
        const composedPath = eventAny.composedPath();
        if (composedPath) {
          return Arr.head(composedPath);
        }
      }
    }
  }
  return Option.from(event.target);
};

// TODO: TINY-3312 Upgrade to latest dom-globals which includes the missing 'mode' property
export const isOpenShadowRoot = (sr: Element<ShadowRoot>): boolean =>
  (sr.dom() as any).mode === 'open';

// TODO: TINY-3312 Upgrade to latest dom-globals which includes the missing 'mode' property
export const isClosedShadowRoot = (sr: Element<ShadowRoot>): boolean =>
  (sr.dom() as any).mode === 'closed';

/** Return true if the element is a host of an open shadow root.
 *  Return false if the element is a host of a closed shadow root, or if the element is not a host.
 */
export const isOpenShadowHost = (element: Element<DomElement>): boolean =>
  Type.isNonNullable(element.dom().shadowRoot);
