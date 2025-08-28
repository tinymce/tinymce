/**
 * Direction enum for caret movement operations.
 */
export const enum HDirection {
  Backwards = -1,
  Forwards = 1
}

/**
 * Checks if the direction is forwards.
 */
export const isForwards = (direction: HDirection): boolean => direction === HDirection.Forwards;

/**
 * Checks if the direction is backwards.
 */
export const isBackwards = (direction: HDirection): boolean => direction === HDirection.Backwards;
