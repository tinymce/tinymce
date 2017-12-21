import Behaviour from '../../api/behaviour/Behaviour';
import Keying from '../../api/behaviour/Keying';
import Representing from '../../api/behaviour/Representing';
import SketchBehaviours from '../../api/component/SketchBehaviours';
import AlloyEvents from '../../api/events/AlloyEvents';
import NativeEvents from '../../api/events/NativeEvents';
import AlloyParts from '../../parts/AlloyParts';
import SliderActions from './SliderActions';
import { Arr } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import { Merger } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { Css } from '@ephox/sugar';
import { Width } from '@ephox/sugar';

var isTouch = PlatformDetection.detect().deviceType.isTouch();

var sketch = function (detail, components, spec, externals) {
  var range = detail.max() - detail.min();

  var getXCentre = function (component) {
    var rect = component.element().dom().getBoundingClientRect();
    return (rect.left + rect.right) / 2;
  };

  var getThumb = function (component) {
    return AlloyParts.getPartOrDie(component, detail, 'thumb');
  };

  var getXOffset = function (slider, spectrumBounds, detail) {
    var v = detail.value().get();
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

  var getXPos = function (slider) {
    var spectrum = AlloyParts.getPartOrDie(slider, detail, 'spectrum');
    var spectrumBounds = spectrum.element().dom().getBoundingClientRect();
    var sliderBounds = slider.element().dom().getBoundingClientRect();

    var xOffset = getXOffset(slider, spectrumBounds, detail);
    return (spectrumBounds.left - sliderBounds.left) + xOffset;
  };

  var refresh = function (component) {
    var pos = getXPos(component);
    var thumb = getThumb(component);
    var thumbRadius = Width.get(thumb.element()) / 2;
    Css.set(thumb.element(), 'left', (pos - thumbRadius) + 'px');
  };

  var changeValue = function (component, newValue) {
    var oldValue = detail.value().get();
    var thumb = getThumb(component);
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

  var resetToMin = function (slider) {
    changeValue(slider, detail.min());
  };

  var resetToMax = function (slider) {
    changeValue(slider, detail.max());
  };

  var uiEventsArr = isTouch ? [
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
    components: components,

    behaviours: Merger.deepMerge(
      Behaviour.derive(
        Arr.flatten([
          !isTouch ? [
            Keying.config({
              mode: 'special',
              focusIn: function (slider) {
                return AlloyParts.getPart(slider, detail, 'spectrum').map(Keying.focusIn).map(Fun.constant(true));
              }
            })
          ] : [],
          [
            Representing.config({
              store: {
                mode: 'manual',
                getValue: function (_) {
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
          var thumb = getThumb(slider);
          // Call onInit instead of onChange for the first value.
          refresh(slider);
          detail.onInit()(slider, thumb, detail.value().get());
        })
      ].concat(uiEventsArr)
    ),

    apis: {
      resetToMin: resetToMin,
      resetToMax: resetToMax,
      refresh: refresh
    },

    domModification: {
      styles: {
        position: 'relative'
      }
    }
  };
};

export default <any> {
  sketch: sketch
};