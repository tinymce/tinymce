import { ClientRect, MouseEvent, Touch, TouchEvent, XMLDocument } from '@ephox/dom-globals';
import { Option, Fun } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { Position } from '@ephox/sugar';

import { SugarPosition } from '../../alien/TypeDefinitions';
import { AlloyComponent } from '../../api/component/ComponentApi';
import * as AlloyTriggers from '../../api/events/AlloyTriggers';
import { NativeSimulatedEvent } from '../../events/SimulatedEvent';
import { PositionUpdate, SliderDetail } from '../../ui/types/SliderTypes';
import * as SliderModel from './SliderModel';

const _sliderChangeEvent = 'slider.change.value';

const isTouch = PlatformDetection.detect().deviceType.isTouch();

const getEventSource = (simulatedEvent: NativeSimulatedEvent): Option<SugarPosition> => {
  const evt = simulatedEvent.event().raw();
  if (isTouch) {
    const touchEvent = evt as TouchEvent;
    return touchEvent.touches !== undefined && touchEvent.touches.length === 1 ?
      Option.some(touchEvent.touches[0]).map((t: Touch) => {
        return Position(t.clientX, t.clientY) as SugarPosition;
      }) : Option.none();
  } else {
    const mouseEvent = evt as MouseEvent;
    return mouseEvent.clientX !== undefined ? Option.some(mouseEvent).map((me) => {
      return Position(me.clientX, me.clientY) as SugarPosition;
    }) : Option.none();
  }
};

const getEventX = (simulatedEvent: NativeSimulatedEvent): Option<number> => {
  const spot = getEventSource(simulatedEvent);
  return spot.map(function (s) {
    return s.left();
  });
};

const getEventY = (simulatedEvent: NativeSimulatedEvent): Option<number> => {
  const spot = getEventSource(simulatedEvent);
  return spot.map(function (s) {
    return s.top();
  });
};

const fireSliderChange = (component: AlloyComponent, value: PositionUpdate): void => {
  AlloyTriggers.emitWith(component, _sliderChangeEvent, { value });
};

const moveRightFromLedge = (ledge: AlloyComponent, detail: SliderDetail): void => {
  fireSliderChange(ledge, {
    x: Fun.constant(Option.some(detail.minX())),
    y: Fun.constant(Option.none())
  });
};

const moveLeftFromRedge = (redge: AlloyComponent, detail: SliderDetail): void => {
  fireSliderChange(redge, {
    x: Fun.constant(Option.some(detail.maxX())),
    y: Fun.constant(Option.none())
  });
};

const moveDownFromTedge = (ledge: AlloyComponent, detail: SliderDetail): void => {
  fireSliderChange(ledge, {
    x: Fun.constant(Option.none()),
    y: Fun.constant(Option.some(detail.minX()))
  });
};

const moveUpFromBedge = (redge: AlloyComponent, detail: SliderDetail): void => {
  fireSliderChange(redge, {
    x: Fun.constant(Option.none()),
    y: Fun.constant(Option.some(detail.maxX()))
  });
};

const moveDownFromTLedge = (ledge: AlloyComponent, detail: SliderDetail): void => {
  fireSliderChange(ledge, {
    x: Fun.constant(Option.some(detail.minX() - 1)),
    y: Fun.constant(Option.none())
  });
};

const moveRightFromTLedge = (ledge: AlloyComponent, detail: SliderDetail): void => {
  fireSliderChange(ledge, {
    x: Fun.constant(Option.none()),
    y: Fun.constant(Option.some(detail.minX() - 1))
  });
};

const moveDownRightFromTLedge = (ledge: AlloyComponent, detail: SliderDetail): void => {
  fireSliderChange(ledge, {
    x: Fun.constant(Option.some(detail.minX())),
    y: Fun.constant(Option.some(detail.minX()))
  });
};

const moveDownFromTRedge = (redge: AlloyComponent, detail: SliderDetail): void => {
  fireSliderChange(redge, {
    x: Fun.constant(Option.some(detail.maxX() + 1)),
    y: Fun.constant(Option.none())
  });
};

const moveLeftFromTRedge = (redge: AlloyComponent, detail: SliderDetail): void => {
  fireSliderChange(redge, {
    x: Fun.constant(Option.none()),
    y: Fun.constant(Option.some(detail.maxX() + 1))
  });
};

