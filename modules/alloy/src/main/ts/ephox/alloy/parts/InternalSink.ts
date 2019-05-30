import { Fun } from '@ephox/katamari';

import * as Behaviour from '../api/behaviour/Behaviour';
import { Positioning } from '../api/behaviour/Positioning';
import * as AlloyEvents from '../api/events/AlloyEvents';
import * as NativeEvents from '../api/events/NativeEvents';
import * as PartType from './PartType';

const suffix = Fun.constant('sink');
const partType = Fun.constant(PartType.optional({
  name: suffix(),
  overrides: Fun.constant({
    dom: {
      tag: 'div'
    },
    behaviours: Behaviour.derive([
      Positioning.config({
        // TODO: Make an internal sink also be able to be used with relative layouts
        useFixed: true
      })
    ]),
    events: AlloyEvents.derive([
      // Sinks should not let keydown or click propagate
      AlloyEvents.cutter(NativeEvents.keydown()),
      AlloyEvents.cutter(NativeEvents.mousedown()),
      AlloyEvents.cutter(NativeEvents.click())
    ])
  })
}));

export {
  partType,
  suffix
};