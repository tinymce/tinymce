import { Fun, Arr } from '@ephox/katamari';
import { Position } from '@ephox/sugar';
import { SugarPosition } from '../../alien/TypeDefinitions';
import { Objects } from '@ephox/boulder';

export interface BubbleInstance {
  offset: () => SugarPosition;
  classesOn: () => string[];
  classesOff: () => string[];
}

export interface Bubble {
  southeast: () => BubbleInstance
  southwest: () => BubbleInstance;
  northwest: () => BubbleInstance;
  northeast: () => BubbleInstance;
  south: () => BubbleInstance;
  north: () => BubbleInstance;
  east: () => BubbleInstance;
  west: () => BubbleInstance;
}

export interface BubbleAlignments {
  // Used for east and west
  valignCentre?: string[];

  // Used for *east
  alignLeft?: string[];
  // Used for *west
  alignRight?: string[];
  // Used for *middle
  alignCentre?: string[];

  // Used for south*
  top?: string[];
  bottom?: string[];
  // Used for east
  left?: string[];
  // Used for west
  right?: string[];
}

const allAlignments = [
  'valignCentre',

  'alignLeft',
  'alignRight',
  'alignCentre',

  'top',
  'bottom',
  'left',
  'right'
];

const nu = (width, yoffset, classes: BubbleAlignments): Bubble => {
  const getClasses = (prop: string): string[] => {
    return Objects.readOptFrom<string[]>(classes, prop).getOr([ ])
  };

  const make = (xDelta: number, yDelta: number, alignmentsOn: string[]) => {
    const alignmentsOff = Arr.difference(allAlignments, alignmentsOn);
    return {
      offset: () => Position(xDelta, yDelta),
      classesOn: () => Arr.bind(alignmentsOn, getClasses),
      classesOff: () => Arr.bind(alignmentsOff, getClasses)
    };
  };

  return {
    southeast: () => make(-width, yoffset, [ 'top', 'alignLeft' ]),
    southwest: () => make(width, yoffset, [ 'top', 'alignRight' ]),
    south: () => make(-width/2, yoffset, [ 'top', 'alignCentre' ]),
    northeast: () => make(-width, -yoffset, [ 'bottom', 'alignLeft' ]),
    northwest: () => make(width, -yoffset, [ 'bottom', 'alignRight' ]),
    north: () => make(-width/2, -yoffset, [ 'bottom', 'alignCentre' ]),
    east: () => make(width, -yoffset/2, [ 'valignCentre', 'left' ]),
    west: () => make(-width, -yoffset/2, [ 'valignCentre', 'right' ])
  };
};

const fallback = () => nu(0, 0, { });

export {
  nu,
  fallback
};