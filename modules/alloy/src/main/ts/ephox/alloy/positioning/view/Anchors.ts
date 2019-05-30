import { Fun } from '@ephox/katamari';

import * as Styles from '../layout/Styles';

const south: () => string = Fun.constant(Styles.resolve('caret-top-align'));
const north: () => string = Fun.constant(Styles.resolve('caret-bottom-align'));
const west: () => string = Fun.constant(Styles.resolve('caret-right-align'));
const east: () => string = Fun.constant(Styles.resolve('caret-left-align'));
const middle: () => string = Fun.constant(Styles.resolve('caret-middle-align'));
const all: () => string[] = Fun.constant([ south(), north(), east(), west(), middle() ]);

export {
  east,
  south,
  west,
  north,
  middle,
  all
};