import type { Boundries, Position, Shift, Size } from './types';

const delta = (start: Position, end: Position): { deltaX: number; deltaY: number } => ({ deltaX: end.x - start.x, deltaY: end.y - start.y });

const round = (shift: Shift): Shift => ({ x: Math.round(shift.x), y: Math.round(shift.y) });

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

const boundries = (element: Position & Size, upperLeftCorner: Position, bottomRightCorner: Position): Boundries => {
  const elementRight = element.x + element.width;
  const elementBottom = element.y + element.height;

  return {
    shiftX: {
      min: -(element.x - upperLeftCorner.x),
      max: bottomRightCorner.x - elementRight
    },
    shiftY: {
      min: -(element.y - upperLeftCorner.y),
      max: bottomRightCorner.y - elementBottom
    }
  };
};

export { delta, round, clamp, boundries };
