import { Arr, Fun, Merger, Option } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { Css, Width, Height } from '@ephox/sugar';

import * as Behaviour from '../../api/behaviour/Behaviour';
import { Keying } from '../../api/behaviour/Keying';
import { Representing } from '../../api/behaviour/Representing';
import * as SketchBehaviours from '../../api/component/SketchBehaviours';
import * as AlloyEvents from '../../api/events/AlloyEvents';
import * as NativeEvents from '../../api/events/NativeEvents';
import * as AlloyParts from '../../parts/AlloyParts';
import * as SliderActions from './SliderActions';
import * as SliderValues from './SliderValues';

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

  const setXPos = (slider: AlloyComponent, thumb: AlloyComponent): void => {
    const pos = SliderValues.findXPos(slider, getSpectrum(slider), getLeftEdge(slider), getRightEdge(slider), detail);
    const thumbRadius = Width.get(thumb.element()) / 2;
    Css.set(thumb.element(), 'left', (pos - thumbRadius) + 'px');
  };

  const setYPos = (slider: AlloyComponent, thumb: AlloyComponent): void => {
    const pos = SliderValues.findYPos(slider, getSpectrum(slider), getTopEdge(slider), getBottomEdge(slider), detail);
    const thumbRadius = Height.get(thumb.element()) / 2;
    Css.set(thumb.element(), 'top', (pos - thumbRadius) + 'px');
  };

  const setXYPos = (slider: AlloyComponent, thumb: AlloyComponent): void => {
    setXPos(slider, thumb);
    setYPos(slider, thumb);
  };

  const refresh = (slider: AlloyComponent): void => {
    const thumb = getThumb(slider);

    if (detail.isTwoD()) {
      setXYPos(slider, thumb);
    } else if (detail.isHorizontal()) {
      setXPos(slider, thumb);
    } else if (detail.isVertical()) {
      setYPos(slider, thumb);
    }
  };

  const setValue = (x: number, y: number): void => {
    detail.value().set({
      x: Fun.constant(x),
      y: Fun.constant(y)
    });
  };

  const changeValue = (slider: AlloyComponent, newValue: SliderValue): Option<boolean> => {
    const oldValue = detail.value().get();
    
    if (detail.isTwoD()) {
      setValue(newValue.x(), newValue.y());
    } else if (detail.isHorizontal()) {
      setValue(newValue.x(), oldValue.y());
    } else if (detail.isVertical()) {
      setValue(oldValue.x(), newValue.y());
    } 
    
    if (detail.isHorizontal || detail.isVertical) {
      refresh(slider);
      const thumb = getThumb(slider);
      detail.onChange()(slider, thumb, newValue);
      return Option.some(true);
    } else {
      return Option.none();
    }
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
                  return detail.value().get();
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
        AlloyEvents.run<CustomEvent>(SliderActions.sliderChangeEvent(), function (slider, simulatedEvent) {
          changeValue(slider, simulatedEvent.event().value());
        }),
        AlloyEvents.runOnAttached((slider, simulatedEvent) => {
          // Set the initial value
          detail.value().set(detail.getInitialValue()());
          refresh(slider);

          const thumb = getThumb(slider);
          const spectrum = getSpectrum(slider);
          // Call onInit instead of onChange for the first value.
          detail.onInit()(slider, thumb, spectrum, detail.value().get());
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