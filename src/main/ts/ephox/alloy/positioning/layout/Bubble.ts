import { Fun, Arr } from '@ephox/katamari';
import { Position } from '@ephox/sugar';
import { SugarPosition } from '../../alien/TypeDefinitions';

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
  southmiddle: () => BubbleInstance;
  northmiddle: () => BubbleInstance;
}

const noClasses = () => ({
  top: [ ],
  left: [ ],
  bottom: [ ],
  right: [ ],
  middle: [ ]
});

const nu = (width, yoffset, classes: { top: string[], left: string[], bottom: string[], right: string[], middle: string[] }): Bubble => {
  return {
    southeast: () => ({
      offset: () => Position(-width, yoffset),
      classesOn: () => Arr.flatten([ classes.top, classes.left ]),
      classesOff: () => Arr.flatten([ classes.right, classes.bottom, classes.middle ])
    }),
    southwest: () => ({
      offset: () => Position(width, yoffset),
      classesOn: () => Arr.flatten([ classes.top, classes.right ]),
      classesOff: () => Arr.flatten([ classes.left, classes.bottom, classes.middle ])
    }),
    southmiddle: () => ({
      offset: () => Position(-width/2, -yoffset),
      classesOn: () => Arr.flatten([ classes.top, classes.middle ]),
      classesOff: () => Arr.flatten([ classes.left, classes.right, classes.bottom ])
    }),
    northeast: () => ({
      offset: () => Position(-width, -yoffset),
      classesOn: () => Arr.flatten([ classes.bottom, classes.left ]),
      classesOff: () => Arr.flatten([ classes.right, classes.top, classes.middle ])
    }),
    northwest: () => ({
      offset: () => Position(width, -yoffset),
      classesOn: () => Arr.flatten([ classes.bottom, classes.right ]),
      classesOff: () => Arr.flatten([ classes.left, classes.top, classes.middle ])
    }),
    northmiddle: () => ({
      offset: () => Position(-width/2, -yoffset),
      classesOn: () => Arr.flatten([ classes.bottom, classes.middle ]),
      classesOff: () => Arr.flatten([ classes.left, classes.right, classes.top ])
    })
  };
};

const fallback = () => nu(0, 0, noClasses());

export {
  nu,
  noClasses,
  fallback
};