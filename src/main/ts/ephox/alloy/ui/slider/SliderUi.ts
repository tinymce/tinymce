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
import * as GradientActions from '../common/GradientActions';

import { EventFormat, CustomEvent } from '../../events/SimulatedEvent';
import { CompositeSketchFactory } from '../../api/ui/UiSketcher';
import { SliderDetail, SliderSpec } from '../../ui/types/SliderTypes';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { ClientRect } from '@ephox/dom-globals';

const isTouch = PlatformDetection.detect().deviceType.isTouch();

const sketch: CompositeSketchFactory<SliderDetail, SliderSpec> = (detail, components, spec, externals) => {
  const range = detail.max() - detail.min();

  const getXCentre = (component: AlloyComponent): number => {
    const rect = component.element().dom().getBoundingClientRect();
    return (rect.left + rect.right) / 2;
  };

  const getYCentre = (component: AlloyComponent): number => {
    const rect = component.element().dom().getBoundingClientRect();
    return (rect.top + rect.bottom) / 2;
  };

  const getThumb = (component: AlloyComponent): AlloyComponent => {
    return AlloyParts.getPartOrDie(component, detail, 'thumb');
  };

  const getOffset = (slider: AlloyComponent, spectrumBounds: ClientRect, detail: SliderDetail, getCentre: (edgePart: AlloyComponent) => number, edgeProperty: string, lengthProperty:string): number => {
    const v = detail.value().get();
    if (v < detail.min()) {
      return AlloyParts.getPart(slider, detail, 'left-edge').fold(() => {
        return 0;
      }, function (ledge) {
        return getCentre(ledge) - spectrumBounds[edgeProperty];
      });
    } else if (v > detail.max()) {
      // position at right edge
      return AlloyParts.getPart(slider, detail, 'right-edge').fold(function () {
        return spectrumBounds[lengthProperty];
      }, function (redge) {
        return getCentre(redge) - spectrumBounds[edgeProperty];
      });
    } else {
      // position along the slider
      return (detail.value().get() - detail.min()) / range * spectrumBounds[lengthProperty];
    }
  };

  const getXOffset = (slider: AlloyComponent, spectrumBounds: ClientRect, detail: SliderDetail): number => {
    return getOffset(slider, spectrumBounds, detail, getXCentre, 'left', 'width');
  }

  const getYOffset = (slider: AlloyComponent, spectrumBounds: ClientRect, detail: SliderDetail): number => {
    return getOffset(slider, spectrumBounds, detail, getYCentre, 'top', 'height');
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
  }

  const getYPos = (slider: AlloyComponent): number => {
    return getPos(slider, getYOffset, 'top');
  };

  const refresh = (component: AlloyComponent): void => {
    const thumb = getThumb(component);
    if (detail.orientation() === 'vertical') {
      const pos = getYPos(component);
      const thumbRadius = Height.get(thumb.element()) / 2;
      Css.set(thumb.element(), 'top', (pos - thumbRadius) + 'px');
    } else {
      const pos = getXPos(component);
      const thumbRadius = Width.get(thumb.element()) / 2;
      Css.set(thumb.element(), 'left', (pos - thumbRadius) + 'px');
    }
  };

  const changeValue = (component: AlloyComponent, newValue: number): Option<boolean> => {
    const oldValue = detail.value().get();
    const thumb = getThumb(component);
    const edgeProp = (detail.orientation() === 'vertical') ? 'top' : 'left';
    // The left check is used so that the first click calls refresh
    if (oldValue !== newValue || Css.getRaw(thumb.element(), edgeProp).isNone()) {
      detail.value().set(newValue);
      refresh(component);
      detail.onChange()(component, thumb, newValue);
      return Option.some(true);
    } else {
      return Option.none();
    }
  };

  const resetToMin = (slider: AlloyComponent): void => {
    changeValue(slider, detail.min());
  };

  const resetToMax = (slider: AlloyComponent): void => {
    changeValue(slider, detail.max());
  };

  const uiEventsArr = isTouch ? [
    AlloyEvents.run(NativeEvents.touchstart(), (slider, simulatedEvent) => {
      detail.onDragStart()(slider, getThumb(slider));
    }),
    AlloyEvents.run(NativeEvents.touchend(), (slider, simulatedEvent) => {
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
        AlloyEvents.run<CustomEvent>(GradientActions.sliderChangeEvent(), function (slider, simulatedEvent) {
          changeValue(slider, simulatedEvent.event().value());
        }),
        AlloyEvents.runOnAttached((slider, simulatedEvent) => {
          detail.value().set(detail.getInitialValue()());
          const thumb = getThumb(slider);
          // Call onInit instead of onChange for the first value.
          refresh(slider);
          detail.onInit()(slider, thumb, detail.value().get());
        })
      ].concat(uiEventsArr)
    ),

    apis: {
      resetToMin,
      resetToMax,
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