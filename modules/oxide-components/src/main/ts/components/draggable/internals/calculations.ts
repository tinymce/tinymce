import type { Boundaries, Position, Size } from './types';

const delta = (start: Position, end: Position): { deltaX: number; deltaY: number } => ({ deltaX: end.x - start.x, deltaY: end.y - start.y });

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

const boundaries = (element: Position & Size, startMousePosition: Position, upperLeftCorner: Position, bottomRightCorner: Position): Boundaries => {
  const elementRight = element.x + element.width;
  const elementBottom = element.y + element.height;

  return {
    x: {
      min: Math.ceil(upperLeftCorner.x + (startMousePosition.x - element.x)),
      max: Math.floor(bottomRightCorner.x - (elementRight - startMousePosition.x))
    },
    y: {
      min: Math.ceil(upperLeftCorner.y + (startMousePosition.y - element.y)),
      max: Math.floor(bottomRightCorner.y - (elementBottom - startMousePosition.y))
    }
  };
};

export { delta, clamp, boundaries };
