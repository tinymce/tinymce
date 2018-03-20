import { Arr, Fun, Merger, Option } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { Css, Width } from '@ephox/sugar';

import * as Behaviour from '../../api/behaviour/Behaviour';
import { Keying } from '../../api/behaviour/Keying';
import { Representing } from '../../api/behaviour/Representing';
import * as SketchBehaviours from '../../api/component/SketchBehaviours';
import * as AlloyEvents from '../../api/events/AlloyEvents';
import * as NativeEvents from '../../api/events/NativeEvents';
import * as AlloyParts from '../../parts/AlloyParts';
import * as SliderActions from './SliderActions';

const isTouch = PlatformDetection.detect().deviceType.isTouch();

const sketch = function (detail, components, spec, externals) {
  const range = detail.max() - detail.min();

  const getXCentre = function (component) {
    const rect = component.element().dom().getBoundingClientRect();
    return (rect.left + rect.right) / 2;
  };

  const getThumb = function (component) {
    return AlloyParts.getPartOrDie(component, detail, 'thumb');
  };

  const getXOffset = function (slider, spectrumBounds, detail) {
    const v = detail.value().get();
    if (v < detail.min()) {
      return AlloyParts.getPart(slider, detail, 'left-edge').fold(function () {
        return 0;
      }, function (ledge) {
        return getXCentre(ledge) - spectrumBounds.left;
      });
    } else if (v > detail.max()) {
      // position at right edge
      return AlloyParts.getPart(slider, detail, 'right-edge').fold(function () {
        return spectrumBounds.width;
      }, function (redge) {
        return getXCentre(redge) - spectrumBounds.left;
      });
    } else {
      // position along the slider
      return (detail.value().get() - detail.min()) / range * spectrumBounds.width;
    }
  };

  const getXPos = function (slider) {
    const spectrum = AlloyParts.getPartOrDie(slider, detail, 'spectrum');
    const spectrumBounds = spectrum.element().dom().getBoundingClientRect();
    const sliderBounds = slider.element().dom().getBoundingClientRect();

    const xOffset = getXOffset(slider, spectrumBounds, detail);
    return (spectrumBounds.left - sliderBounds.left) + xOffset;
  };

  const refresh = function (component) {
    const pos = getXPos(component);
    const thumb = getThumb(component);
    const thumbRadius = Width.get(thumb.element()) / 2;
    Css.set(thumb.element(), 'left', (pos - thumbRadius) + 'px');
  };

  const changeValue = function (component, newValue) {
    const oldValue = detail.value().get();
    const thumb = getThumb(component);
    // The left check is used so that the first click calls refresh
    if (oldValue !== newValue || Css.getRaw(thumb.element(), 'left').isNone()) {
      detail.value().set(newValue);
      refresh(component);
      detail.onChange()(component, thumb, newValue);
      return Option.some(true);
    } else {
      return Option.none();
    }
  };

  const resetToMin = function (slider) {
    changeValue(slider, detail.min());
  };

  const resetToMax = function (slider) {
    changeValue(slider, detail.max());
  };

  const uiEventsArr = isTouch ? [
    AlloyEvents.run(NativeEvents.touchstart(), function (slider, simulatedEvent) {
      detail.onDragStart()(slider, getThumb(slider));
    }),
    AlloyEvents.run(NativeEvents.touchend(), function (slider, simulatedEvent) {
      detail.onDragEnd()(slider, getThumb(slider));
    })
  ] : [
    AlloyEvents.run(NativeEvents.mousedown(), function (slider, simulatedEvent) {
      simulatedEvent.stop();
      detail.onDragStart()(slider, getThumb(slider));
      detail.mouseIsDown().set(true);
    }),
    AlloyEvents.run(NativeEvents.mouseup(), function (slider, simulatedEvent) {
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
        Arr.flatten([
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
        AlloyEvents.run(SliderActions.changeEvent(), function (slider, simulatedEvent) {
          changeValue(slider, simulatedEvent.event().value());
        }),
        AlloyEvents.runOnAttached(function (slider, simulatedEvent) {
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