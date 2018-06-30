import { Fun } from '@ephox/katamari';
import { SliderValue, SliderDetail } from '../../ui/types/SliderTypes';
import { min1X, max1X, min1Y, max1Y, halfX, halfY } from './SliderValues';

// Edge Positions going through...
// North West, North, North East, East, South East, South, South West, West

const sliderValue = (x: number, y: number) => {
  return {
    x: Fun.constant(x),
    y: Fun.constant(y)
  }
};

// North West Edge
const topLeft = (detail: SliderDetail): SliderValue => 
  sliderValue(min1X(detail), min1Y(detail));

// North Edge
const top = (detail: SliderDetail): SliderValue => 
  sliderValue(halfX(detail), min1Y(detail));

// North East Edge
const topRight = (detail: SliderDetail): SliderValue =>
  sliderValue(max1X(detail), min1Y(detail));

// East Edge
const right = (detail: SliderDetail): SliderValue => 
  sliderValue(max1X(detail), halfY(detail));

// South East Edge
const bottomRight = (detail: SliderDetail): SliderValue => 
  sliderValue(max1X(detail), max1Y(detail));

// South Edge
const bottom = (detail: SliderDetail): SliderValue => 
  sliderValue(halfX(detail), max1Y(detail));

// South West Edge
const bottomLeft = (detail: SliderDetail): SliderValue => 
  sliderValue(min1X(detail), max1Y(detail));

// West Edge
const left = (detail: SliderDetail): SliderValue => 
  sliderValue(min1X(detail), halfY(detail));

export {
  topLeft,
  top,
  topRight,
  right,
  bottomRight,
  bottom,
  bottomLeft,
  left,
  sliderValue
}