const moveDownLeftFromTRedge = (redge: AlloyComponent, detail: SliderDetail): void => {
  fireSliderChange(redge, {
    x: Fun.constant(Option.some(detail.maxX())),
    y: Fun.constant(Option.some(detail.maxX()))
  });
};

const moveUpFromBLedge = (redge: AlloyComponent, detail: SliderDetail): void => {
  fireSliderChange(redge, {
    x: Fun.constant(Option.some(detail.minX() - 1)),
    y: Fun.constant(Option.none())
  });
};

const moveRightFromBLedge = (redge: AlloyComponent, detail: SliderDetail): void => {
  fireSliderChange(redge, {
    x: Fun.constant(Option.none()),
    y: Fun.constant(Option.some(detail.maxX() + 1))
  });
};

const moveUpRightFromBLedge = (redge: AlloyComponent, detail: SliderDetail): void => {
  fireSliderChange(redge, {
    x: Fun.constant(Option.some(detail.minX())),
    y: Fun.constant(Option.some(detail.maxX()))
  });
};

const moveUpFromBRedge = (redge: AlloyComponent, detail: SliderDetail): void => {
  fireSliderChange(redge, {
    x: Fun.constant(Option.some(detail.maxX() + 1)),
    y: Fun.constant(Option.none())
  });
};

const moveLeftFromBRedge = (redge: AlloyComponent, detail: SliderDetail): void => {
  fireSliderChange(redge, {
    x: Fun.constant(Option.none()),
    y: Fun.constant(Option.some(detail.maxX() + 1))
  });
};

const moveUpLeftFromBRedge = (redge: AlloyComponent, detail: SliderDetail): void => {
  fireSliderChange(redge, {
    x: Fun.constant(Option.some(detail.maxX())),
    y: Fun.constant(Option.some(detail.maxX()))
  });
};

const setToLedge = (ledge: AlloyComponent, bounds: ClientRect, detail: SliderDetail): void => {
  fireSliderChange(ledge, {
    x: Fun.constant(Option.some(detail.minX() - 1)),
    y: Fun.constant(Option.some(SliderModel.halfY(bounds, detail.minY(), detail.maxY(), detail.stepSize(), detail.snapToGrid(), detail.snapStart(), detail.rounded())))
  });
};

const setToRedge = (redge: AlloyComponent, bounds: ClientRect, detail: SliderDetail): void => {
  fireSliderChange(redge, 
    {
      x: Fun.constant(Option.some(detail.maxX() + 1)),
      y: Fun.constant(Option.some(SliderModel.halfY(bounds, detail.minY(), detail.maxY(), detail.stepSize(), detail.snapToGrid(), detail.snapStart(), detail.rounded())))
    });
};

const setToTedge = (tedge: AlloyComponent, bounds: ClientRect, detail: SliderDetail): void => {
  fireSliderChange(tedge, 
    {
      x: Fun.constant(Option.some(SliderModel.halfX(bounds, detail.minX(), detail.maxX(), detail.stepSize(), detail.snapToGrid(), detail.snapStart(), detail.rounded()))),
      y: Fun.constant(Option.some(detail.minX() - 1))
    });
};

const setToBedge = (bedge: AlloyComponent, bounds: ClientRect, detail: SliderDetail): void => {
  fireSliderChange(bedge, 
    {
      x: Fun.constant(Option.some(SliderModel.halfX(bounds, detail.minX(), detail.maxX(), detail.stepSize(), detail.snapToGrid(), detail.snapStart(), detail.rounded()))),
      y: Fun.constant(Option.some(detail.maxX() + 1))
    });
};

const setToTLedge = (tledge: AlloyComponent, bounds: ClientRect, detail: SliderDetail): void => {
  fireSliderChange(tledge, 
    {
      x: Fun.constant(Option.some(detail.minX() - 1)),
      y: Fun.constant(Option.some(detail.minY() - 1))
    });
};

const setToTRedge = (tredge: AlloyComponent, _bounds: ClientRect, detail: SliderDetail): void => {
  fireSliderChange(tredge, 
    {
      x: Fun.constant(Option.some(detail.maxX() + 1)),
      y: Fun.constant(Option.some(detail.minY() - 1))
    });
};

