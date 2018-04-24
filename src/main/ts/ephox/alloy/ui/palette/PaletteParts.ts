import { FieldSchema } from '@ephox/boulder';
import { Cell, Fun, Option } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';

import * as Behaviour from '../../api/behaviour/Behaviour';
import { Focusing } from '../../api/behaviour/Focusing';
import { Keying } from '../../api/behaviour/Keying';
import * as AlloyEvents from '../../api/events/AlloyEvents';
import * as NativeEvents from '../../api/events/NativeEvents';
import * as PartType from '../../parts/PartType';
import * as PaletteActions from './PaletteActions';

const platform = PlatformDetection.detect();
const isTouch = platform.deviceType.isTouch();

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

const palettePart = PartType.required({
  schema: [
    FieldSchema.state('mouseIsDown', function () { return Cell(false); })
  ],
  name: 'palette',
  overrides (detail) {
    const moveTo = function (spectrum, simulatedEvent) {
      const spectrumBounds = spectrum.element().dom().getBoundingClientRect();
      PaletteActions.setXFromEvent(spectrum, detail, spectrumBounds, simulatedEvent);
    };

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
            PaletteActions.moveLeft(spectrum, detail);
            return Option.some(true);
          },
          onRight (spectrum) {
            PaletteActions.moveRight(spectrum, detail);
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
  thumbPart,
  palettePart
];