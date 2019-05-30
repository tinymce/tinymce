import { FieldSchema } from '@ephox/boulder';
import { Cell, Fun} from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';

import { SugarEvent, SugarPosition } from '../../alien/TypeDefinitions';
import * as Behaviour from '../../api/behaviour/Behaviour';
import { Focusing } from '../../api/behaviour/Focusing';
import { Keying } from '../../api/behaviour/Keying';
import * as AlloyEvents from '../../api/events/AlloyEvents';
import * as NativeEvents from '../../api/events/NativeEvents';
import * as PartType from '../../parts/PartType';
import { SliderDetail } from '../../ui/types/SliderTypes';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { NativeSimulatedEvent } from '../../events/SimulatedEvent';

const platform = PlatformDetection.detect();
const isTouch = platform.deviceType.isTouch();

const labelPart = PartType.optional({
  schema: [ FieldSchema.strict('dom') ],
  name: 'label'
});

const edgePart = (name: string): PartType.PartTypeAdt => {
  return PartType.optional({
    name: '' + name + '-edge',
    overrides(detail: SliderDetail) {
      const action = detail.model.manager.edgeActions[name];
      // Not all edges have actions for all sliders.
      // A horizontal slider will only have left and right, for instance,
      // ignoring top, bottom and diagonal edges as they don't make sense in context of those sliders.
      return action.fold(() => {
        return {};
      },
        (a) => {
          const touchEvents = AlloyEvents.derive([
            AlloyEvents.runActionExtra(NativeEvents.touchstart(), a, [detail])
          ]);

          const mouseEvents = AlloyEvents.derive([
            AlloyEvents.runActionExtra(NativeEvents.mousedown(), a, [detail]),
            AlloyEvents.runActionExtra(NativeEvents.mousemove(), (l, det: SliderDetail) => {
              if (det.mouseIsDown.get()) { a(l, det); }
            }, [detail])
          ]);

          return {
            events: isTouch ? touchEvents : mouseEvents
          };
        }
      );
    }
  });
};

// When the user touches the top left edge, it should move the thumb
const tlEdgePart = edgePart('top-left');

// When the user touches the top edge, it should move the thumb
const tedgePart = edgePart('top');

// When the user touches the top right edge, it should move the thumb
const trEdgePart = edgePart('top-right');

// When the user touches the right edge, it should move the thumb
const redgePart = edgePart('right');

// When the user touches the bottom right edge, it should move the thumb
const brEdgePart = edgePart('bottom-right');

// When the user touches the bottom edge, it should move the thumb
const bedgePart = edgePart('bottom');

// When the user touches the bottom left edge, it should move the thumb
const blEdgePart = edgePart('bottom-left');

// When the user touches the left edge, it should move the thumb
const ledgePart = edgePart('left');

// The thumb part needs to have position absolute to be positioned correctly
const thumbPart = PartType.required({
  name: 'thumb',
  defaults: Fun.constant({
    dom: {
      styles: { position: 'absolute' }
    }
  }),
  overrides(detail: SliderDetail) {
    return {
      events: AlloyEvents.derive([
        // If the user touches the thumb itself, pretend they touched the spectrum instead. This
        // allows sliding even when they touchstart the current value
        AlloyEvents.redirectToPart(NativeEvents.touchstart(), detail, 'spectrum'),
        AlloyEvents.redirectToPart(NativeEvents.touchmove(), detail, 'spectrum'),
        AlloyEvents.redirectToPart(NativeEvents.touchend(), detail, 'spectrum'),

        AlloyEvents.redirectToPart(NativeEvents.mousedown(), detail, 'spectrum'),
        AlloyEvents.redirectToPart(NativeEvents.mousemove(), detail, 'spectrum'),
        AlloyEvents.redirectToPart(NativeEvents.mouseup(), detail, 'spectrum')
      ])
    };
  }
});

const spectrumPart = PartType.required({
  schema: [
    FieldSchema.state('mouseIsDown', () => Cell(false))
  ],
  name: 'spectrum',
  overrides(detail: SliderDetail) {
    const modelDetail = detail.model;
    const model = modelDetail.manager;

    const setValueFrom = (component: AlloyComponent, simulatedEvent: NativeSimulatedEvent) => {
      return model.getValueFromEvent(simulatedEvent).map((value: number | SugarPosition) => {
        return model.setValueFrom(component, detail, value);
      });
    };

    const touchEvents = AlloyEvents.derive([
      AlloyEvents.run(NativeEvents.touchstart(), setValueFrom),
      AlloyEvents.run(NativeEvents.touchmove(), setValueFrom)
    ]);

    const mouseEvents = AlloyEvents.derive([
      AlloyEvents.run(NativeEvents.mousedown(), setValueFrom),
      AlloyEvents.run<SugarEvent>(NativeEvents.mousemove(), (spectrum, se) => {
        if (detail.mouseIsDown.get()) { setValueFrom(spectrum, se); }
      })
    ]);

    return {
      behaviours: Behaviour.derive(isTouch ? [] : [
        // Move left and right along the spectrum
        Keying.config(
          {
            mode: 'special',
            onLeft: (spectrum) => {
              return model.onLeft(spectrum, detail);
            },
            onRight: (spectrum) => {
              return model.onRight(spectrum, detail);
            },
            onUp: (spectrum) => {
              return model.onUp(spectrum, detail);
            },
            onDown: (spectrum) => {
              return model.onDown(spectrum, detail);
            }
          }
        ),
        Focusing.config({})
      ]),

      events: isTouch ? touchEvents : mouseEvents
    };
  }
});

export default [
  labelPart,
  ledgePart,
  redgePart,
  tedgePart,
  bedgePart,
  tlEdgePart,
  trEdgePart,
  blEdgePart,
  brEdgePart,
  thumbPart,
  spectrumPart
] as PartType.PartTypeAdt[];