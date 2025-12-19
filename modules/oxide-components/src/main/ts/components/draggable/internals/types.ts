import type { Property } from 'csstype';
import type { HTMLAttributes, PropsWithChildren } from 'react';

export interface AllowedOverflow {
  horizontal: number;
  vertical: number;
}

export type DraggableProps = {
  // The popover attribute is missing from HTMLAttributes, it's released in React v19. We can remove this property once we upgrade to React v19.
  popover?: 'hint' | 'manual' | 'auto';
  declaredSize?: CssSize;
  allowedOverflow?: Partial<AllowedOverflow>;
} & PositioningProps & HTMLAttributes<HTMLDivElement>;

type PositioningProps =
  { anchor?: never; initialPosition?: { top: Property.Top; left: Property.Left }} |
  { anchor: 'top-left'; initialPosition?: { top: Property.Top; left: Property.Left }} |
  { anchor: 'top-right'; initialPosition?: { top: Property.Top; right: Property.Right }} |
  { anchor: 'bottom-left'; initialPosition?: { bottom: Property.Bottom; left: Property.Left }} |
  { anchor: 'bottom-right'; initialPosition?: { bottom: Property.Bottom; right: Property.Right }};

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
  top: Property.Top;
  left: Property.Left;
}

export interface CssSize {
  width: Property.Width;
  height: Property.Height;
}
export interface DraggableState {
  setShift: React.Dispatch<React.SetStateAction<Shift>>;
  draggableRef: React.RefObject<HTMLDivElement | null>;
  isDragging: boolean;
  setIsDragging: React.Dispatch<React.SetStateAction<boolean>>;
  setPosition: React.Dispatch<React.SetStateAction<CssPosition | Position>>;
  allowedOverflow: AllowedOverflow;
};

export interface Boundaries {
  x: { min: number; max: number };
  y: { min: number; max: number };
};

export interface Size {
  width: number;
  height: number;
}
