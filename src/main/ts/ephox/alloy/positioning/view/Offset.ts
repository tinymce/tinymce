import { Fun } from '@ephox/katamari';
import { Css, Element, Height, Insert, Location, Remove, Width } from '@ephox/sugar';

/* Appends a test div next to the element to measure what the "fixed" bounds are relative to the page */
const measure = function (realEl) {
  const fEl = Element.fromTag('div');

  Css.setAll(fEl, {
    position: 'fixed',
    opacity: '0',
    top: '0',
    left: '0',
    bottom: '0',
    right: '0'
  });

  Insert.prepend(realEl, fEl);

  const position = Location.viewport(fEl);
  const width = Width.get(fEl);
  const height = Height.get(fEl);

  Remove.remove(fEl);

  return {
    top: position.top,
    left: position.left,
    width: Fun.constant(width),
    height: Fun.constant(height)
  };
};

export {
  measure
};