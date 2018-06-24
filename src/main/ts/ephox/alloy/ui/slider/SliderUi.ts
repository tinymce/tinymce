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
import { SliderDetail, SliderSpec, PositionUpdate } from '../../ui/types/SliderTypes';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { ClientRect } from '@ephox/dom-globals';

const isTouch = PlatformDetection.detect().deviceType.isTouch();

const sketch: CompositeSketchFactory<SliderDetail, SliderSpec> = (detail, components, spec, externals) => {
  const getThumb = (component: AlloyComponent): AlloyComponent => {
    return AlloyParts.getPartOrDie(component, detail, 'thumb');
  };
  const getSpectrum = (component: AlloyComponent): AlloyComponent => {
    return AlloyParts.getPartOrDie(component, detail, 'spectrum');
  };

  const getXOffset = (slider: AlloyComponent, spectrumBounds: ClientRect, detail: SliderDetail): number => {
    return SliderModel.findOffsetOfValue(spectrumBounds, detail.minX(), detail.maxX(), detail.value().get().x(), SliderModel.centerX, AlloyParts.getPart(slider, detail, 'left-edge'), AlloyParts.getPart(slider, detail, 'right-edge'), 'left', 'width');
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
  }

  const getYPos = (slider: AlloyComponent): number => {
    return getPos(slider, getYOffset, 'top');
  };

  const refresh = (component: AlloyComponent): void => {
    const thumb = getThumb(component);
    // If you said no to both axes, don't expect any movement /shrug.
    if (detail.axisHorizontal()) {
      const pos = getXPos(component);
      const thumbRadius = Width.get(thumb.element()) / 2;
      Css.set(thumb.element(), 'left', (pos - thumbRadius) + 'px');
    }
    if (detail.axisVertical()) {
      const pos = getYPos(component);
      const thumbRadius = Height.get(thumb.element()) / 2;
      Css.set(thumb.element(), 'top', (pos - thumbRadius) + 'px');
    } 
  };

  const checkX = (oldX, newX, thumb): boolean => {
    return oldX !== newX || Css.getRaw(thumb.element(), 'left').isNone();
  };

  const checkY = (oldY, newY, thumb): boolean => {
    return oldY !== newY || Css.getRaw(thumb.element(), 'top').isNone();
  };

  const changeValue = (component: AlloyComponent, newValue: PositionUpdate): Option<boolean> => {
    const oldValue = detail.value().get();
    const thumb = getThumb(component);
    const updated = newValue.x().fold(() => {
      return newValue.y().fold(() => { // No updates.
          return Option.none();
        }, (newY: number) => {
        if (checkY(oldValue.y(), newY, thumb)) { // Y only update.
          detail.value().set({
            x: Fun.constant(oldValue.x()),
            y: Fun.constant(newY)
          });
          return Option.some(true);
        } else { // No updates.
          return Option.none();
        }
      })
    },
    (newX) => {
      return newValue.y().fold(() => {
        if (checkX(oldValue.x(), newX, thumb)) { // X Only Update
          detail.value().set({
            x: Fun.constant(newX),
            y: Fun.constant(oldValue.y())
          });
          return Option.some(true);
        } else  { // No updates.
          return Option.none();
        }
      }, 
      (newY) => {
        if (checkX(oldValue.x(), newX, thumb)) {
          if (checkY(oldValue.y(), newY, thumb)) { // X And Y Updates
            detail.value().set({
              x: Fun.constant(newX),
              y: Fun.constant(newY)
            });
            return Option.some(true);
          } else { // X Only Update
            detail.value().set({
              x: Fun.constant(newX),
              y: Fun.constant(oldValue.y())
            });
            return Option.some(true);
          }
        } else {
          if (checkY(oldValue.y(), newY, thumb)) { // Y Only Update
            detail.value().set({
              x: Fun.constant(oldValue.x()),
              y: Fun.constant(newY)
            });
            return Option.some(true);
          } else {
            return Option.none(); // No updates
          }
        }
      });
    });

    updated.each((_updated) => {
      refresh(component);
      detail.onChange()(component, thumb, detail);
    });

    return updated;
  };

  const resetToMinX = (slider: AlloyComponent): void => {
    changeValue(slider, {
      x: Fun.constant(Option.some(detail.minX())),
      y: Fun.constant(Option.none())
    });
  };

  const resetToMaxX = (slider: AlloyComponent): void => {
    changeValue(slider, {
      x: Fun.constant(Option.some(detail.maxX())),
      y: Fun.constant(Option.none())
    });
  };

  const resetToMinY = (slider: AlloyComponent): void => {
    changeValue(slider, {
      x: Fun.constant(Option.none()),
      y: Fun.constant(Option.some(detail.minY()))
    });
  };

  const resetToMaxY = (slider: AlloyComponent): void => {
    changeValue(slider, {
      x: Fun.constant(Option.none()),
      y: Fun.constant(Option.some(detail.maxY()))
    });
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
        AlloyEvents.run<CustomEvent>(SliderActions.sliderChangeEvent(), function (slider, simulatedEvent) {
          changeValue(slider, simulatedEvent.event().value());
        }),
        AlloyEvents.runOnAttached((slider, simulatedEvent) => {
          detail.value().set(detail.getInitialValue()());
          const thumb = getThumb(slider);
          const spectrum = getSpectrum(slider);
          // Call onInit instead of onChange for the first value.
          refresh(slider);
          detail.onInit()(slider, thumb, detail);
        })
      ].concat(uiEventsArr)
    ),

    apis: {
      resetToMinX,
      resetToMaxX,
      resetToMinY,
      resetToMaxY,
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