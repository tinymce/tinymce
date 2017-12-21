import Behaviour from '../../api/behaviour/Behaviour';
import Focusing from '../../api/behaviour/Focusing';
import Keying from '../../api/behaviour/Keying';
import AlloyEvents from '../../api/events/AlloyEvents';
import NativeEvents from '../../api/events/NativeEvents';
import PartType from '../../parts/PartType';
import SliderActions from './SliderActions';
import { FieldSchema } from '@ephox/boulder';
import { Cell } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';

var platform = PlatformDetection.detect();
var isTouch = platform.deviceType.isTouch();

var edgePart = function (name, action) {
  return PartType.optional({
    name: '' + name + '-edge',
    overrides: function (detail) {
      var touchEvents = AlloyEvents.derive([
        AlloyEvents.runActionExtra(NativeEvents.touchstart(), action, [ detail ])
      ]);

      var mouseEvents = AlloyEvents.derive([
        AlloyEvents.runActionExtra(NativeEvents.mousedown(), action, [ detail ]),
        AlloyEvents.runActionExtra(NativeEvents.mousemove(), function (l, det) {
          if (det.mouseIsDown().get()) action (l, det);
        }, [ detail ])
      ]);

      return {
        events: isTouch ? touchEvents : mouseEvents
      };
    }
  });
};

// When the user touches the left edge, it should move the thumb
var ledgePart = edgePart('left', SliderActions.setToLedge);

// When the user touches the right edge, it should move the thumb
var redgePart = edgePart('right', SliderActions.setToRedge);

// The thumb part needs to have position absolute to be positioned correctly
var thumbPart = PartType.required({
  name: 'thumb',
  defaults: Fun.constant({
    dom: {
      styles: { position: 'absolute' }
    }
  }),
  overrides: function (detail) {
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

var spectrumPart = PartType.required({
  schema: [
    FieldSchema.state('mouseIsDown', function () { return Cell(false); })
  ],
  name: 'spectrum',
  overrides: function (detail) {

    var moveToX = function (spectrum, simulatedEvent) {
      var spectrumBounds = spectrum.element().dom().getBoundingClientRect();
      SliderActions.setXFromEvent(spectrum, detail, spectrumBounds, simulatedEvent);
    };

    var touchEvents = AlloyEvents.derive([
      AlloyEvents.run(NativeEvents.touchstart(), moveToX),
      AlloyEvents.run(NativeEvents.touchmove(), moveToX)
    ]);

    var mouseEvents = AlloyEvents.derive([
      AlloyEvents.run(NativeEvents.mousedown(), moveToX),
      AlloyEvents.run(NativeEvents.mousemove(), function (spectrum, se) {
        if (detail.mouseIsDown().get()) moveToX(spectrum, se);
      })
    ]);


    return {
      behaviours: Behaviour.derive(isTouch ? [ ] : [
        // Move left and right along the spectrum
        Keying.config({
          mode: 'special',
          onLeft: function (spectrum) {
            SliderActions.moveLeft(spectrum, detail);
            return Option.some(true);
          },
          onRight: function (spectrum) {
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