import { FieldSchema } from '@ephox/boulder';
import { Cell, Fun, Option } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';

import * as Behaviour from '../../api/behaviour/Behaviour';
import { Focusing } from '../../api/behaviour/Focusing';
import { Keying } from '../../api/behaviour/Keying';
import * as AlloyEvents from '../../api/events/AlloyEvents';
import * as NativeEvents from '../../api/events/NativeEvents';
import * as PartType from '../../parts/PartType';
import * as SliderActions from './SliderActions';

const platform = PlatformDetection.detect();
const isTouch = platform.deviceType.isTouch();

const edgePart = function (name, action) {
  return PartType.optional({
    name: '' + name + '-edge',
    overrides (detail) {
      const touchEvents = AlloyEvents.derive([
        AlloyEvents.runActionExtra(NativeEvents.touchstart(), action, [ detail ])
      ]);

      const mouseEvents = AlloyEvents.derive([
        AlloyEvents.runActionExtra(NativeEvents.mousedown(), action, [ detail ]),
        AlloyEvents.runActionExtra(NativeEvents.mousemove(), function (l, det) {
          if (det.mouseIsDown().get()) { action (l, det); }
        }, [ detail ])
      ]);

      return {
        events: isTouch ? touchEvents : mouseEvents
      };
    }
  });
};

// When the user touches the left edge, it should move the thumb
const ledgePart = edgePart('left', SliderActions.setToLedge);

// When the user touches the right edge, it should move the thumb
const redgePart = edgePart('right', SliderActions.setToRedge);

// The thumb part needs to have position absolute to be positioned correctly
const thumbPart = PartType.required({
  name: 'thumb',
  defaults: Fun.constant({
    dom: {
      styles: { position: 'absolute' }
    }
  }),
  overrides (detail) {
    return {
      events: AlloyEvents.derive([
        // If the user touches the thumb itself, pretend they touched the spectrum instead. This
        // allows sliding even when they touchstart the current value
        AlloyEvents.redirectToPart(NativeEvents.touchstart(), detail, 'spectrum'),
        AlloyEvents.redirectToPart(NativeEvents.touchmove(), detail, 'spectrum'),
        AlloyEvents.redirectToPart(NativeEvents.touchend(), detail, 'spectrum')
      ])
    };
  }
});

const spectrumPart = PartType.required({
  schema: [
    FieldSchema.state('mouseIsDown', function () { return Cell(false); })
  ],
  name: 'spectrum',
  overrides (detail) {
    const moveToX = function (spectrum, simulatedEvent) {
      const spectrumBounds = spectrum.element().dom().getBoundingClientRect();
      SliderActions.setXFromEvent(spectrum, detail, spectrumBounds, simulatedEvent);
    };

    const moveToY = function (spectrum, simulatedEvent) {
      const spectrumBounds = spectrum.element().dom().getBoundingClientRect();
      SliderActions.setYFromEvent(spectrum, detail, spectrumBounds, simulatedEvent);
    };

    const moveTo = detail.orientation() === 'vertical' ? moveToY : moveToX;

    const touchEvents = AlloyEvents.derive([
      AlloyEvents.run(NativeEvents.touchstart(), moveTo),
      AlloyEvents.run(NativeEvents.touchmove(), moveTo)
    ]);

    const mouseEvents = AlloyEvents.derive([
      AlloyEvents.run(NativeEvents.mousedown(), moveTo),
      AlloyEvents.run(NativeEvents.mousemove(), function (spectrum, se) {
        if (detail.mouseIsDown().get()) { moveTo(spectrum, se); }
      })
    ]);

    return {
      behaviours: Behaviour.derive(isTouch ? [ ] : [
        // Move left and right along the spectrum
        Keying.config({
          mode: 'special',
          onLeft (spectrum) {
            SliderActions.moveLeft(spectrum, detail);
            return Option.some(true);
          },
          onRight (spectrum) {
            SliderActions.moveRight(spectrum, detail);
            return Option.some(true);
          }
        }),
        Focusing.config({ })
      ]),

      events: isTouch ? touchEvents : mouseEvents
    };
  }
});

export default <any> [
  ledgePart,
  redgePart,
  thumbPart,
  spectrumPart
];