const setToBLedge = (bledge: AlloyComponent, _bounds: ClientRect, detail: SliderDetail): void => {
  fireSliderChange(bledge, 
    {
      x: Fun.constant(Option.some(detail.minX() - 1)),
      y: Fun.constant(Option.some(detail.maxY() + 1))
    });
};

const setToBRedge = (bredge: AlloyComponent, _bounds: ClientRect, detail: SliderDetail): void => {
  fireSliderChange(bredge, 
    {
      x: Fun.constant(Option.some(detail.maxX() + 1)),
      y: Fun.constant(Option.some(detail.maxY() + 1))
    });
};

const hasEdge = (detail: SliderDetail, edgeName: string): boolean => {
  return detail[edgeName + '-edge'] !== null;
}

const setToX = (spectrum: AlloyComponent, spectrumBounds: ClientRect, detail: SliderDetail, xValue: number): void => {
  const hasLedge = hasEdge(detail, 'left');
  const hasRedge = hasEdge(detail, 'right');
  const value = SliderModel.findValueOfX(
    spectrumBounds, detail.minX(), detail.maxX(), xValue, detail.stepSize(), 
      detail.snapToGrid(), detail.snapStart(), detail.rounded(), hasLedge, hasRedge
  );

  fireSliderChange(spectrum, {
    x: Fun.constant(Option.some(value)),
    y: Fun.constant(Option.none())
  });
};

const setToY = (spectrum: AlloyComponent, spectrumBounds: ClientRect, detail: SliderDetail, yValue: number): void => {
  const hasLedge = hasEdge(detail, 'top');
  const hasRedge = hasEdge(detail, 'bottom');
  const value = SliderModel.findValueOfY(
    spectrumBounds, detail.minY(), detail.maxY(), yValue, detail.stepSize(), 
      detail.snapToGrid(), detail.snapStart(), detail.rounded(), hasLedge, hasRedge
  );

  fireSliderChange(spectrum, {
    x: Fun.constant(Option.none()),
    y: Fun.constant(Option.some(value))
  });
};

const setToCoords = (spectrum: AlloyComponent, spectrumBounds: ClientRect, detail: SliderDetail, coords: SugarPosition): void => {
  const hasLedge = hasEdge(detail, 'left');
  const hasRedge = hasEdge(detail, 'right');
  const hasTedge = hasEdge(detail, 'top');
  const hasBedge = hasEdge(detail, 'bottom');
  const xValue = SliderModel.findValueOfX(
    spectrumBounds, detail.minX(), detail.maxX(), coords.left(), detail.stepSize(), 
      detail.snapToGrid(), detail.snapStart(), detail.rounded(), hasLedge, hasRedge
  );

  const yValue = SliderModel.findValueOfY(
    spectrumBounds, detail.minY(), detail.maxY(), coords.top(), detail.stepSize(), 
      detail.snapToGrid(), detail.snapStart(), detail.rounded(), hasTedge, hasBedge
  );
  fireSliderChange(spectrum, {
    x: Fun.constant(Option.some(xValue)),
    y: Fun.constant(Option.some(yValue))
  });
};

const setXFromEvent = (spectrum: AlloyComponent, detail: SliderDetail, spectrumBounds: ClientRect, simulatedEvent: NativeSimulatedEvent): Option<number> => {
  return getEventX(simulatedEvent).map(function (xValue) {
    setToX(spectrum, spectrumBounds, detail, xValue);
    return xValue;
  });
};

const setYFromEvent = (spectrum: AlloyComponent, detail: SliderDetail, spectrumBounds: ClientRect, simulatedEvent: NativeSimulatedEvent): Option<number> => {
  return getEventY(simulatedEvent).map(function (yValue) {
    setToY(spectrum, spectrumBounds, detail, yValue);
    return yValue;
  });
};

const setCoordsFromEvent = (spectrum: AlloyComponent, detail: SliderDetail, spectrumBounds: ClientRect, simulatedEvent: NativeSimulatedEvent): Option<SugarPosition> => {
  return getEventSource(simulatedEvent).map(function (coords) {
    setToCoords(spectrum, spectrumBounds, detail, coords);
    return coords;
  });
};

