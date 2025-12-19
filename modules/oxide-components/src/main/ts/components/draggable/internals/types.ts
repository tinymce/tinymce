import type { Property } from 'csstype';
import type { HTMLAttributes, PropsWithChildren } from 'react';

export interface AllowedOverflow {
  horizontal: number;
  vertical: number;
}

export type Origin = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export interface DraggableProps extends HTMLAttributes<HTMLDivElement> {
  // The popover attribute is missing from HTMLAttributes, it's released in React v19. We can remove this property once we upgrade to React v19.
  popover?: 'hint' | 'manual' | 'auto';
  origin?: Origin;
  initialPosition?: CssPosition;
  declaredSize?: CssSize;
  allowedOverflow?: Partial<AllowedOverflow>;
  onDragStart?: () => void;
  onDragEnd?: () => void;
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

export interface CssPosition {
  x: Property.Top;
  y: Property.Left;
}

export interface CssSize {
  width: Property.Width;
  height: Property.Height;
}
export interface DraggableState {
  setShift: Dispatch<SetStateAction<Shift>>;
  draggableRef: RefObject<HTMLDivElement | null>;
  isDragging: boolean;
  setIsDragging: React.Dispatch<React.SetStateAction<boolean>>;
  setPosition: React.Dispatch<React.SetStateAction<CssPosition | Position>>;
  allowedOverflow: AllowedOverflow;
  origin: Origin;
  onDragStart?: () => void;
  onDragEnd?: () => void;
};

export interface Boundaries {
  x: { min: number; max: number };
  y: { min: number; max: number };
};

export interface Size {
  width: number;
  height: number;
}
