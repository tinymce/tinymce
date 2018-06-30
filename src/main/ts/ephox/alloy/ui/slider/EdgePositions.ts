import { SliderValue, SliderDetail } from '../../ui/types/SliderTypes';
import { min1X, max1X, min1Y, max1Y, halfX, halfY } from './SliderValues';

// Edge Positions going through...
// North West, North, North East, East, South East, South, South West, West

// North West Edge
const topLeft = (detail: SliderDetail): SliderValue => {
  return {
    x: min1X(detail),
    y: min1Y(detail)
  };
};

// North Edge
const top = (detail: SliderDetail): SliderValue => {
  return {
    x: halfX(detail),
    y: min1Y(detail)
  };
};

// North East Edge
const topRight = (detail: SliderDetail): SliderValue => {
  return {
    x: max1X(detail),
    y: min1Y(detail)
  };
};

// East Edge
const right = (detail: SliderDetail): SliderValue => {
  return {
    x: max1X(detail),
    y: halfY(detail)
  };
};

// South East Edge
const bottomRight = (detail: SliderDetail): SliderValue => {
  return {
    x: max1X(detail),
    y: max1Y(detail)
  };
};

// South Edge
const bottom = (detail: SliderDetail): SliderValue => {
  return {
    x: halfX(detail),
    y: max1Y(detail)
  };
};

// South West Edge
const bottomLeft = (detail: SliderDetail): SliderValue => {
  return {
    x: min1X(detail),
    y: max1Y(detail)
  };
};

// West Edge
const left = (detail: SliderDetail): SliderValue => {
  return {
    x: min1X(detail),
    y: halfY(detail)
  };
};

export {
  topLeft,
  top,
  topRight,
  right,
  bottomRight,
  bottom,
  bottomLeft,
  left
}