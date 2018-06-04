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

const isTouch = PlatformDetection.detect().deviceType.isTouch();

const sketch = function (detail, components, spec, externals) {
  const getXCentre = function (component) {
    const rect = component.element().dom().getBoundingClientRect();
    return (rect.left + rect.right) / 2;
  };

  const getYCentre = function (component) {
    const rect = component.element().dom().getBoundingClientRect();
    return (rect.top + rect.bottom) / 2;
  };

  const getThumb = function (component) {
    return AlloyParts.getPartOrDie(component, detail, 'thumb');
  };

  const getPalette = function (component) {
    return AlloyParts.getPartOrDie(component, detail, 'palette');
  };

  const getXOffset = function (slider, spectrumBounds, detail) {
    return (detail.value().get().x - 0) / 100 * spectrumBounds.width;
  }

  const getYOffset = function (slider, spectrumBounds, detail) {
    return (detail.value().get().y - 0) / 100 * spectrumBounds.height;
  };

  const getPos = function (slider, getOffset, edgeProperty) {
    const spectrum = AlloyParts.getPartOrDie(slider, detail, 'palette');
    const spectrumBounds = spectrum.element().dom().getBoundingClientRect();
    const sliderBounds = slider.element().dom().getBoundingClientRect();

    const offset = getOffset(slider, spectrumBounds, detail);
    return (spectrumBounds[edgeProperty] - sliderBounds[edgeProperty]) + offset;
  };

  const getXPos = function (slider) {
    return getPos(slider, getXOffset, 'left');
  }

  const getYPos = function (slider) {
    return getPos(slider, getYOffset, 'top');
  };

  const refresh = function (component) {
    const thumb = getThumb(component);
    const xPos = getXPos(component);
    const yPos = getYPos(component);
    const thumbRadiusX = Width.get(thumb.element()) / 2;
    const thumbRadiusY = Height.get(thumb.element()) / 2;
    Css.set(thumb.element(), 'left', (xPos - thumbRadiusX) + 'px');
    Css.set(thumb.element(), 'top', (yPos - thumbRadiusY) + 'px');
  };

  const refreshColour = function (component, colour) {
    const palette:any = getPalette(component).element().dom();

    var ctx1 = palette.getContext('2d');
    var width1 = palette.width;
    var height1 = palette.height;

    // var colour = detail.colour().get();
    var rgba = `rgba(${colour.red},${colour.green},${colour.blue},${colour.alpha})`;
    ctx1.fillStyle = rgba;
    ctx1.fillRect(0, 0, width1, height1);
  
    var grdWhite = ctx1.createLinearGradient(0, 0, width1, 0);
    grdWhite.addColorStop(0, 'rgba(255,255,255,1)');
    grdWhite.addColorStop(1, 'rgba(255,255,255,0)');
    ctx1.fillStyle = grdWhite;
    ctx1.fillRect(0, 0, width1, height1);
  
    var grdBlack = ctx1.createLinearGradient(0, 0, 0, height1);
    grdBlack.addColorStop(0, 'rgba(0,0,0,0)');
    grdBlack.addColorStop(1, 'rgba(0,0,0,1)');
    ctx1.fillStyle = grdBlack;
    ctx1.fillRect(0, 0, width1, height1);
  };

  const changeValue = function (component, newValue) {
    const oldValue = detail.value().get();
    const thumb = getThumb(component);
    const edgeProp = 'left';
    // The left check is used so that the first click calls refresh
    if ((oldValue.x !== newValue.x && oldValue.y !== newValue.y ) || 
      (Css.getRaw(thumb.element(), edgeProp).isNone()) || Css.getRaw(thumb.element(), edgeProp).isNone()) {
      detail.value().set(newValue);

      const canvas: HTMLCanvasElement = <HTMLCanvasElement>getPalette(component).element().dom();
      var imageData = canvas.getContext('2d').getImageData(newValue.x, newValue.y, 1, 1).data;
      
      refresh(component);
      detail.onChange()(component, thumb, newValue, imageData);
      return Option.some(true);
    } else {
      return Option.none();
    }
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
                return AlloyParts.getPart(slider, detail, 'palette').map(Keying.focusIn).map(Fun.constant(true));
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
      SketchBehaviours.get(detail.paletteBehaviours())
    ),

    events: AlloyEvents.derive(
      [
        AlloyEvents.run(GradientActions.changeEvent(), function (slider, simulatedEvent) {
          changeValue(slider, simulatedEvent.event().value());
        }),
        AlloyEvents.runOnAttached(function (slider, simulatedEvent) {
          detail.value().set({x: 0, y:0});
          const thumb = getThumb(slider);
          // Call onInit instead of onChange for the first value.
          refresh(slider);
          refreshColour(slider, detail.colour().get());
          detail.onInit()(slider, thumb, detail.value().get());
        })
      ].concat(uiEventsArr)
    ),

    apis: {
      refresh,
      refreshColour
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