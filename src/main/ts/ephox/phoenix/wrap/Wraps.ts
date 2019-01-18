import { Fun } from '@ephox/katamari';



export default function (universe, item) {
  var wrap = function (contents) {
    universe.insert().append(item, contents);
  };

  return {
    element: Fun.constant(item),
    wrap: wrap
  };
};