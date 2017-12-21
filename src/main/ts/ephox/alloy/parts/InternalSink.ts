import Behaviour from '../api/behaviour/Behaviour';
import Positioning from '../api/behaviour/Positioning';
import AlloyEvents from '../api/events/AlloyEvents';
import NativeEvents from '../api/events/NativeEvents';
import PartType from './PartType';
import { Fun } from '@ephox/katamari';

var suffix = 'sink';
var partType = PartType.optional({
  name: suffix,
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
});

export default <any> {
  partType: Fun.constant(partType),
  suffix: Fun.constant(suffix)
};