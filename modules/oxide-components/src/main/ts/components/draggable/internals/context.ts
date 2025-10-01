import { Fun } from '@ephox/katamari';
import { createContext, useContext } from 'react';

import type { DraggableState } from './types';

const initialState: DraggableState = { setShift: Fun.noop };
const DraggableContext = createContext<DraggableState>(initialState);

const useDraggable = (): DraggableState => {
  const context = useContext(DraggableContext);
  if (!context) {
    throw new Error('Draggable compound components must be rendered within the Draggable component');
  }
  return context;
};

export { useDraggable, DraggableContext };