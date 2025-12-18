import type { Boundaries, Position, Size } from './types';

const delta = (start: Position, end: Position): { deltaX: number; deltaY: number } => ({ deltaX: end.x - start.x, deltaY: end.y - start.y });

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

/**
 * This function calculates the min/max coordinates the mouse cursor can move to during a drag,
 * ensuring the element stays within the specified positioning boundaries (upperLeftCorner and bottomRightCorner).
 *
 * @param element - Current position and size of the draggable element
 * @param startMousePosition - Initial mouse position when drag started (grab point)
 * @param constraints - Positioning boundaries for the element
 * @param constraints.upperLeftCorner - Top-left boundary for element positioning
 * @param constraints.bottomRightCorner - Bottom-right boundary for element positioning
 * @param allowedOverflow - Optional overflow amount in pixels for x and y axes (default: {x: 0, y: 0}). This allows part of the element to go outside the boundaries.
 * @returns Boundaries object with min/max coordinates for the mouse cursor during drag
 *
 */
const boundaries = (
  element: Position & Size,
  startMousePosition: Position,
  constraints: { upperLeftCorner: Position; bottomRightCorner: Position },
  allowedOverflow: { x: number; y: number } = { x: 0, y: 0 }
): Boundaries => {
  const { upperLeftCorner, bottomRightCorner } = constraints;
  const elementRight = element.x + element.width;
  const elementBottom = element.y + element.height;

  return {
    x: {
      min: Math.ceil(upperLeftCorner.x + (startMousePosition.x - element.x) - allowedOverflow.x),
      max: Math.floor(bottomRightCorner.x - (elementRight - startMousePosition.x) + allowedOverflow.x)
    },
    y: {
      min: Math.ceil(upperLeftCorner.y + (startMousePosition.y - element.y) - allowedOverflow.y),
      max: Math.floor(bottomRightCorner.y - (elementBottom - startMousePosition.y) + allowedOverflow.y)
    }
  };
};
// TODO: write tests for that

export { delta, clamp, boundaries };
