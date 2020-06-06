import {
  Document,
  Element as DomElement,
  ElementCreationOptions,
  Node as DomNode,
  ShadowRoot
} from '@ephox/dom-globals';
import * as NodeTypes from './NodeTypes';
import { Type } from '@ephox/katamari';

export type RootNode = Document | ShadowRoot;

export const isShadowRoot = (dos: RootNode): dos is ShadowRoot =>
  dos.nodeType === NodeTypes.DOCUMENT_FRAGMENT;

export const isDocument = (dos: RootNode): dos is Document =>
  dos.nodeType === NodeTypes.DOCUMENT;

export const browserSupportsGetRootNode = (): boolean =>
  Type.isFunction((DomNode.prototype as any).getRootNode);

// NOTE: Node.getRootNode() doesn't exist on IE11 and pre-Chromium Edge
export const getRootNode = (e: DomElement): RootNode =>
  browserSupportsGetRootNode() ? (e as any).getRootNode() : e.ownerDocument;

export const actualDocument = (dos: RootNode): Document =>
  isDocument(dos) ? dos : dos.ownerDocument;

export const createElement = (dos: RootNode, tagName: string, options?: ElementCreationOptions): DomElement =>
  actualDocument(dos).createElement(tagName, options);

export const styleContainer = (dos: RootNode): DomNode =>
  isShadowRoot(dos) ? dos : dos.getElementsByTagName('head')[0];

export const bodyOrShadowRoot = (dos: RootNode): DomNode =>
  isShadowRoot(dos) ? dos : dos.body;
