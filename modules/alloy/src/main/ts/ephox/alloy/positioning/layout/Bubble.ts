import { Arr, Obj } from '@ephox/katamari';
import { SugarPosition } from '@ephox/sugar';

export interface BubbleInstance {
  readonly offset: SugarPosition;
  readonly classesOn: string[];
  readonly classesOff: string[];
}

export interface Bubble {
  southeast: () => BubbleInstance;
  southwest: () => BubbleInstance;
  northwest: () => BubbleInstance;
  northeast: () => BubbleInstance;
  south: () => BubbleInstance;
  north: () => BubbleInstance;
  east: () => BubbleInstance;
  west: () => BubbleInstance;
  insetSoutheast: () => BubbleInstance;
  insetSouthwest: () => BubbleInstance;
  insetNorthwest: () => BubbleInstance;
  insetNortheast: () => BubbleInstance;
  insetSouth: () => BubbleInstance;
  insetNorth: () => BubbleInstance;
  insetEast: () => BubbleInstance;
  insetWest: () => BubbleInstance;
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

  // Used for insets
  inset?: string[];
}

const allAlignments: Array<keyof BubbleAlignments> = [
  'valignCentre',

  'alignLeft',
  'alignRight',
  'alignCentre',

  'top',
  'bottom',
  'left',
  'right',

  'inset'
];

const nu = (xOffset: number, yOffset: number, classes: BubbleAlignments, insetModifier: number = 1): Bubble => {
  const insetXOffset = xOffset * insetModifier;
  const insetYOffset = yOffset * insetModifier;

  const getClasses = (prop: keyof BubbleAlignments): string[] => Obj.get(classes, prop).getOr([ ]);

  const make = (xDelta: number, yDelta: number, alignmentsOn: Array<(keyof BubbleAlignments)>) => {
    const alignmentsOff = Arr.difference(allAlignments, alignmentsOn);
    return {
      offset: SugarPosition(xDelta, yDelta),
      classesOn: Arr.bind(alignmentsOn, getClasses),
      classesOff: Arr.bind(alignmentsOff, getClasses)
    };
  };

  return {
    southeast: () => make(-xOffset, yOffset, [ 'top', 'alignLeft' ]),
    southwest: () => make(xOffset, yOffset, [ 'top', 'alignRight' ]),
    south: () => make(-xOffset / 2, yOffset, [ 'top', 'alignCentre' ]),
    northeast: () => make(-xOffset, -yOffset, [ 'bottom', 'alignLeft' ]),
    northwest: () => make(xOffset, -yOffset, [ 'bottom', 'alignRight' ]),
    north: () => make(-xOffset / 2, -yOffset, [ 'bottom', 'alignCentre' ]),
    east: () => make(xOffset, -yOffset / 2, [ 'valignCentre', 'left' ]),
    west: () => make(-xOffset, -yOffset / 2, [ 'valignCentre', 'right' ]),
    insetNortheast: () => make(insetXOffset, insetYOffset, [ 'top', 'alignLeft', 'inset' ]),
    insetNorthwest: () => make(-insetXOffset, insetYOffset, [ 'top', 'alignRight', 'inset' ]),
    insetNorth: () => make(-insetXOffset / 2, insetYOffset, [ 'top', 'alignCentre', 'inset' ]),
    insetSoutheast: () => make(insetXOffset, -insetYOffset, [ 'bottom', 'alignLeft', 'inset' ]),
    insetSouthwest: () => make(-insetXOffset, -insetYOffset, [ 'bottom', 'alignRight', 'inset' ]),
    insetSouth: () => make(-insetXOffset / 2, -insetYOffset, [ 'bottom', 'alignCentre', 'inset' ]),
    insetEast: () => make(-insetXOffset, -insetYOffset / 2, [ 'valignCentre', 'right', 'inset' ]),
    insetWest: () => make(insetXOffset, -insetYOffset / 2, [ 'valignCentre', 'left', 'inset' ])
  };
};

const fallback = (): Bubble => nu(0, 0, { });

export {
  nu,
  fallback
};
