import { createContext, useContext } from 'react';

import type { DraggableState } from './types';

const DraggableContext = createContext<DraggableState | null>(null);

const useDraggable = (): DraggableState => {
  const context = useContext(DraggableContext);
  if (context === null) {
    throw new Error('Draggable compound components must be rendered within the Draggable component');
  }
  return context;
};

export { useDraggable, DraggableContext };