import type { Position, Shift } from './types';

const delta = (start: Position, end: Position): { deltaX: number; deltaY: number } => ({ deltaX: end.x - start.x, deltaY: end.y - start.y });

const round = (shift: Shift): Shift => ({ x: Math.round(shift.x), y: Math.round(shift.y) });

export { delta, round };
