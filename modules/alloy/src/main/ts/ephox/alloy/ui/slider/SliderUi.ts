import { DragEvent } from '@ephox/dom-globals';
import { Fun, Option } from '@ephox/katamari';

import { Keying } from '../../api/behaviour/Keying';
import { Receiving } from '../../api/behaviour/Receiving';
import { Representing } from '../../api/behaviour/Representing';
import { AlloyComponent } from '../../api/component/ComponentApi';
import * as SketchBehaviours from '../../api/component/SketchBehaviours';
import { AlloySpec } from '../../api/component/SpecTypes';
import * as AlloyEvents from '../../api/events/AlloyEvents';
import * as NativeEvents from '../../api/events/NativeEvents';
import * as Channels from '../../api/messages/Channels';
import { CompositeSketchFactory } from '../../api/ui/UiSketcher';
import { CustomEvent, EventFormat, NativeSimulatedEvent } from '../../events/SimulatedEvent';
import * as AlloyParts from '../../parts/AlloyParts';
import { SliderDetail, SliderSpec, SliderValue } from '../types/SliderTypes';
import * as ModelCommon from './ModelCommon';

const sketch: CompositeSketchFactory<SliderDetail, SliderSpec> = (detail: SliderDetail, components: AlloySpec[], _spec: SliderSpec, _externals) => {
  const getThumb = (component: AlloyComponent): AlloyComponent => AlloyParts.getPartOrDie(component, detail, 'thumb');
  const getSpectrum = (component: AlloyComponent): AlloyComponent => AlloyParts.getPartOrDie(component, detail, 'spectrum');
  const getLeftEdge = (component: AlloyComponent): Option<AlloyComponent> => AlloyParts.getPart(component, detail, 'left-edge');
  const getRightEdge = (component: AlloyComponent): Option<AlloyComponent> => AlloyParts.getPart(component, detail, 'right-edge');
  const getTopEdge = (component: AlloyComponent): Option<AlloyComponent> => AlloyParts.getPart(component, detail, 'top-edge');
  const getBottomEdge = (component: AlloyComponent): Option<AlloyComponent> => AlloyParts.getPart(component, detail, 'bottom-edge');

  const modelDetail = detail.model;
  const model = modelDetail.manager;

  const refresh = (slider: AlloyComponent, thumb: AlloyComponent): void => {
    model.setPositionFromValue(slider, thumb, detail, {
      getLeftEdge,
      getRightEdge,
      getTopEdge,
      getBottomEdge,
      getSpectrum
    });
  };

  const changeValue = (slider: AlloyComponent, newValue: SliderValue): Option<boolean> => {
    modelDetail.value.set(newValue);

    const thumb = getThumb(slider);
    refresh(slider, thumb);
    detail.onChange(slider, thumb, newValue);
    return Option.some<boolean>(true);
  };

  const resetToMin = (slider: AlloyComponent) => {
    model.setToMin(slider, detail);
  };

  const resetToMax = (slider: AlloyComponent) => {
    model.setToMax(slider, detail);
  };

  const choose = (slider: AlloyComponent) => {
    const fireOnChoose = () => {
      AlloyParts.getPart(slider, detail, 'thumb').each((thumb) => {
        const value = modelDetail.value.get();
        detail.onChoose(slider, thumb, value);
      });
    };

    const wasDown = detail.mouseIsDown.get();
    detail.mouseIsDown.set(false);

    // We don't want this to fire if the mouse wasn't pressed down over anything other than the slider.
    if (wasDown) {
      fireOnChoose();
    }
  };

  const onDragStart = (slider: AlloyComponent, simulatedEvent: NativeSimulatedEvent<DragEvent>) => {
    simulatedEvent.stop();
    detail.mouseIsDown.set(true);
    detail.onDragStart(slider, getThumb(slider));
  };

  const onDragEnd = (slider: AlloyComponent, simulatedEvent: NativeSimulatedEvent<DragEvent>) => {
    simulatedEvent.stop();
    detail.onDragEnd(slider, getThumb(slider));
    choose(slider);
  };

  return {
    uid: detail.uid,
    dom: detail.dom,
    components,

    behaviours: SketchBehaviours.augment(
      detail.sliderBehaviours,
      [
        Keying.config({
          mode: 'special',
          focusIn (slider) {
            return AlloyParts.getPart(slider, detail, 'spectrum').map(Keying.focusIn).map(Fun.constant(true));
          }
        }),
        Representing.config({
          store: {
            mode: 'manual',
            getValue (_) {
              return modelDetail.value.get();
            }
          }
        }),

        Receiving.config({
          channels: {
            [Channels.mouseReleased()]: {
              onReceive: choose
            }
          }
        })
      ]
    ),

    events: AlloyEvents.derive([
      AlloyEvents.run<CustomEvent>(ModelCommon.sliderChangeEvent(), (slider, simulatedEvent) => {
        changeValue(slider, simulatedEvent.event().value());
      }) as AlloyEvents.AlloyEventKeyAndHandler<EventFormat>,
      AlloyEvents.runOnAttached((slider, simulatedEvent) => {
        // Set the initial value
        const getInitial = modelDetail.getInitialValue();
        modelDetail.value.set(getInitial);
        const thumb = getThumb(slider);

        refresh(slider, thumb);

        const spectrum = getSpectrum(slider);
        // Call onInit instead of onChange for the first value.
        detail.onInit(slider, thumb, spectrum, modelDetail.value.get());
      }),
      AlloyEvents.run(NativeEvents.touchstart(), onDragStart),
      AlloyEvents.run(NativeEvents.touchend(), onDragEnd),
      AlloyEvents.run(NativeEvents.mousedown(), onDragStart),
      AlloyEvents.run(NativeEvents.mouseup(), onDragEnd)
    ]),

    apis: {
      resetToMin,
      resetToMax,
      changeValue,
      refresh
    },

    domModification: {
      styles: {
        position: 'relative'
      }
    }
  };
};

export {
  sketch
};
