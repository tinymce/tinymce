import { Fun } from '@ephox/katamari';

import * as Styles from '../layout/Styles';

const south = Fun.constant(Styles.resolve('caret-top-align'));
const north = Fun.constant(Styles.resolve('caret-bottom-align'));
const west = Fun.constant(Styles.resolve('caret-right-align'));
const east = Fun.constant(Styles.resolve('caret-left-align'));
const middle = Fun.constant(Styles.resolve('caret-middle-align'));
const all = Fun.constant([ south(), north(), east(), west(), middle() ]);

export {
  east,
  south,
  west,
  north,
  middle,
  all
};