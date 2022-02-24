import { Fun, Optional } from '@ephox/katamari';
import { Css, SugarBody, SugarElement, Traverse } from '@ephox/sugar';

import Editor from './api/Editor';

const getProp = <K extends keyof Element>(propName: K, elm: SugarElement<Element>): Element[K] => {
  const rawElm = elm.dom;
  return rawElm[propName];
};

const getComputedSizeProp = (propName: string, elm: SugarElement<Element>): number =>
  parseInt(Css.get(elm, propName), 10);

const getClientWidth = Fun.curry(getProp, 'clientWidth' as 'clientWidth');
const getClientHeight = Fun.curry(getProp, 'clientHeight' as 'clientHeight');
const getMarginTop = Fun.curry(getComputedSizeProp, 'margin-top');
const getMarginLeft = Fun.curry(getComputedSizeProp, 'margin-left');

const getBoundingClientRect = (elm: SugarElement<Element>): DOMRect =>
  elm.dom.getBoundingClientRect();

const isInsideElementContentArea = (bodyElm: SugarElement<Element>, clientX: number, clientY: number): boolean => {
  const clientWidth = getClientWidth(bodyElm);
  const clientHeight = getClientHeight(bodyElm);

  return clientX >= 0 && clientY >= 0 && clientX <= clientWidth && clientY <= clientHeight;
};

const transpose = (inline: boolean, elm: SugarElement<Element>, clientX: number, clientY: number): { x: number; y: number } => {
  const clientRect = getBoundingClientRect(elm);
  const deltaX = inline ? clientRect.left + elm.dom.clientLeft + getMarginLeft(elm) : 0;
  const deltaY = inline ? clientRect.top + elm.dom.clientTop + getMarginTop(elm) : 0;
  const x = clientX - deltaX;
  const y = clientY - deltaY;

  return { x, y };
};

// Checks if the specified coordinate is within the visual content area excluding the scrollbars
const isXYInContentArea = (editor: Editor, clientX: number, clientY: number): boolean => {
  const bodyElm = SugarElement.fromDom(editor.getBody());
  const targetElm = editor.inline ? bodyElm : Traverse.documentElement(bodyElm);
  const transposedPoint = transpose(editor.inline, targetElm, clientX, clientY);

  return isInsideElementContentArea(targetElm, transposedPoint.x, transposedPoint.y);
};

const fromDomSafe = <T extends Node>(node: T | null): Optional<SugarElement<T>> =>
  Optional.from(node).map(SugarElement.fromDom);

const isEditorAttachedToDom = (editor: Editor): boolean => {
  const rawContainer = editor.inline ? editor.getBody() : editor.getContentAreaContainer();

  return fromDomSafe(rawContainer).map(SugarBody.inBody).getOr(false);
};

export {
  isXYInContentArea,
  isEditorAttachedToDom
};
