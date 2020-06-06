import { Document, Element as DomElement, Node as DomNode, ShadowRoot } from '@ephox/dom-globals';
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
