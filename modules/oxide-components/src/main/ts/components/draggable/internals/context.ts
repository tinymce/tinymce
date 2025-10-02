import { Fun } from '@ephox/katamari';
import { createContext, useContext } from 'react';

import type { DraggableState } from './types';

const initialState: DraggableState = { shift: { x: 0, y: 0 }, setShift: Fun.noop, draggableRef: { current: null }};
const DraggableContext = createContext<DraggableState>(initialState);

const useDraggable = (): DraggableState => {
  const context = useContext(DraggableContext);
  if (!context) {
    throw new Error('Draggable compound components must be rendered within the Draggable component');
  }
  return context;
};

export { useDraggable, DraggableContext };