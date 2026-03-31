import { Fun } from '@ephox/katamari';
import type { SugarElement } from '@ephox/sugar';

import { nuState } from '../common/BehaviourState';

import type { ModernDraggingState } from './ModernDraggingTypes';

const init = (): ModernDraggingState => {
  let draggingElement: SugarElement<HTMLElement> | null = null;
  let previousMousePosition: { x: number; y: number } = { x: 0, y: 0 };
  let dragging = false;

  const getDraggingElement = () => draggingElement;

  const getPreviousMousePosition = () => previousMousePosition;

  const updateMousePosition = (mousePosition: { x: number; y: number }) => {
    previousMousePosition = mousePosition;
  };

  const startDragging = (element: SugarElement<HTMLElement>, mousePosition: { x: number; y: number }) => {
    draggingElement = element;
    previousMousePosition = mousePosition;
    dragging = true;
  };

  const stopDragging = () => {
    dragging = false;
    draggingElement = null;
    previousMousePosition = { x: 0, y: 0 };
  };

  const isDragging = () => {
    return dragging;
  };

  const readState = Fun.constant({
    isDragging: dragging
  });

  return nuState({
    readState,
    getDraggingElement,
    getPreviousMousePosition,
    updateMousePosition,
    startDragging,
    stopDragging,
    isDragging
  });
};

export {
  init
};
