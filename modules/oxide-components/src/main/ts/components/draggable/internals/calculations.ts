import type { Boundries, Position, Shift, Size } from './types';

const delta = (start: Position, end: Position): { deltaX: number; deltaY: number } => ({ deltaX: end.x - start.x, deltaY: end.y - start.y });

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

const undoShift = (element: Position & Size, shift: Shift): Position & Size => ({
  width: element.width,
  height: element.height,
  x: element.x - shift.x,
  y: element.y - shift.y
});

const boundries = (element: Position & Size, upperLeftCorner: Position, bottomRightCorner: Position): Boundries => {
  const elementRight = element.x + element.width;
  const elementBottom = element.y + element.height;

  return {
    shiftX: {
      min: Math.ceil(-(element.x - upperLeftCorner.x)),
      max: Math.floor(bottomRightCorner.x - elementRight)
    },
    shiftY: {
      min: Math.ceil(-(element.y - upperLeftCorner.y)),
      max: Math.floor(bottomRightCorner.y - elementBottom)
    }
  };
};

export { delta, clamp, boundries, undoShift };
