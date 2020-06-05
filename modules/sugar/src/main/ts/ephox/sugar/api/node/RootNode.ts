import { Document, Element as DomElement, ShadowRoot } from '@ephox/dom-globals';
import * as NodeTypes from './NodeTypes';
import { Type } from '@ephox/katamari';

export type RootNode = Document | ShadowRoot;

export const isShadowRoot = (dos: RootNode): dos is ShadowRoot =>
  dos.nodeType === NodeTypes.DOCUMENT_FRAGMENT;

export const isDocument = (dos: RootNode): dos is Document =>
  dos.nodeType === NodeTypes.DOCUMENT;

export const getRootNode = (e: DomElement): RootNode => {
  // NOTE: Node.getRootNode() doesn't exist on IE11 and pre-Chromium Edge
  const ea: any = e;
  return Type.isFunction(ea.getRootNode) ? ea.getRootNode() : e.ownerDocument;
};