const moveRight = (spectrum: AlloyComponent, detail: SliderDetail): void => {
  const newValue = SliderModel.increaseBy(detail.value().get().x(), detail.minX(), detail.maxX(), detail.stepSize());
  fireSliderChange(spectrum, {
    x: Fun.constant(Option.some(newValue)),
    y: Fun.constant(Option.none())
  });
};

const moveLeft = (spectrum: AlloyComponent, detail: SliderDetail): void => {
  const newValue = SliderModel.reduceBy(detail.value().get().x(), detail.minX(), detail.maxX(), detail.stepSize());
  fireSliderChange(spectrum, {
    x: Fun.constant(Option.some(newValue)),
    y: Fun.constant(Option.none())
  });
};

const moveDown = (spectrum: AlloyComponent, detail: SliderDetail): void => {
  const newValue = SliderModel.increaseBy(detail.value().get().y(), detail.minY(), detail.maxY(), detail.stepSize());
  fireSliderChange(spectrum, {
    x: Fun.constant(Option.none()),
    y: Fun.constant(Option.some(newValue))
  });
};

const moveUp = (spectrum: AlloyComponent, detail: SliderDetail): void => {
  const newValue = SliderModel.reduceBy(detail.value().get().y(), detail.minY(), detail.maxY(), detail.stepSize());
  fireSliderChange(spectrum, {
    x: Fun.constant(Option.none()),
    y: Fun.constant(Option.some(newValue))
  });
};

const moveDownRight = (spectrum: AlloyComponent, detail: SliderDetail): void => {
  const newXValue = SliderModel.increaseBy(detail.value().get().x(), detail.minX(), detail.maxX(), detail.stepSize());
  const newYValue = SliderModel.increaseBy(detail.value().get().y(), detail.minY(), detail.maxY(), detail.stepSize());
  fireSliderChange(spectrum, {
    x: Fun.constant(Option.some(newXValue)),
    y: Fun.constant(Option.some(newYValue))
  });
};

const moveDownLeft = (spectrum: AlloyComponent, detail: SliderDetail): void => {
  const newXValue = SliderModel.reduceBy(detail.value().get().x(), detail.minX(), detail.maxX(), detail.stepSize());
  const newYValue = SliderModel.increaseBy(detail.value().get().y(), detail.minY(), detail.maxY(), detail.stepSize());
  fireSliderChange(spectrum, {
    x: Fun.constant(Option.some(newXValue)),
    y: Fun.constant(Option.some(newYValue))
  });
};

const moveUpRight = (spectrum: AlloyComponent, detail: SliderDetail): void => {
  const newXValue = SliderModel.increaseBy(detail.value().get().x(), detail.minX(), detail.maxX(), detail.stepSize());
  const newYValue = SliderModel.reduceBy(detail.value().get().y(), detail.minY(), detail.maxY(), detail.stepSize());
  fireSliderChange(spectrum, {
    x: Fun.constant(Option.some(newXValue)),
    y: Fun.constant(Option.some(newYValue))
  });
};

const moveUpLeft = (spectrum: AlloyComponent, detail: SliderDetail): void => {
  const newXValue = SliderModel.reduceBy(detail.value().get().x(), detail.minX(), detail.maxX(), detail.stepSize());
  const newYValue = SliderModel.reduceBy(detail.value().get().y(), detail.minY(), detail.maxY(), detail.stepSize());
  fireSliderChange(spectrum, {
    x: Fun.constant(Option.some(newXValue)),
    y: Fun.constant(Option.some(newYValue))
  });
};

const sliderChangeEvent = Fun.constant(_sliderChangeEvent);

export {
  setXFromEvent,
  setYFromEvent,
  setCoordsFromEvent,
  setToLedge,
  setToRedge,
  setToTedge,
  setToBedge,
  setToTLedge,
  setToTRedge,
  setToBLedge,
  setToBRedge,
  moveLeftFromRedge,
  moveRightFromLedge,
  moveRight,
  moveLeft,
  moveDown,
  moveUp,
  moveDownRight,
  moveDownLeft,
  moveUpRight,
  moveUpLeft,
  sliderChangeEvent
};