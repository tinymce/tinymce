import type { PropsWithChildren, HTMLAttributes } from 'react';

export interface DraggableProps extends HTMLAttributes<HTMLDivElement> {
  // The popover attribute is missing from HTMLAttributes, it's released in React v19. We can remove this property once we upgrade to React v19.
  popover?: 'hint' | 'manual' | 'auto';
}

export interface DraggableHandleProps extends PropsWithChildren { }

export interface Shift {
  x: number;
  y: number;
};

export interface Position {
  x: number;
  y: number;
};

export interface DraggableState {
  setShift: React.Dispatch<React.SetStateAction<Shift>>;
  draggableRef: React.RefObject<HTMLDivElement | null>;
};

export interface Boundries {
  x: { min: number; max: number };
  y: { min: number; max: number };
};

export interface Size {
  width: number;
  height: number;
}
