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
import * as SliderModel from './SliderModel';

import { EventFormat, CustomEvent } from '../../events/SimulatedEvent';
import { CompositeSketchFactory } from '../../api/ui/UiSketcher';
import { SliderDetail, SliderSpec, SliderValue } from '../../ui/types/SliderTypes';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { ClientRect } from '@ephox/dom-globals';
import { Slider } from 'ephox/alloy/api/Main';

import { * } from './SliderValues';

const isTouch = PlatformDetection.detect().deviceType.isTouch();

const sketch: CompositeSketchFactory<SliderDetail, SliderSpec> = (detail, components, spec, externals) => {
  const getThumb = (component: AlloyComponent): AlloyComponent => {
    return AlloyParts.getPartOrDie(component, detail, 'thumb');
  };
  const getSpectrum = (component: AlloyComponent): AlloyComponent => {
    return AlloyParts.getPartOrDie(component, detail, 'spectrum');
  };

  const getXOffset = (slider: AlloyComponent, spectrumBounds: ClientRect, detail: SliderDetail): number => {
    return SliderModel.findOffsetOfValue(spectrumBounds, minX, detail.maxX(), detail.value().get().x(), SliderModel.centerX, AlloyParts.getPart(slider, detail, 'left-edge'), AlloyParts.getPart(slider, detail, 'right-edge'), 'left', 'width');
  }

  const getYOffset = (slider: AlloyComponent, spectrumBounds: ClientRect, detail: SliderDetail): number => {
    return SliderModel.findOffsetOfValue(spectrumBounds, detail.minY(), detail.maxY(), detail.value().get().y(), SliderModel.centerY, AlloyParts.getPart(slider, detail, 'top-edge'), AlloyParts.getPart(slider, detail, 'bottom-edge'), 'top', 'height');
  };

  const getPos = (slider: AlloyComponent, getOffset: (slider: AlloyComponent, spectrumBounds: ClientRect, detail: SliderDetail) => number, edgeProperty: string): number => {
    const spectrum = AlloyParts.getPartOrDie(slider, detail, 'spectrum');
    const spectrumBounds = spectrum.element().dom().getBoundingClientRect();
    const sliderBounds = slider.element().dom().getBoundingClientRect();

    const offset = getOffset(slider, spectrumBounds, detail);
    return (spectrumBounds[edgeProperty] - sliderBounds[edgeProperty]) + offset;
  };

  const getXPos = (slider: AlloyComponent): number => {
    return getPos(slider, getXOffset, 'left');
  };

  const setXPos = (slider: AlloyComponent, thumb: AlloyComponent): void => {
    const pos = getXPos(slider);
    const thumbRadius = Width.get(thumb.element()) / 2;
    Css.set(thumb.element(), 'left', (pos - thumbRadius) + 'px');
  };

  const getYPos = (slider: AlloyComponent): number => {
    return getPos(slider, getYOffset, 'top');
  };

  const setYPos = (slider: AlloyComponent, thumb: AlloyComponent): void => {
    const pos = getYPos(slider);
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
      refresh(slider)
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