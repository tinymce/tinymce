import type { PropsWithChildren } from 'react';

export interface DraggableProps extends PropsWithChildren { }

export interface DraggableHandleProps extends PropsWithChildren { }

export interface Shift {
  x: number; y: number;
};

export interface Position {
  x: number; y: number;
};

export interface DraggableState {
  setShift: React.Dispatch<React.SetStateAction<Shift>>;
};
