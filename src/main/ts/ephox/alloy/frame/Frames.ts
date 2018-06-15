import { Fun, Option } from '@ephox/katamari';

const walkUp = (navigation, doc) => {
  const frame = navigation.view(doc);
  return frame.fold(Fun.constant([]), (f) => {
    const parent = navigation.owner(f);
    const rest = walkUp(navigation, parent);
    return [f].concat(rest);
  });
};

const pathTo = (element, navigation) => {
  const d = navigation.owner(element);
  const paths = walkUp(navigation, d);
  return Option.some(paths);
};

export {
  pathTo
};