import { Arr, Fun, Merger, Option } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';

import * as Behaviour from '../../api/behaviour/Behaviour';
import { Keying } from '../../api/behaviour/Keying';
import { Representing } from '../../api/behaviour/Representing';
import * as SketchBehaviours from '../../api/component/SketchBehaviours';
import * as AlloyEvents from '../../api/events/AlloyEvents';
import * as NativeEvents from '../../api/events/NativeEvents';
import * as AlloyParts from '../../parts/AlloyParts';
import * as EdgeActions from './EdgeActions';
import * as ModelCommon from './ModelCommon';

import { CustomEvent } from '../../events/SimulatedEvent';
import { CompositeSketchFactory } from '../../api/ui/UiSketcher';
import { SliderDetail, SliderSpec, SliderValue } from '../../ui/types/SliderTypes';
import { AlloyComponent } from '../../api/component/ComponentApi';

const isTouch = PlatformDetection.detect().deviceType.isTouch();

const sketch: CompositeSketchFactory<SliderDetail, SliderSpec> = (detail, components, spec, externals) => {
  const getThumb = (component: AlloyComponent): AlloyComponent => AlloyParts.getPartOrDie(component, detail, 'thumb');
  const getSpectrum = (component: AlloyComponent): AlloyComponent => AlloyParts.getPartOrDie(component, detail, 'spectrum');
  const getLeftEdge = (component: AlloyComponent): Option<AlloyComponent> => AlloyParts.getPart(component, detail, 'left-edge');
  const getRightEdge = (component: AlloyComponent): Option<AlloyComponent> => AlloyParts.getPart(component, detail, 'right-edge');
  const getTopEdge = (component: AlloyComponent): Option<AlloyComponent> => AlloyParts.getPart(component, detail, 'top-edge');
  const getBottomEdge = (component: AlloyComponent): Option<AlloyComponent> => AlloyParts.getPart(component, detail, 'bottom-edge');

  const modelDetail = detail.model();
  const model = modelDetail.manager();

  const refresh = (slider: AlloyComponent, thumb: AlloyComponent): void => {
    model.setPositionFromValue(slider, thumb, detail, {
      getLeftEdge,
      getRightEdge,
      getTopEdge,
      getBottomEdge,
      getSpectrum
    });
  };

  const changeValue = (slider: AlloyComponent, newValue): Option<boolean> => {
    modelDetail.value().set(newValue);
    
    const thumb = getThumb(slider);
    refresh(slider, thumb);
    detail.onChange()(slider, thumb, newValue);
    return Option.some(true);
  };

  const uiEventsArr = isTouch ? [
    AlloyEvents.run(NativeEvents.touchstart(), (slider, _simulatedEvent) => {
      detail.onDragStart()(slider, getThumb(slider));
    }),
    AlloyEvents.run(NativeEvents.touchend(), (slider, _simulatedEvent) => {
      detail.onDragEnd()(slider, getThumb(slider));
    })
  ] : [
    AlloyEvents.run(NativeEvents.mousedown(), (slider, simulatedEvent) => {
      simulatedEvent.stop();
      detail.onDragStart()(slider, getThumb(slider));
      detail.mouseIsDown().set(true);
    }),
    AlloyEvents.run(NativeEvents.mouseup(), (slider, simulatedEvent) => {
      detail.onDragEnd()(slider, getThumb(slider));
      detail.mouseIsDown().set(false);
    })
  ];

  return {
    uid: detail.uid(),
    dom: detail.dom(),
    components,

    behaviours: Merger.deepMerge(
      Behaviour.derive(
        Arr.flatten<any>([
          !isTouch ? [
            Keying.config({
              mode: 'special',
              focusIn (slider) {
                return AlloyParts.getPart(slider, detail, 'spectrum').map(Keying.focusIn).map(Fun.constant(true));
              }
            })
          ] : [],
          [
            Representing.config({
              store: {
                mode: 'manual',
                getValue (_) {
                  return detail.model().value().get();
                }
              }
            })
          ]
        ])
      ),
      SketchBehaviours.get(detail.sliderBehaviours())
    ),

    events: AlloyEvents.derive(
      [
        AlloyEvents.run<CustomEvent>(ModelCommon.sliderChangeEvent(), function (slider, simulatedEvent) {
          changeValue(slider, simulatedEvent.event().value());
        }),
        AlloyEvents.runOnAttached((slider, simulatedEvent) => {
          // Set the initial value
          const getInitial = modelDetail.getInitialValue();
          modelDetail.value().set(getInitial());
          const thumb = getThumb(slider);

          refresh(slider, thumb);
          
          const spectrum = getSpectrum(slider);
          // Call onInit instead of onChange for the first value.
          detail.onInit()(slider, thumb, spectrum, modelDetail.value().get());
        })
      ].concat(uiEventsArr)
    ),

    apis: {
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