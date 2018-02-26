import { Fun, Option } from '@ephox/katamari';

const walkUp = function (navigation, doc) {
  const frame = navigation.view(doc);
  return frame.fold(Fun.constant([]), function (f) {
    const parent = navigation.owner(f);
    const rest = walkUp(navigation, parent);
    return [f].concat(rest);
  });
};

const pathTo = function (element, navigation) {
  const d = navigation.owner(element);
  const paths = walkUp(navigation, d);
  return Option.some(paths);
};

export {
  pathTo
};